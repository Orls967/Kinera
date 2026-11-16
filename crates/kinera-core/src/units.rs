use std::f64::consts::PI;

#[derive(Debug, Clone, Copy, PartialEq, PartialOrd)]
pub struct Meters(pub f64);

#[derive(Debug, Clone, Copy, PartialEq, PartialOrd)]
pub struct Seconds(pub f64);

#[derive(Debug, Clone, Copy, PartialEq, PartialOrd)]
pub struct Kilograms(pub f64);

#[derive(Debug, Clone, Copy, PartialEq, PartialOrd)]
pub struct Newtons(pub f64);

#[derive(Debug, Clone, Copy, PartialEq, PartialOrd)]
pub struct NewtonMeters(pub f64);

#[derive(Debug, Clone, Copy, PartialEq, PartialOrd)]
pub struct RadPerSec(pub f64);

#[derive(Debug, Clone, Copy, PartialEq, PartialOrd)]
pub struct Watts(pub f64);

#[derive(Debug, Clone, Copy, PartialEq, PartialOrd)]
pub struct Radians(pub f64);

#[inline]
pub fn rpm_to_rad_s(rpm: f64) -> RadPerSec {
    RadPerSec((2.0 * PI * rpm) / 60.0)
}

#[inline]
pub fn rad_s_to_rpm(omega: RadPerSec) -> f64 {
    (omega.0 * 60.0) / (2.0 * PI)
}

#[inline]
pub fn mechanical_power(torque: NewtonMeters, omega: RadPerSec) -> Watts {
    Watts(torque.0 * omega.0)
}

#[inline]
pub fn tractive_force(wheel_torque: NewtonMeters, radius: Meters) -> Newtons {
    if radius.0 <= 0.0 {
        Newtons(0.0)
    } else {
        Newtons(wheel_torque.0 / radius.0)
    }
}
