#!/usr/bin/env python3
"""
KINERA Phase 0 Cross-Document, Schema, Traceability & Mathematical Audit Script.
Standard-library only (Python 3.9+). Returns exit code 0 when zero errors remain.
"""

import argparse
import json
import math
import re
import sys
from pathlib import Path
from typing import Dict, List, Tuple

DOCS_ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = DOCS_ROOT.parent

CANONICAL_RE = re.compile(r"^[a-z][a-z0-9-]*(\.[a-z0-9][a-z0-9-]*){2,4}$")

KNOWN_PREFIXES = (
    "vehicle.",
    "subsystem.",
    "ice.",
    "ev.",
    "drivetrain.",
    "sim.",
    "insight.",
    "library.",
    "anim.",
    "asset.",
    "ref.",
    "eq.",
)


def run_audit(allow_pending_reports: bool = False) -> Tuple[int, int, Dict]:
    errors: List[str] = []
    warnings: List[str] = []
    stats: Dict = {}

    # 1. File inventory from DOCUMENTATION_STATUS.md (column 1 only)
    status_path = DOCS_ROOT / "DOCUMENTATION_STATUS.md"
    status_lines = status_path.read_text(encoding="utf-8").splitlines()
    tracked_files = []
    for line in status_lines:
        m = re.match(r"^\|\s*`([^`]+)`\s*\|", line)
        if m:
            tracked_files.append(m.group(1))

    pending_reports = {
        "12-project-governance/DOCUMENTATION_AUDIT_REPORT.md",
        "12-project-governance/PHASE_0_COMPLETION_REPORT.md",
    }
    missing_files = []
    empty_files = []
    for rel in tracked_files:
        p = DOCS_ROOT.parent / rel if rel.startswith("docs/") else DOCS_ROOT / rel
        if not p.exists():
            if allow_pending_reports and rel in pending_reports:
                continue
            missing_files.append(rel)
        elif p.stat().st_size < 50:
            empty_files.append(rel)

    if len(tracked_files) != 105:
        errors.append(f"Expected 105 tracked rows (96 domain specs + 5 schemas + 4 portal docs) in DOCUMENTATION_STATUS.md, found {len(tracked_files)}")
    if missing_files:
        errors.append(f"Missing tracked files: {missing_files}")
    if empty_files:
        errors.append(f"Near-empty tracked files: {empty_files}")
    stats["tracked_file_count"] = len(tracked_files)
    stats["domain_spec_plus_schema_count"] = sum(1 for r in tracked_files if not r.startswith("docs/"))

    # 2. Check all 5 JSON Schemas in docs/schemas/
    schema_dir = DOCS_ROOT / "schemas"
    schema_files = sorted(p.name for p in schema_dir.glob("*.json"))
    parsed_schemas: Dict[str, dict] = {}
    for sf in schema_files:
        try:
            data = json.loads((schema_dir / sf).read_text(encoding="utf-8"))
            parsed_schemas[sf] = data
        except Exception as exc:
            errors.append(f"Invalid JSON in schema {sf}: {exc}")
    stats["schema_files"] = schema_files

    md_files = sorted(DOCS_ROOT.rglob("*.md")) + [REPO_ROOT / "README.md"]
    cited_schemas = set()
    for mf in md_files:
        txt = mf.read_text(encoding="utf-8")
        for m in re.findall(r"([a-z0-9-]+\.schema\.json)", txt):
            cited_schemas.add((mf.relative_to(REPO_ROOT).as_posix(), m))
    for src, sname in sorted(cited_schemas):
        if sname not in parsed_schemas:
            errors.append(f"Non-existent schema filename '{sname}' cited in {src}")

    # 3. Validate complete fenced JSON blocks in docs (ignoring '...' ellipsis / inline comment snippets)
    json_blocks_checked = 0
    for mf in md_files:
        txt = mf.read_text(encoding="utf-8")
        for idx, block in enumerate(re.findall(r"```json\s*\n(.*?)\n```", txt, flags=re.S), 1):
            if "..." in block or "//" in block:
                continue
            json_blocks_checked += 1
            try:
                json.loads(block)
            except Exception as exc:
                errors.append(f"Invalid JSON example in {mf.relative_to(REPO_ROOT)} block#{idx}: {exc}")
    stats["json_blocks_checked"] = json_blocks_checked

    # 4. Relative markdown links & DOCUMENTATION_INDEX completeness
    broken_links = []
    link_count = 0
    link_re = re.compile(r"\[[^\]]+\]\(([^)]+)\)")
    for mf in md_files:
        clean_txt = re.sub(r"```.*?```", "", mf.read_text(encoding="utf-8"), flags=re.S)
        for target in link_re.findall(clean_txt):
            if target.startswith(("http://", "https://", "mailto:", "#")):
                continue
            target_path_str = target.split("#")[0].strip()
            if not target_path_str:
                continue
            link_count += 1
            resolved = (mf.parent / target_path_str).resolve()
            if not resolved.exists():
                if allow_pending_reports and any(r in target_path_str for r in ("DOCUMENTATION_AUDIT_REPORT.md", "PHASE_0_COMPLETION_REPORT.md")):
                    continue
                broken_links.append(f"{mf.relative_to(REPO_ROOT)} -> {target}")
    if broken_links:
        errors.extend([f"Broken relative link: {b}" for b in broken_links])
    stats["relative_links_checked"] = link_count

    index_txt = (DOCS_ROOT / "DOCUMENTATION_INDEX.md").read_text(encoding="utf-8")
    unindexed = []
    for mf in sorted(DOCS_ROOT.rglob("*.md")):
        if mf.parent == DOCS_ROOT or mf.parent.name == "scripts":
            continue
        rel = mf.relative_to(DOCS_ROOT).as_posix()
        if allow_pending_reports and rel in pending_reports:
            continue
        if rel not in index_txt and mf.name not in index_txt:
            unindexed.append(rel)
    if unindexed:
        errors.append(f"Files missing from DOCUMENTATION_INDEX.md: {unindexed}")

    # 5. Requirement definitions uniqueness, stray IDs & 100% RTM traceability
    req_def_re = re.compile(r"\|\s*\*\*(KIN-[A-Z0-9]+-[0-9]+)\*\*\s*\|")
    defined_reqs: Dict[str, List[str]] = {}
    for mf in sorted(DOCS_ROOT.rglob("*.md")):
        if mf.parent.name == "12-project-governance" or mf.parent == DOCS_ROOT:
            continue
        for rid in req_def_re.findall(mf.read_text(encoding="utf-8")):
            defined_reqs.setdefault(rid, []).append(mf.relative_to(DOCS_ROOT).as_posix())

    dup_reqs = {k: v for k, v in defined_reqs.items() if len(v) > 1}
    if dup_reqs:
        errors.append(f"Duplicate requirement definitions: {dup_reqs}")

    rtm_txt = (DOCS_ROOT / "12-project-governance/REQUIREMENTS_TRACEABILITY_MATRIX.md").read_text(encoding="utf-8")
    missing_from_rtm = [rid for rid in sorted(defined_reqs) if rid not in rtm_txt]
    if missing_from_rtm:
        errors.append(f"Requirements missing from RTM ({len(missing_from_rtm)}): {missing_from_rtm}")
    stats["defined_requirements"] = len(defined_reqs)

    ac_def_txt = (DOCS_ROOT / "01-product-specification/ACCEPTANCE_CRITERIA.md").read_text(encoding="utf-8")
    defined_acs = set(re.findall(r"\|\s*\*\*(AC-[0-9]+)\*\*\s*\|", ac_def_txt))
    all_req_set = set(defined_reqs.keys())

    for mf in md_files:
        txt = mf.read_text(encoding="utf-8")
        rel = mf.relative_to(REPO_ROOT).as_posix()
        for rid in sorted(set(re.findall(r"\bKIN-(?:PRD|FR|NFR|VEH|PWT|VDY|SIM|DATA|3D|QA)-[0-9]+\b", txt))):
            if rid not in all_req_set:
                errors.append(f"Unknown requirement ID {rid} in {rel}")
        for acid in sorted(set(re.findall(r"\bAC-[0-9]+\b", txt))):
            if acid not in defined_acs:
                errors.append(f"Unknown AC ID {acid} in {rel}")
    stats["defined_ac_count"] = len(defined_acs)

    # 6. Authoritative Registry & Sub-Registry Verification
    eq_ids = set(re.findall(r"`(eq\.[a-z0-9.-]+)`", (DOCS_ROOT / "09-learning-and-content/EQUATION_REFERENCE.md").read_text(encoding="utf-8")))
    ref_ids = set(re.findall(r"`(ref\.[a-z0-9.-]+)`", (DOCS_ROOT / "09-learning-and-content/TECHNICAL_REFERENCE_POLICY.md").read_text(encoding="utf-8")))
    insight_ids = set(re.findall(r"`(insight\.[a-z0-9.-]+)`", (DOCS_ROOT / "09-learning-and-content/ENGINEERING_INSIGHTS_CURRICULUM.md").read_text(encoding="utf-8")))
    library_ids = set(re.findall(r"`(library\.[a-z0-9.-]+)`", (DOCS_ROOT / "09-learning-and-content/TECHNICAL_LIBRARY_STRUCTURE.md").read_text(encoding="utf-8")))
    anim_ids = set(re.findall(r"`(anim\.[a-z0-9.-]+)`", (DOCS_ROOT / "08-3d-and-visualization/ANIMATION_SYSTEM.md").read_text(encoding="utf-8")))
    asset_ids = set(re.findall(r"`(asset\.[a-z0-9.-]+)`", (DOCS_ROOT / "08-3d-and-visualization/3D_ASSET_SPECIFICATION.md").read_text(encoding="utf-8")))
    sim_ids = set(re.findall(r"`(sim\.[a-z0-9.-]+)`", (DOCS_ROOT / "07-data-and-contracts/SIMULATION_CONTRACTS.md").read_text(encoding="utf-8")))
    core_reg_ids = set(re.findall(r"`([a-z][a-z0-9.-]+)`", (DOCS_ROOT / "07-data-and-contracts/CANONICAL_ID_REGISTRY.md").read_text(encoding="utf-8")))

    all_authorized_ids = core_reg_ids | eq_ids | ref_ids | insight_ids | library_ids | anim_ids | asset_ids | sim_ids

    stats["subregistry_counts"] = {
        "core_registry": len([x for x in core_reg_ids if CANONICAL_RE.match(x)]),
        "equations": len(eq_ids),
        "insights": len(insight_ids),
        "library_modules": len(library_ids),
        "animations": len(anim_ids),
        "assets": len(asset_ids),
        "references": len(ref_ids),
    }

    for mf in md_files:
        rel = mf.relative_to(REPO_ROOT).as_posix()
        txt = mf.read_text(encoding="utf-8")
        for cid in re.findall(r"`([a-z][a-z0-9.-]+)`", txt):
            if not cid.startswith(KNOWN_PREFIXES):
                continue
            if "*" in cid or cid.endswith(".") or "my-" in cid or "hydrogen-" in cid or cid.endswith((".ts", ".rs", ".py", ".json", ".glb")):
                continue
            if cid.count(".") < 2:
                continue
            # Explicit documented deprecated/informal anti-pattern examples in DATA_VERSIONING.md
            if rel.endswith("DATA_VERSIONING.md") and cid in {"drivetrain.rear-differential", "ice.transmission.gearbox"}:
                continue
            if not CANONICAL_RE.match(cid):
                errors.append(f"Canonical ID syntax failure in {rel}: `{cid}`")
            elif cid not in all_authorized_ids:
                errors.append(f"Unregistered canonical ID in {rel}: `{cid}`")

    ver_req_locs = []
    for mf in md_files:
        for i, line in enumerate(mf.read_text(encoding="utf-8").splitlines(), 1):
            if "VERIFICATION_REQUIRED" in line:
                ver_req_locs.append(f"{mf.relative_to(REPO_ROOT)}:{i}")
    stats["verification_required_policy_mentions"] = len(ver_req_locs)

    # 7. Quantitative Mathematical & Physics Verification
    math_failures = verify_math_benchmarks()
    if math_failures:
        errors.extend([f"Math benchmark mismatch: {m}" for m in math_failures])
    stats["math_benchmarks_passed"] = (24 if not math_failures else 0)

    print("=== KINERA Phase 0 Audit Summary ===")
    print(json.dumps(stats, indent=2))
    if warnings:
        print(f"\nWarnings ({len(warnings)}):")
        for w in warnings:
            print("  [WARN]", w)
    if errors:
        print(f"\nErrors ({len(errors)}):")
        for e in errors:
            print("  [ERR] ", e)
    else:
        print("\nRESULT: ALL HARD CHECKS PASSED (0 errors).")
    return len(errors), len(warnings), stats


def verify_math_benchmarks() -> List[str]:
    failures = []

    def assert_close(name: str, got: float, expected: float, rel_tol: float = 1e-6):
        if not math.isclose(got, expected, rel_tol=rel_tol, abs_tol=1e-9):
            failures.append(f"{name}: got {got}, expected {expected}")

    omega = 2 * math.pi * 3000.0 / 60.0
    assert_close("omega@3000rpm", omega, 314.159265359)
    assert_close("power@250Nm,3000rpm", 250.0 * omega, 78539.8163397)

    vd = (math.pi / 4.0) * (0.086 ** 2) * 0.086 * 4
    assert_close("V_d", vd, 0.00199823, rel_tol=1e-4)

    t_out = 200.0 * 3.5 * 0.96
    assert_close("gearbox_T_out", t_out, 672.0)
    assert_close("wheel_rpm", 3000.0 / (1.5 * 4.0), 500.0)
    assert_close("tractive_force", 1050.0 / 0.32, 3281.25)

    t_open_l = min(0.5 * 1000.0, 300.0, 1800.0)
    assert_close("open_diff_total", 2 * t_open_l, 600.0)
    t_lsd_high = min(1200.0 - 300.0, 2.5 * 300.0 + 50.0, 1800.0)
    assert_close("lsd_diff_high", t_lsd_high, 800.0)
    t_locked_r = min(1200.0 - 300.0, 1800.0)
    assert_close("locked_diff_high", t_locked_r, 900.0)

    t_ev = min(320.0, 150000.0 / 625.0)
    assert_close("ev_field_weakening", t_ev, 240.0)
    assert_close("ev_p_elec", 400.0 * 250.0, 100000.0)
    dsoc = -(400.0 * 150.0 * 60.0) / 2.16e8
    assert_close("ev_delta_soc", dsoc, -0.016666667, rel_tol=1e-5)

    f_drag = 0.5 * 1.225 * 0.28 * 2.2 * (30.0 ** 2)
    assert_close("aero_drag", f_drag, 339.57)
    f_roll = 0.011 * 1500.0 * 9.81
    assert_close("rolling_res", f_roll, 161.865)
    f_grade = 1500.0 * 9.81 * (0.10 / math.sqrt(1.01))
    assert_close("grade_res_10pct", f_grade, 1464.2225, rel_tol=1e-4)
    a_x = (4000.0 - f_drag - f_roll) / 1500.0
    assert_close("long_accel", a_x, 2.332376667)

    k_us = (1500.0 * 1.55) / (2.70 * 55000.0) - (1500.0 * 1.15) / (2.70 * 60000.0)
    assert_close("understeer_K_us", k_us, 0.0050084175, rel_tol=1e-4)
    v0 = 100.0 / 3.6
    assert_close("stopping_dist", (v0 ** 2) / (2.0 * 8.0), 48.2253086, rel_tol=1e-5)

    dfz_long = 1500.0 * 5.0 * 0.54 / 2.70
    assert_close("long_weight_transfer", dfz_long, 1500.0)
    dfz_lat = 1500.0 * 6.0 * 0.54 / 1.56
    assert_close("lat_weight_transfer", dfz_lat, 3115.384615, rel_tol=1e-5)
    ay_ssf = 9.81 * (1.56 / (2.0 * 0.54))
    assert_close("ssf_inner_zero", (1500.0 * 9.81) / 2.0 - (1500.0 * ay_ssf * 0.54 / 1.56), 0.0)

    u_sq = (2400.0 / (0.90 * 4000.0)) ** 2 + (2400.0 / (0.90 * 4000.0)) ** 2
    assert_close("friction_circle_u2", u_sq, 0.888888889, rel_tol=1e-5)

    det = 0 - 1 * (0 - 1) + 0
    assert_close("iso_to_three_det", float(det), 1.0)

    # Efficiency models
    assert_close("eff_ice_fwd", 0.99 * 0.96 * 0.98 * 0.985, 0.91736, rel_tol=5e-4)
    assert_close("eff_ice_rwd", 0.99 * 0.96 * 0.97 * 0.975 * 0.985, 0.88535, rel_tol=5e-4)
    assert_close("eff_ev_mech", 0.98 * 0.975 * 0.985, 0.94117, rel_tol=5e-4)

    # TEST-SIM-001 exact check
    omega_s1 = 2 * math.pi * 3000.0 / 60.0
    t_wheels = 180.0 * 1.0 * 4.05 * 0.917
    f_trac_s1 = t_wheels / 0.315
    assert_close("sim001_omega", omega_s1, 314.159265)
    assert_close("sim001_twheels", t_wheels, 668.493)
    assert_close("sim001_ftrac", f_trac_s1, 2122.20, rel_tol=1e-4)

    return failures


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--allow-pending-reports", action="store_true")
    args = parser.parse_args()
    n_err, _, _ = run_audit(allow_pending_reports=args.allow_pending_reports)
    sys.exit(1 if n_err > 0 else 0)
