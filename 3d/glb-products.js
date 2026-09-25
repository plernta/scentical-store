// glb-products.js — ระบบเดียวของร้าน: โหลดโมเดล 3D จริงจาก AI (Hunyuan3D/TripoSR) แทนภาพคัตเอาต์ — หมุน 360° ได้ทุกมุม
// บั๊กเดิม: ใช้ `loader` ก่อนบรรทัดประกาศ (TDZ) → โมดูลทั้งไฟล์ล่มเงียบ ๆ → โมเดลไม่ขึ้นบนโต๊ะ — แก้แล้ว: ประกาศก่อนใช้เสมอ
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
loader.setDRACOLoader(dracoLoader);

let glbLoadedCount = 0;
const glbCache = new Map();   // id → gltf (แชร์ทั้งร้าน — products3d.js/main.js เรียก attachGLB ตัวเดียวกันนี้)
const pending = new Map();    // id → [{group, fallbackSprite}] ที่รอไฟล์ใบเดียวกันอยู่

// สัดส่วนความลึกจริง (ลึก ÷ สูง) จากภาพถ่ายจริง — AI เดาลึกเกิน (กลายเป็นทรงกลม) เราจึงบีบตามของจริง
const DEPTH_RATIO = { 'flame-2in1': .55, 'flame-8mode': .7 };
const DEFAULT_RATIO = .6;

export function attachGLB(id, group, fallbackSprite) {
  if (group.userData.glbAttached) return; // กันแนบซ้ำ (main ยัดตอนเปิดร้าน + hover/pick เรียก loadGLB อีกที)
  group.userData.glbAttached = true;
  if (glbCache.has(id)) { attachFromCache(id, glbCache.get(id), group, fallbackSprite); return; }
  const waiters = pending.get(id) || [];
  waiters.push({ group, fallbackSprite });
  pending.set(id, waiters);
  if (waiters.length > 1) return; // มีคนโหลดอยู่แล้ว — เสร็จเมื่อไรแจกทุกกลุ่มพร้อมกัน
  const vEl = document.getElementById('ver');
  if (vEl) vEl.textContent = 'กำลังโหลดไฟล์ GLB…';
  loader.load(
    'models/' + id + '.glb?v=6',
    gltf => {
      glbCache.set(id, gltf);
      glbLoadedCount++;
      const vOk = document.getElementById('ver');
      if (vOk) vOk.textContent = 'โมเดล 3D พร้อม ' + glbLoadedCount + '/13';
      const all = pending.get(id) || [];
      pending.delete(id);
      for (const w of all) attachFromCache(id, gltf, w.group, w.fallbackSprite);
    },
    undefined,
    () => {
      pending.delete(id);
      const vErr = document.getElementById('ver');
      if (vErr) vErr.textContent = '3D: โหลดโมเดลพัง ✗ ' + id;
    }
  );
}

function attachFromCache(id, gltf, group, fallbackSprite) {
  const model = gltf.scene;
  const ratio = DEPTH_RATIO[id] || DEFAULT_RATIO;
  // ① วัดของเดิม → บีบแกนลึก (z) ให้ = ratio × ความสูง (แก้ AI เดาลึกเกินเป็นทรงกลม)
  const box0 = new THREE.Box3().setFromObject(model);
  const sz0 = new THREE.Vector3(); box0.getSize(sz0);
  if (sz0.z > 1e-6) model.scale.z = ratio * sz0.y / sz0.z;
  // ② จัดขนาดรวม: สูง ~.3m เท่าคัตเอาต์บนโต๊ะ
  const box1 = new THREE.Box3().setFromObject(model);
  const sz1 = new THREE.Vector3(); box1.getSize(sz1);
  const s = .3 / (Math.max(sz1.x, sz1.y, sz1.z) || 1);
  model.scale.x *= s; model.scale.y *= s; model.scale.z *= s;
  // ③ จัดกลาง + ฐานแตะพื้นโต๊ะ
  const box2 = new THREE.Box3().setFromObject(model);
  const c = new THREE.Vector3(); box2.getCenter(c);
  model.position.sub(c);
  model.position.y += sz1.y / 2;
  model.traverse(o => { if (o.isMesh && o.material) o.material.side = THREE.DoubleSide; }); // กัน winding กลับด้านจาก AI
  group.add(model);
  group.userData.model3d = model;   // ตัวโมเดลจริง (หมุนโชว์เองเมื่อหยิบ)
  group.userData.autoSpin = true;   // เริ่มหมุนโชว์ 360° ทันทีที่หยิบ
  group.userData.isCutout = false; // เปิด trackball หมุนอิสระ
  if (fallbackSprite) fallbackSprite.visible = false; // คัตเอาต์หายไป — โมเดล 3 มิติจริงแทน
}
