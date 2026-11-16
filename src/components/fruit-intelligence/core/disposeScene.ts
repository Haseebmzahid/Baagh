import * as THREE from 'three';

/** Shared textures/geometries are disposed once, including detached tracked resources. */
export function disposeScene(scene: THREE.Scene, extras: { dispose(): void }[] = []) {
  const resources = new Set<{ dispose(): void }>(extras);
  if (scene.environment) resources.add(scene.environment);
  if (scene.background && (scene.background as THREE.Texture).isTexture) resources.add(scene.background as THREE.Texture);
  scene.traverse(object => {
    const mesh = object as THREE.Mesh;
    if (mesh.geometry) resources.add(mesh.geometry);
    if ((mesh as THREE.InstancedMesh).isInstancedMesh) resources.add(mesh as THREE.InstancedMesh);
    const materials = mesh.material ? (Array.isArray(mesh.material) ? mesh.material : [mesh.material]) : [];
    for (const material of materials) {
      resources.add(material);
      for (const value of Object.values(material)) {
        if (value && typeof value === 'object' && (value as THREE.Texture).isTexture) resources.add(value as THREE.Texture);
      }
    }
    const light = object as THREE.Light & { shadow?: THREE.LightShadow };
    if (light.shadow) resources.add(light.shadow);
  });
  for (const resource of resources) resource.dispose();
  scene.clear();
}
