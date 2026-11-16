import type { ErrorEnvelope, SimulationInput, SimulationOutput } from '../types/kinera';
import type { WorkerMessageType, WorkerRequest, WorkerResponse } from './sim.worker';

interface PendingRequest {
  channel: string;
  resolve: (value: WorkerResponse) => void;
  reject: (reason: ErrorEnvelope) => void;
}

class SimulationClient {
  private worker: Worker | null = null;
  private reqCounter = 0;
  private pending = new Map<string, PendingRequest>();
  private latestByChannel = new Map<string, string>();
  public wasmStatus: 'uninitialized' | 'ready' | 'degraded' = 'uninitialized';
  public lastError: string | null = null;

  private ensureWorker(): Worker {
    if (this.worker) return this.worker;
    if (typeof Worker === 'undefined') {
      throw new Error('Web Workers are unavailable in this environment.');
    }
    const w = new Worker(new URL('./sim.worker.ts', import.meta.url), { type: 'module' });
    w.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const resp = event.data;
      const entry = this.pending.get(resp.requestId);
      if (!entry) return;
      this.pending.delete(resp.requestId);
      if (resp.status === 'CANCELLED') {
        entry.resolve(resp);
        return;
      }
      if (resp.status === 'ERROR') {
        entry.reject(resp.payload as ErrorEnvelope);
        return;
      }
      entry.resolve(resp);
    };
    w.onerror = (err) => {
      this.wasmStatus = 'degraded';
      this.lastError = err.message || 'Simulation Web Worker terminated unexpectedly.';
      for (const [, entry] of this.pending) {
        entry.reject({
          error: {
            code: 'ERR_WORKER_CRASHED',
            category: 'WORKER',
            message: this.lastError,
            recoverable: true,
          },
        });
      }
      this.pending.clear();
      this.worker?.terminate();
      this.worker = null;
    };
    this.worker = w;
    return w;
  }

  public async init(): Promise<void> {
    try {
      await this.dispatch('INIT_WASM', 'init', {});
      this.wasmStatus = 'ready';
      this.lastError = null;
    } catch (err) {
      this.wasmStatus = 'degraded';
      this.lastError =
        err instanceof Error
          ? err.message
          : (err as ErrorEnvelope)?.error?.message ?? 'Failed to initialize Rust/WASM simulation core.';
      throw err;
    }
  }

  public async dispatch(
    type: WorkerMessageType,
    channel: string,
    payload: unknown,
  ): Promise<WorkerResponse> {
    const worker = this.ensureWorker();
    const prevId = this.latestByChannel.get(channel);
    if (prevId && this.pending.has(prevId)) {
      worker.postMessage({
        requestId: `cancel-${prevId}`,
        type: 'CANCEL_REQUEST',
        schemaVersion: '1.0.0',
        payload: { targetRequestId: prevId },
      } satisfies WorkerRequest);
    }

    this.reqCounter += 1;
    const requestId = `req-${this.reqCounter.toString().padStart(6, '0')}`;
    this.latestByChannel.set(channel, requestId);

    return new Promise<WorkerResponse>((resolve, reject) => {
      this.pending.set(requestId, { channel, resolve, reject });
      worker.postMessage({
        requestId,
        type,
        schemaVersion: '1.0.0',
        payload,
      } satisfies WorkerRequest);
    });
  }

  public async evaluatePowertrain(input: SimulationInput): Promise<{ output: SimulationOutput; durationMs: number }> {
    const resp = await this.dispatch('EVALUATE_POWERTRAIN_SINGLE', 'powertrain', input);
    if (resp.status === 'CANCELLED') {
      throw { error: { code: 'CANCELLED', category: 'WORKER', message: 'Superseded', recoverable: true } } satisfies ErrorEnvelope;
    }
    this.wasmStatus = 'ready';
    return { output: resp.payload as SimulationOutput, durationMs: resp.durationMs };
  }

  public async runDynamics(input: SimulationInput): Promise<{ output: SimulationOutput; durationMs: number }> {
    const resp = await this.dispatch('RUN_DYNAMICS_SIMULATION', 'dynamics', input);
    if (resp.status === 'CANCELLED') {
      throw { error: { code: 'CANCELLED', category: 'WORKER', message: 'Superseded', recoverable: true } } satisfies ErrorEnvelope;
    }
    this.wasmStatus = 'ready';
    return { output: resp.payload as SimulationOutput, durationMs: resp.durationMs };
  }

  public async runBenchmark(input: SimulationInput): Promise<{ output: SimulationOutput; durationMs: number }> {
    const resp = await this.dispatch('RUN_PERFORMANCE_BENCHMARK', 'benchmark', input);
    if (resp.status === 'CANCELLED') {
      throw { error: { code: 'CANCELLED', category: 'WORKER', message: 'Superseded', recoverable: true } } satisfies ErrorEnvelope;
    }
    this.wasmStatus = 'ready';
    return { output: resp.payload as SimulationOutput, durationMs: resp.durationMs };
  }

  public async runComparison(input: SimulationInput): Promise<{ output: SimulationOutput; durationMs: number }> {
    const resp = await this.dispatch('RUN_CONFIGURATION_COMPARISON', 'comparison', input);
    if (resp.status === 'CANCELLED') {
      throw { error: { code: 'CANCELLED', category: 'WORKER', message: 'Superseded', recoverable: true } } satisfies ErrorEnvelope;
    }
    this.wasmStatus = 'ready';
    return { output: resp.payload as SimulationOutput, durationMs: resp.durationMs };
  }
}

export const simulationClient = new SimulationClient();
