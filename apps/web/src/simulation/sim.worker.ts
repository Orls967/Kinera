import initWasm, {
  evaluate_powertrain_single,
  get_engine_metadata,
  run_configuration_comparison,
  run_dynamics_simulation,
  run_performance_benchmark,
  validate_configuration_json,
} from '../wasm-pkg/kinera_wasm';
import wasmUrl from '../wasm-pkg/kinera_wasm_bg.wasm?url';
import type { ErrorEnvelope } from '../types/kinera';

export type WorkerMessageType =
  | 'INIT_WASM'
  | 'VALIDATE_CONFIGURATION'
  | 'EVALUATE_POWERTRAIN_SINGLE'
  | 'RUN_DYNAMICS_SIMULATION'
  | 'RUN_PERFORMANCE_BENCHMARK'
  | 'RUN_CONFIGURATION_COMPARISON'
  | 'CANCEL_REQUEST';

export interface WorkerRequest {
  requestId: string;
  type: WorkerMessageType;
  schemaVersion: string;
  payload: unknown;
}

export interface WorkerResponse {
  requestId: string;
  status: 'OK' | 'ERROR' | 'CANCELLED';
  durationMs: number;
  engineVersion: string;
  payload: unknown;
}

let wasmReady = false;
let initPromise: Promise<void> | null = null;
const cancelledIds = new Set<string>();

async function ensureWasmInitialized(): Promise<void> {
  if (wasmReady) return;
  if (!initPromise) {
    initPromise = (async () => {
      await initWasm({ module_or_path: wasmUrl });
      wasmReady = true;
    })();
  }
  await initPromise;
}

function makeWorkerError(code: string, message: string): ErrorEnvelope {
  return {
    error: {
      code,
      category: 'WORKER',
      message,
      recoverable: true,
    },
  };
}

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const req = event.data;
  const start = performance.now();

  if (req.type === 'CANCEL_REQUEST') {
    const targetId = (req.payload as { targetRequestId?: string } | null)?.targetRequestId;
    if (targetId) cancelledIds.add(targetId);
    return;
  }

  if (cancelledIds.has(req.requestId)) {
    cancelledIds.delete(req.requestId);
    const resp: WorkerResponse = {
      requestId: req.requestId,
      status: 'CANCELLED',
      durationMs: performance.now() - start,
      engineVersion: '1.0.0',
      payload: null,
    };
    self.postMessage(resp);
    return;
  }

  try {
    await ensureWasmInitialized();
    let rawJson = '';
    const payloadStr =
      typeof req.payload === 'string' ? req.payload : JSON.stringify(req.payload ?? {});

    switch (req.type) {
      case 'INIT_WASM':
        rawJson = get_engine_metadata();
        break;
      case 'VALIDATE_CONFIGURATION':
        rawJson = validate_configuration_json(payloadStr);
        break;
      case 'EVALUATE_POWERTRAIN_SINGLE':
        rawJson = evaluate_powertrain_single(payloadStr);
        break;
      case 'RUN_DYNAMICS_SIMULATION':
        rawJson = run_dynamics_simulation(payloadStr);
        break;
      case 'RUN_PERFORMANCE_BENCHMARK':
        rawJson = run_performance_benchmark(payloadStr);
        break;
      case 'RUN_CONFIGURATION_COMPARISON':
        rawJson = run_configuration_comparison(payloadStr);
        break;
      default: {
        const resp: WorkerResponse = {
          requestId: req.requestId,
          status: 'ERROR',
          durationMs: performance.now() - start,
          engineVersion: '1.0.0',
          payload: makeWorkerError('ERR_WORKER_UNKNOWN_TYPE', `Unsupported message type: ${req.type}`),
        };
        self.postMessage(resp);
        return;
      }
    }

    const parsed = JSON.parse(rawJson) as Record<string, unknown>;
    const isErr = typeof parsed === 'object' && parsed !== null && 'error' in parsed;

    const resp: WorkerResponse = {
      requestId: req.requestId,
      status: isErr ? 'ERROR' : 'OK',
      durationMs: performance.now() - start,
      engineVersion: '1.0.0',
      payload: parsed,
    };
    self.postMessage(resp);
  } catch (err) {
    const resp: WorkerResponse = {
      requestId: req.requestId,
      status: 'ERROR',
      durationMs: performance.now() - start,
      engineVersion: '1.0.0',
      payload: makeWorkerError(
        'ERR_WASM_EXECUTION',
        err instanceof Error ? err.message : 'WASM Worker execution failed',
      ),
    };
    self.postMessage(resp);
  }
};
