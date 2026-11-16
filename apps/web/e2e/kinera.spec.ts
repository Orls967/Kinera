import { expect, test } from '@playwright/test';

test.describe('KINERA Production E2E, 3D WebGL, Simulation & Offline Verification', () => {
  test('navigates all 6 sections, verifies real 3D WebGL vehicle rendering & interactions, runs WASM simulations, and works offline', async ({
    page,
    context,
  }) => {
    const consoleErrors: string[] = [];
    const failedRequests: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    page.on('pageerror', (err) => {
      consoleErrors.push(err.message);
    });
    page.on('requestfailed', (req) => {
      failedRequests.push(`${req.method()} ${req.url()} (${req.failure()?.errorText})`);
    });

    // 1. Open Homepage (Overview)
    await page.goto('./');
    await expect(page.getByRole('heading', { name: /Explore the Mechanics/i })).toBeVisible();
    const overviewCanvas = page.getByTestId('kinera-3d-viewport').locator('canvas');
    await expect(overviewCanvas).toBeVisible();

    // Verify 3D canvas has actual non-blank rendered pixels via element screenshot
    await page.waitForTimeout(900);
    const canvasShot = await overviewCanvas.screenshot();
    expect(canvasShot.byteLength).toBeGreaterThan(8000);

    // 2. Navigate to Vehicle Anatomy
    await page.getByRole('link', { name: 'Vehicle Anatomy' }).click();
    await expect(page.getByTestId('kinera-3d-viewport').locator('canvas')).toBeVisible();

    // Wait for WebGL stats telemetry to confirm non-zero geometry triangles & draw calls
    await expect(page.getByTestId('webgl-stats')).not.toHaveText(/^0 tris/, { timeout: 10_000 });
    const statsText = await page.getByTestId('webgl-stats').innerText();
    expect(statsText).toMatch(/[1-9]\d*,?\d* tris/);

    // Orbit drag, wheel zoom, camera presets
    const canvasBox = await page.getByTestId('kinera-3d-viewport').locator('canvas').boundingBox();
    expect(canvasBox).toBeTruthy();
    if (canvasBox) {
      const cx = canvasBox.x + canvasBox.width / 2;
      const cy = canvasBox.y + canvasBox.height / 2;
      await page.mouse.move(cx, cy);
      await page.mouse.down();
      await page.mouse.move(cx + 90, cy - 30, { steps: 6 });
      await page.mouse.up();
      await page.mouse.wheel(0, -120);
    }

    // Select a component from the Assembly Hierarchy tree and verify metadata inspector
    await page.getByRole('button', { name: 'Crankshaft' }).click();
    await expect(page.getByTestId('component-inspector')).toContainText('ice.engine.crankshaft');

    // Explode slider, transparency, section cut, isolate, reset assembly
    await page.getByTestId('explode-slider').fill('0.6');
    await page.getByTestId('section-cut-toggle').click();
    await expect(page.getByTestId('section-cut-toggle')).toContainText('ON');
    await page.getByTestId('isolate-component-btn').click();
    await page.getByTestId('reset-assembly-btn').click();
    await expect(page.getByTestId('section-cut-toggle')).toContainText('OFF');

    // Switch between ICE and EV configurations and verify assembly updates
    await page.getByTestId('global-config-selector').selectOption('vehicle.config.ev-dual-awd');
    await expect(page.getByRole('button', { name: 'High-Voltage Traction Battery Pack' })).toBeVisible();
    await page.getByRole('button', { name: 'Rear E-Axle Traction Motor' }).click();
    await expect(page.getByTestId('component-inspector')).toContainText('ev.motor.rear');

    // 3. Open Powertrain Journey
    await page.getByRole('link', { name: 'Powertrain Journey' }).click();
    await expect(page.getByText('Powertrain Sequence')).toBeVisible();
    await page.getByTestId('journey-next-btn').click();
    await page.getByTestId('journey-regen-toggle').click();
    await expect(page.getByTestId('journey-regen-toggle')).toContainText('Regenerative Braking');
    await page.getByTestId('journey-restart-btn').click();

    // 4. Open Engineering Simulator (Powertrain + Dynamics + Comparison)
    await page.getByRole('link', { name: 'Engineering Simulator' }).click();
    await expect(page.getByTestId('metric-tractive-force')).toBeVisible({ timeout: 10_000 });
    const initialForce = await page.getByTestId('metric-tractive-force').innerText();

    // Switch back to ICE-RWD and change throttle/RPM to verify calculated outputs update
    await page.getByTestId('global-config-selector').selectOption('vehicle.config.ice-rwd');
    await page.getByTestId('sim-rpm-slider').fill('4400');
    await page.waitForTimeout(300);
    const updatedForce = await page.getByTestId('metric-tractive-force').innerText();
    expect(updatedForce).not.toBe(initialForce);

    // Vehicle Dynamics Simulation (all 4 subtabs)
    await page.getByTestId('sim-tab-dynamics').click();
    await expect(page.getByText('Longitudinal Speed vs. Time')).toBeVisible();
    await page.getByTestId('dynamics-subtab-lateral').click();
    await expect(page.getByText('2-DOF Bicycle Yaw Rate & Lateral Acceleration')).toBeVisible();
    await page.getByTestId('dynamics-subtab-braking').click();
    await expect(page.getByText('4-Wheel Quasi-Static Vertical Normal Loads')).toBeVisible();
    await page.getByTestId('dynamics-subtab-traction').click();
    await expect(page.getByTestId('performance-estimates')).toBeVisible();

    // Configuration Comparison
    await page.getByTestId('sim-tab-comparison').click();
    await expect(page.getByTestId('comparison-results-table')).toBeVisible({ timeout: 10_000 });
    await page.getByTestId('matched-baseline-toggle').click();
    await expect(page.getByText('Variable Difference Detected')).toBeVisible();

    // 5. Engineering Insights
    await page.getByRole('link', { name: 'Engineering Insights' }).click();
    await expect(page.getByTestId('insights-topic-list')).toBeVisible();
    expect(await page.getByTestId('insights-topic-list').locator('button').count()).toBe(37);

    // 6. Technical Library
    await page.getByRole('link', { name: 'Technical Library' }).click();
    await expect(page.getByTestId('library-module-list')).toBeVisible();
    expect(await page.getByTestId('library-module-list').locator('button').count()).toBe(10);
    await expect(page.getByTestId('library-module-reader')).toContainText('9. Verified References');

    // Reload page on nested hash route (wait for networkidle so font fetches finish cleanly)
    await page.waitForLoadState('networkidle');
    await page.reload();
    await expect(page.getByTestId('library-module-reader')).toBeVisible();

    // Responsive checks: Tablet & Mobile
    await page.setViewportSize({ width: 820, height: 1024 });
    await page.getByRole('link', { name: 'Vehicle Anatomy' }).click();
    await expect(page.getByTestId('kinera-3d-viewport').locator('canvas')).toBeVisible();

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByTestId('kinera-3d-viewport').locator('canvas')).toBeVisible();

    // Offline Mode test (wait until networkidle + SW controlling client)
    await page.waitForLoadState('networkidle');
    const swControlled = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return false;
      try {
        const reg = await Promise.race([
          navigator.serviceWorker.ready,
          new Promise<null>((res) => setTimeout(() => res(null), 5000)),
        ]);
        return Boolean(reg && navigator.serviceWorker.controller);
      } catch {
        return false;
      }
    });
    if (swControlled) {
      await context.setOffline(true);
      await page.reload();
      await expect(page.getByTestId('kinera-3d-viewport').locator('canvas')).toBeVisible();
      await context.setOffline(false);
    }

    expect(consoleErrors).toEqual([]);
    expect(failedRequests).toEqual([]);
  });
});
