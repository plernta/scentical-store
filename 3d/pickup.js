// pickup.js — ระบบหยิบจับสินค้า (บัญชาแม่): หยิบขึ้นมาหน้ากล้อง · หมุน trackball 360° ทุกแกน · ลากขวาง = สลับมุมภาพจริง · ซูม · วางกลับ
import * as THREE from 'three';

export class PickupController {
  constructor(camera, canvas, scene) {
    this.camera = camera; this.scene = scene;
    this.entry = null;      // { id, group, homePos, homeQuat }
    this.releasing = null;
    this._acc = 0;
    canvas.addEventListener('wheel', e => {
      if (!this.entry) return;
      e.preventDefault();
      const z = THREE.MathUtils.clamp(this.entry.group.scale.x * (e.deltaY < 0 ? 1.08 : .93), .55, 1.7);
      this.entry.group.scale.setScalar(z);
    }, { passive: false });
  }
  get active() { return !!this.entry || !!this.releasing; }

  pick(entry) {
    if (this.entry) return;
    const g = entry.group;
    if (!entry.homePos) {
      const wp = new THREE.Vector3(); g.getWorldPosition(wp);
      entry.homePos = wp.clone();
      entry.homeQuat = g.quaternion.clone();
    }
    this.entry = entry;
    this._acc = 0;
    g.userData._pi = 0;
    if (g.userData.loadGLB) g.userData.loadGLB();   // lazy: ดึงโมเดล 3D จริงตอนหยิบ (ครั้งแรกอาจหน่วง 2-5 วิ)
    this.camera.add(g);
    g.position.set(.14, -.1, -.92);   // ลอยหน้ากล้อง กลางนิดขวา
    g.quaternion.setFromEuler(new THREE.Euler(.12, 0, 0));
    g.scale.setScalar(1);
  }
  rotate(dx, dy) {
    if (!this.entry) return;
    const g = this.entry.group;
    g.userData.autoSpin = false;       // ผู้ใช้ลากเอง = หยุดหมุนอัตโนมัติ
    // สินค้าคัตเอาต์ (billboard): ลากขวาง = สลับมุมภาพจริง · ลากขึ้นลง = ซูม
    if (g.userData.isCutout) {
      if (g.userData.photoCount > 1 && g.userData.setPhoto) {
        this._acc += dx;
        const step = 32;   // ลากนุ่ม: ทุก 32px = มุมถัดไป (14 มุม = หมุนรอบตัวต่อเนื่อง)
        while (this._acc >= step) { g.userData._pi = ((g.userData._pi || 0) + 1) % g.userData.photoCount; g.userData.setPhoto(g.userData._pi); this._acc -= step; }
        while (this._acc <= -step) { g.userData._pi = ((g.userData._pi || 0) - 1 + g.userData.photoCount) % g.userData.photoCount; g.userData.setPhoto(g.userData._pi); this._acc += step; }
      }
      const z = THREE.MathUtils.clamp(g.scale.x * (1 - dy * .0022), .55, 1.8);
      g.scale.setScalar(z);
      return;
    }
    // trackball: หมุนตามมือ 360° ทุกแกน
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(dy * .011, dx * .011, 0, 'XYZ'));
    g.quaternion.premultiply(q);
    // ลากขวางสะสม 64px = สลับมุมภาพจริงถัดไป (Holo-Card หลายมุม) แล้วตั้งการ์ดหันหน้าให้ดูภาพชัด
    if (g.userData.photoCount > 1 && g.userData.setPhoto) {
      this._acc += dx;
      const step = 64;
      let changed = false;
      while (this._acc >= step) { g.userData._pi = ((g.userData._pi || 0) + 1) % g.userData.photoCount; g.userData.setPhoto(g.userData._pi); this._acc -= step; changed = true; }
      while (this._acc <= -step) { g.userData._pi = ((g.userData._pi || 0) - 1 + g.userData.photoCount) % g.userData.photoCount; g.userData.setPhoto(g.userData._pi); this._acc += step; changed = true; }
      if (changed) g.quaternion.setFromEuler(new THREE.Euler(.12, 0, 0));
    }
  }
  release() {
    if (!this.entry) return;
    const g = this.entry.group;
    this.scene.attach(g);              // กลับสู่ scene โดยคง world transform แล้วค่อยบินกลับบ้าน
    this.releasing = { entry: this.entry, t: 0, t0: performance.now(), fromScale: g.scale.x };
    this.entry = null;
  }
  update(dt) {
    if (!this.releasing) return;
    const r = this.releasing, g = r.entry.group;
    // กันค้าง: ถ้าแท็บถูกซ่อนจนแอนิเมชันหยุดนานเกิน 2.5 วิ → บังคับเสร็จทันที (แก้ "สินค้าลอยค้าง คลิกไม่ได้")
    if (performance.now() - r.t0 > 2500) r.t = 1;
    r.t = Math.min(r.t + dt * 2.6, 1);
    const k = 1 - Math.pow(1 - r.t, 3);          // easeOutCubic
    g.position.lerp(r.entry.homePos, k);
    g.quaternion.slerp(r.entry.homeQuat, k);
    g.scale.setScalar(THREE.MathUtils.lerp(r.fromScale, 1, k));
    if (r.t >= 1) {
      g.position.copy(r.entry.homePos); g.quaternion.copy(r.entry.homeQuat); g.scale.setScalar(1);
      this.releasing = null;
    }
  }
}
