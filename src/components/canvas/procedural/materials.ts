import * as THREE from 'three';
import { fibreTexture, skinMaps, woodTexture } from './proceduralTextures';

export interface SceneMaterials {
  skinMat: THREE.MeshPhysicalMaterial;
  woodMat: THREE.MeshStandardMaterial;
  woodDark: THREE.MeshStandardMaterial;
  paperMat: THREE.MeshStandardMaterial;
  clothMat: THREE.MeshStandardMaterial;
  soilMat: THREE.MeshStandardMaterial;
  leafMat: THREE.MeshStandardMaterial;
  plaster: THREE.MeshStandardMaterial;
  stone: THREE.MeshStandardMaterial;
  road: THREE.MeshStandardMaterial;
  vanBody: THREE.MeshStandardMaterial;
  vanCab: THREE.MeshStandardMaterial;
  vanGlass: THREE.MeshStandardMaterial;
  vanBumper: THREE.MeshStandardMaterial;
  vanStripe: THREE.MeshStandardMaterial;
  tyre: THREE.MeshStandardMaterial;
  floorWood: THREE.MeshStandardMaterial;
  ceiling: THREE.MeshStandardMaterial;
  counter: THREE.MeshStandardMaterial;
  bowl: THREE.MeshStandardMaterial;
  windowMat: THREE.MeshBasicMaterial;
  mullion: THREE.MeshStandardMaterial;
  shade: THREE.MeshStandardMaterial;
  pendantCord: THREE.MeshStandardMaterial;
}

let cachedMaterials: SceneMaterials | null = null;

export function getSceneMaterials(): SceneMaterials {
  if (cachedMaterials) return cachedMaterials;

  const sk = skinMaps();

  const skinMat = new THREE.MeshPhysicalMaterial({
    map: sk.map,
    bumpMap: sk.bump,
    bumpScale: 0.05,
    roughnessMap: sk.rough,
    roughness: 0.72,
    clearcoat: 0.22,
    clearcoatRoughness: 0.55,
    sheen: 0.35,
    sheenColor: new THREE.Color('#e9d7a8'),
    sheenRoughness: 0.7,
  });

  const woodMat = new THREE.MeshStandardMaterial({
    map: woodTexture(0),
    color: '#a8845c',
    roughness: 0.85,
    metalness: 0,
  });

  const woodDark = new THREE.MeshStandardMaterial({
    map: woodTexture(1),
    color: '#7a5c3c',
    roughness: 0.9,
  });

  const paperMat = new THREE.MeshStandardMaterial({
    map: fibreTexture(196, 184, 160, 60),
    roughness: 0.95,
    side: THREE.DoubleSide,
  });

  const clothMat = new THREE.MeshStandardMaterial({
    map: fibreTexture(96, 104, 88, 130),
    roughness: 1,
  });

  const soilMat = new THREE.MeshStandardMaterial({
    map: fibreTexture(56, 47, 34, 40),
    roughness: 1,
  });

  const leafMat = new THREE.MeshStandardMaterial({
    color: '#22301d',
    roughness: 1,
    flatShading: true,
  });

  const plaster = new THREE.MeshStandardMaterial({
    color: '#8e8269',
    roughness: 0.95,
  });

  const stone = new THREE.MeshStandardMaterial({
    color: '#6f6759',
    roughness: 0.92,
  });

  const road = new THREE.MeshStandardMaterial({
    color: '#6b6459',
    roughness: 0.85,
  });

  const vanBody = new THREE.MeshStandardMaterial({
    color: '#2f3a31',
    roughness: 0.4,
  });

  const vanCab = new THREE.MeshStandardMaterial({
    color: '#33402f',
    roughness: 0.45,
  });

  const vanGlass = new THREE.MeshStandardMaterial({
    color: '#2b3138',
    roughness: 0.1,
    metalness: 0.2,
  });

  const vanBumper = new THREE.MeshStandardMaterial({
    color: '#26251f',
    roughness: 0.8,
  });

  const vanStripe = new THREE.MeshStandardMaterial({
    color: '#20261f',
    roughness: 0.6,
  });

  const tyre = new THREE.MeshStandardMaterial({
    color: '#22201d',
    roughness: 0.9,
  });

  const floorWood = new THREE.MeshStandardMaterial({
    color: '#7d6042',
    roughness: 0.8,
  });

  const ceiling = new THREE.MeshStandardMaterial({
    color: '#8b8069',
    roughness: 0.95,
  });

  const counter = new THREE.MeshStandardMaterial({
    color: '#8f8571',
    roughness: 0.8,
  });

  const bowl = new THREE.MeshStandardMaterial({
    color: '#cbbfa6',
    roughness: 0.6,
    side: THREE.DoubleSide,
  });

  const windowMat = new THREE.MeshBasicMaterial({
    color: '#e8d8b6',
  });

  const mullion = new THREE.MeshStandardMaterial({
    color: '#6a6252',
    roughness: 0.8,
  });

  const shade = new THREE.MeshStandardMaterial({
    color: '#d9cdb4',
    roughness: 0.7,
  });

  const pendantCord = new THREE.MeshStandardMaterial({
    color: '#3a342b',
    roughness: 0.9,
  });

  cachedMaterials = {
    skinMat,
    woodMat,
    woodDark,
    paperMat,
    clothMat,
    soilMat,
    leafMat,
    plaster,
    stone,
    road,
    vanBody,
    vanCab,
    vanGlass,
    vanBumper,
    vanStripe,
    tyre,
    floorWood,
    ceiling,
    counter,
    bowl,
    windowMat,
    mullion,
    shade,
    pendantCord,
  };

  return cachedMaterials;
}
