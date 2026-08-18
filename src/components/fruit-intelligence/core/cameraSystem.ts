import * as THREE from 'three';
import { CameraStop } from './types';
import { clamp, lerp, smooth } from './mathUtils';

export interface CameraState {
  distance: number;
  camY: number;
  heading: number;
  targetY: number;
  filmOffset: number;
  distanceScale: number;
}

export function solveCameraPose(
  p: number,
  stops: CameraStop[],
  marks: number[],
  width: number,
  height: number,
  drag: { x: number; y: number },
  time: number,
  centeringFactor: number = 0
): { position: THREE.Vector3; target: THREE.Vector3; filmOffset: number } {
  let i1 = 0;
  for (let i = 0; i < marks.length - 1; i++) {
    if (p >= marks[i]) i1 = i;
  }
  const i2 = Math.min(i1 + 1, stops.length - 1);
  const markRange = (marks[i2] - marks[i1]) || 1;
  const f = smooth(clamp((p - marks[i1]) / markRange, 0, 1));

  const d = lerp(stops[i1].distance, stops[i2].distance, f);
  const cy = lerp(stops[i1].y, stops[i2].y, f);
  const ch = lerp(stops[i1].heading, stops[i2].heading, f);
  const tY = lerp(stops[i1].targetY, stops[i2].targetY, f);

  const isWide = width / height > 1.15;
  const fo = isWide ? -9.5 * (1 - centeringFactor) : 0;
  const dScale = isWide ? 1 : lerp(1.34, 1.06, clamp((width / height - 0.55) / 0.6, 0, 1));
  const ang = ch + drag.x * 0.18 + Math.sin(time * 0.09) * 0.03;

  const position = new THREE.Vector3(
    Math.sin(ang) * d * dScale,
    cy + Math.sin(time * 0.13) * 0.02 + drag.y * 0.5,
    Math.cos(ang) * d * dScale
  );

  const target = new THREE.Vector3(
    0,
    tY + (isWide ? 0 : 0.62),
    0
  );

  return { position, target, filmOffset: fo };
}
