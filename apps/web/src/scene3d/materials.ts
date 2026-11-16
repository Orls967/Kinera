import * as THREE from 'three';

export interface HighlightState {
  selectedId: string | null;
  hoveredId: string | null;
  upstreamIds: Set<string>;
  downstreamIds: Set<string>;
  isolatedId: string | null;
  soloIsolation: boolean;
  activeJourneyIds: Set<string>;
}

export function getHighlightEmissive(
  canonicalId: string,
  state: HighlightState,
): { color: string; intensity: number; opacityMul: number; hidden: boolean } {
  const isSelected = state.selectedId === canonicalId;
  const isHovered = state.hoveredId === canonicalId;
  const isUpstream = state.upstreamIds.has(canonicalId);
  const isDownstream = state.downstreamIds.has(canonicalId);
  const isJourney = state.activeJourneyIds.has(canonicalId);

  let opacityMul = 1.0;
  let hidden = false;
  if (state.isolatedId && state.isolatedId !== canonicalId) {
    if (state.soloIsolation) {
      hidden = true;
    } else {
      opacityMul = 0.08;
    }
  }

  if (isSelected) {
    return { color: '#00E5FF', intensity: 0.75, opacityMul: 1.0, hidden: false };
  }
  if (isJourney) {
    return { color: '#00E5FF', intensity: 0.6, opacityMul, hidden };
  }
  if (isHovered) {
    return { color: '#38BDF8', intensity: 0.45, opacityMul, hidden };
  }
  if (isUpstream) {
    return { color: '#3B82F6', intensity: 0.45, opacityMul: 1.0, hidden: false };
  }
  if (isDownstream) {
    return { color: '#F59E0B', intensity: 0.45, opacityMul: 1.0, hidden: false };
  }
  return { color: '#000000', intensity: 0, opacityMul, hidden };
}

export function createHelixCoilGeometry(
  radius = 0.055,
  height = 0.28,
  turns = 6,
  tubeRadius = 0.009,
): THREE.TubeGeometry {
  const pts: THREE.Vector3[] = [];
  const steps = turns * 12;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const angle = t * turns * Math.PI * 2;
    pts.push(
      new THREE.Vector3(
        Math.cos(angle) * radius,
        (t - 0.5) * height,
        Math.sin(angle) * radius,
      ),
    );
  }
  const curve = new THREE.CatmullRomCurve3(pts);
  return new THREE.TubeGeometry(curve, steps, tubeRadius, 6, false);
}
