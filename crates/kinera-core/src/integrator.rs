pub fn rk4_step<F>(state: [f64; 2], dt: f64, deriv: F) -> [f64; 2]
where
    F: Fn([f64; 2]) -> [f64; 2],
{
    let k1 = deriv(state);
    let k2 = deriv([state[0] + 0.5 * dt * k1[0], state[1] + 0.5 * dt * k1[1]]);
    let k3 = deriv([state[0] + 0.5 * dt * k2[0], state[1] + 0.5 * dt * k2[1]]);
    let k4 = deriv([state[0] + dt * k3[0], state[1] + dt * k3[1]]);
    [
        state[0] + (dt / 6.0) * (k1[0] + 2.0 * k2[0] + 2.0 * k3[0] + k4[0]),
        state[1] + (dt / 6.0) * (k1[1] + 2.0 * k2[1] + 2.0 * k3[1] + k4[1]),
    ]
}

pub fn rk4_step_vec<F>(state: &[f64], dt: f64, deriv: F) -> Vec<f64>
where
    F: Fn(&[f64]) -> Vec<f64>,
{
    let n = state.len();
    let k1 = deriv(state);
    let mut s2 = Vec::with_capacity(n);
    for i in 0..n {
        s2.push(state[i] + 0.5 * dt * k1[i]);
    }
    let k2 = deriv(&s2);
    let mut s3 = Vec::with_capacity(n);
    for i in 0..n {
        s3.push(state[i] + 0.5 * dt * k2[i]);
    }
    let k3 = deriv(&s3);
    let mut s4 = Vec::with_capacity(n);
    for i in 0..n {
        s4.push(state[i] + dt * k3[i]);
    }
    let k4 = deriv(&s4);
    let mut out = Vec::with_capacity(n);
    for i in 0..n {
        out.push(state[i] + (dt / 6.0) * (k1[i] + 2.0 * k2[i] + 2.0 * k3[i] + k4[i]));
    }
    out
}

pub fn bisect_root<F>(mut low: f64, mut high: f64, iterations: usize, f: F) -> f64
where
    F: Fn(f64) -> f64,
{
    let f_low = f(low);
    let f_high = f(high);
    if f_low * f_high > 0.0 {
        return if f_low.abs() < f_high.abs() { low } else { high };
    }
    for _ in 0..iterations {
        let mid = 0.5 * (low + high);
        let f_mid = f(mid);
        if f_mid.abs() < 1e-12 {
            return mid;
        }
        if f_low * f_mid <= 0.0 {
            high = mid;
        } else {
            low = mid;
        }
    }
    0.5 * (low + high)
}

pub fn linear_interp_crossing(t0: f64, y0: f64, t1: f64, y1: f64, target: f64) -> f64 {
    if (y1 - y0).abs() < 1e-12 {
        return t1;
    }
    let frac = ((target - y0) / (y1 - y0)).clamp(0.0, 1.0);
    t0 + frac * (t1 - t0)
}
