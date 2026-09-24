// glb-products.js — โหลดโมเดล 3D จริงที่ได้จาก AI (TripoSR) มาแทนภาพคัตเอาต์ — หมุน 360° ได้ทุกมุม
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
const tried = new Set();
// สัดส่วนความลึกจริง (ลึก ÷ สูง) จากภาพถ่ายจริง — AI เดาลึกเกิน (กลายเป็นทรงกลม) เราจึงบีบตามของจริง
const DEPTH_RATIO = { 'flame-2in1': .55, 'flame-8mode': .7 };
const DEFAULT_RATIO = .6;

export function attachGLB(id, group, fallbackSprite) {
  if (tried.has(id)) return;
  tried.add(id);
  loader.load(
    'models/' + id + '.glb?v=5',
    gltf => {
      const vEl = document.getElementById('ver');
      if (vEl) vEl.textContent = 'v5b · 3D: โหลดโมเดลเข้าแล้ว ✓';
      const model = gltf.scene;
      const ratio = DEPTH_RATIO[id] || DEFAULT_RATIO;
      // ① วัดของเดิม → บีบแกนลึก (z) ให้ = ratio × ความสูง (แก้ AI เดาลึกเกินเป็นทรงกลม)
      const box0 = new THREE.Box3().setFromObject(model);
      const sz0 = new THREE.Vector3(); box0.getSize(sz0);
      if (sz0.z > 1e-6) model.scale.z = ratio * sz0.y / sz0.z;
      // ② จัดขนาดรวม: สูง .3m · ฐานแตะพื้นโต๊ะ
      const box1 = new THREE.Box3().setFromObject(model);
      const sz1 = new THREE.Vector3(); box1.getSize(sz1);
      const s = .19 / (Math.max(sz1.x, sz1.y, sz1.z) || 1);
      model.scale.x *= s; model.scale.y *= s; model.scale.z *= s;
      // ③ จัดกลาง + ฐานแตะ
      const box2 = new THREE.Box3().setFromObject(model);
      const c = new THREE.Vector3(); box2.getCenter(c);
      model.position.sub(c);
      model.position.y += sz1.y / 2;
      model.traverse(o => { if (o.isMesh && o.material) { o.material.side = THREE.DoubleSide; } }); // กัน winding กลับด้านจาก AI
      group.add(model);
      group.userData.model3d = model;   // ตัวโมเดลจริง (สำหรับหมุนโชว์เอง)
      group.userData.autoSpin = true;   // เริ่มหมุนโชว์อัตโนมัติให้ดู 360° ทันทีที่หยิบ
      fallbackSprite.visible = false; // คัตเอาต์หายไป — โมเดล 3 มิติจริงแทน
      group.userData.isCutout = false; // เปิด trackball หมุน 360° จริง
    },
    undefined,
    () => { const vEl = document.getElementById('ver'); if (vEl) vEl.textContent = 'v5b · 3D: โหลดโมเดลพัง ✗'; }
  );
}
