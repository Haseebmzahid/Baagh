export interface CameraKeyframe {
  id: number;
  chapterName: string;
  position: [number, number, number];
  lookAt: [number, number, number];
  fov: number;
}

export const cameraKeyframes: CameraKeyframe[] = [
  { id: 1, chapterName: 'Fruit', position: [0.02, 0.905, 0.155], lookAt: [0, 0.888, 0], fov: 30 },
  { id: 2, chapterName: 'Crate', position: [0.28, 1.36, 0.66], lookAt: [0.02, 0.885, -0.02], fov: 40 },
  { id: 3, chapterName: 'Source', position: [0.05, 1.5, 2.55], lookAt: [0, 0.98, -2.6], fov: 45 },
  { id: 4, chapterName: 'Hands', position: [7.74, 1.06, 0.5], lookAt: [8.02, 0.95, 0.05], fov: 26 },
  { id: 5, chapterName: 'Selection', position: [15.86, 1.5, 1.14], lookAt: [16.12, 0.85, -0.04], fov: 30 },
  { id: 6, chapterName: 'Packing', position: [23.66, 1.5, 1.22], lookAt: [24.16, 0.86, -0.02], fov: 37 },
  { id: 7, chapterName: 'Journey', position: [30.6, 4.3, 8.8], lookAt: [34.6, 1.0, -0.6], fov: 44 },
  { id: 8, chapterName: 'Arrival', position: [38.25, 1.66, 1.85], lookAt: [40.05, 1.0, -1.5], fov: 36 },
  { id: 9, chapterName: 'Home', position: [40.02, 1.06, 0.44], lookAt: [40.0, 0.885, -0.42], fov: 30 },
];
