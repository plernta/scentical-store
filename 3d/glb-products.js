// glb-products.js — โหลดโมเดล 3D จริงที่ได้จาก AI (TripoSR) มาแทนภาพคัตเอาต์ — หมุน 360° ได้ทุกมุม
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
const tried = new Set();

export function attachGLB(id, group, fallbackSprite) {
  if (tried.has(id)) return;
  tried.add(id);
  loader.load(
    'models/' + id + '.glb',
    gltf => {
      const model = gltf.scene;
      // จัดขนาด: สูง .3m · ฐานแตะพื้นโต๊ะ · กลางแกน x/z
      const box = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3(); box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      const s = .3 / maxDim;
      model.scale.setScalar(s);
      const box2 = new THREE.Box3().setFromObject(model);
      const c = new THREE.Vector3(); box2.getCenter(c);
      model.position.sub(c);          // กลางแกน
      model.position.y += (box2.max.y - box2.min.y) / 2; // ฐาน y=0 ของกลุ่ม
      model.traverse(o => { if (o.isMesh && o.material) { o.material.side = THREE.DoubleSide; } }); // กัน winding กลับด้านจาก AI
      group.add(model);
      fallbackSprite.visible = false; // คัตเอาต์หายไป — โมเดล 3 มิติจริงแทน
      group.userData.isCutout = false; // เปิด trackball หมุน 360° จริง
    },
    undefined,
    () => { /* ยังไม่มี GLB = คงคัตเอาต์ */ }
  );
}
