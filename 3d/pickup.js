// pickup.js — ระบบหยิบจับสินค้า (บัญชาแม่): หยิบขึ้นมาหน้ากล้อง · ลากหมุน 360° อิสระ · ซูม · วางกลับตำแหน่งเดิม
import * as THREE from 'three';

export class PickupController {
  constructor(camera, canvas, scene) {
    this.camera = camera; this.scene = scene;
    this.entry = null;      // { id, group, homePos, homeQuat }
    this.releasing = null;
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
    this.camera.add(g);
    g.position.set(.3, -.14, -.78);   // ลอยหน้ากล้อง ขวาล่างตามแนวสายตา
    g.rotation.set(.15, .5, 0);
    g.scale.setScalar(1);
  }
  rotate(dx, dy) {                     // หมุน 360° อิสระทั้งแกน X และ Y (ฟีดแบ็กแม่)
    if (!this.entry) return;
    this.entry.group.rotation.y += dx * .011;
    this.entry.group.rotation.x += dy * .011;
  }
  release() {
    if (!this.entry) return;
    const g = this.entry.group;
    this.scene.attach(g);              // กลับสู่ scene โดยคง world transform แล้วค่อยบินกลับบ้าน
    this.releasing = { entry: this.entry, t: 0, fromScale: g.scale.x };
    this.entry = null;
  }
  update(dt) {
    if (!this.releasing) return;
    const r = this.releasing, g = r.entry.group;
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
