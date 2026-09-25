// glb-products.js — โหลดโมเดล 3D จริงที่ได้จาก AI (TripoSR) มาแทนภาพคัตเอาต์ — หมุน 360° ได้ทุกมุม
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
loader.setDRACOLoader(dracoLoader);

const loader = new GLTFLoader();
const tried = new Set();
let glbLoadedCount = 0, glbTotal = 13;
const glbCache = new Map();
const pending = new Map();
export function preloadGLB(id) {
  if (glbCache.has(id) || tried.has(id)) return;
  tried.add(id);
  loader.load('models/' + id + '.glb?v=5',
    gltf => { glbCache.set(id, gltf); glbLoadedCount++; const v = document.getElementById('ver'); if (v) v.textContent = 'v5b · โหลดโมเดล 3D ' + glbLoadedCount + '/13'; },
    undefined,
    () => {});
}
// สัดส่วนความลึกจริง (ลึก ÷ สูง) จากภาพถ่ายจริง — AI เดาลึกเกิน (กลายเป็นทรงกลม) เราจึงบีบตามของจริง
const DEPTH_RATIO = { 'flame-2in1': .55, 'flame-8mode': .7 };
const DEFAULT_RATIO = .6;

export function attachGLB(id, group, fallbackSprite) {
  if (group.userData.glbAttached) return;
  group.userData.glbAttached = true;
  const doAttach = (gltf) => attachFromCache(id, gltf, group, fallbackSprite);
  if (glbCache.has(id)) { doAttach(glbCache.get(id)); return; }
  const waiters = pending.get(id) || [];
  waiters.push({ group, fallbackSprite });
  pending.set(id, waiters);
  if (waiters.length > 1) return; // มีคนโหลดอยู่แล้ว — เสร็จแล้วจะแจกทุกกลุ่มพร้อมกัน
  const vEl = document.getElementById('ver');
  if (vEl) vEl.textContent = 'กำลังโหลดไฟล์ GLB…';
  loader.load(
    'models/' + id + '.glb?v=5',
    gltf => {
      glbCache.set(id, gltf);
      glbLoadedCount++;
      const vEl = document.getElementById('ver');
      if (vEl) vEl.textContent = 'v5b · โมเดล 3D พร้อม ' + glbLoadedCount + '/13';
      const all = pending.get(id) || [];
      pending.delete(id);
      for (const w of all) attachFromCache(id, gltf, w.group, w.fallbackSprite);
    },
    undefined,
    () => { const vEl = document.getElementById('ver'); if (vEl) vEl.textContent = 'v5b · 3D: โหลดโมเดลพัง ✗'; }
  );
}

function attachFromCache(id, gltf, group, fallbackSprite) {
  const model = gltf.scene;
  const ratio = DEPTH_RATIO[id] || DEFAULT_RATIO;
  const box0 = new THREE.Box3().setFromObject(model);
  const sz0 = new THREE.Vector3(); box0.getSize(sz0);
  if (sz0.z > 1e-6) model.scale.z = ratio * sz0.y / sz0.z;
  const box1 = new THREE.Box3().setFromObject(model);
  const sz1 = new THREE.Vector3(); box1.getSize(sz1);
  const sc = .19 / (Math.max(sz1.x, sz1.y, sz1.z) || 1);
  model.scale.x *= sc; model.scale.y *= sc; model.scale.z *= sc;
  const box2 = new THREE.Box3().setFromObject(model);
  const c = new THREE.Vector3(); box2.getCenter(c);
  model.position.sub(c);
  model.position.y += sz1.y / 2;
  model.traverse(o => { if (o.isMesh && o.material) { o.material.side = THREE.DoubleSide; } });
  group.add(model);
  group.userData.model3d = model;
  group.userData.autoSpin = true;
  group.userData.isCutout = false;
  fallbackSprite.visible = false;
}
