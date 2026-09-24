// products3d.js — โมเดลสินค้า 13 ชิ้น procedural low-poly (0KB ดาวน์โหลด) — v2 ตามพิมพ์เขียว 24 ก.ย.
// หยิบขึ้นมาหมุน 360° ได้ · ไม่มีกรอบ/แผ่นภาพ (ฟีดแบ็กแม่) · import * as THREE from 'three'
import * as THREE from 'three';

const std = (color, roughness = .35, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
const ceramic = c => std(c, .3);
const wood = c => std(c, .8);
const goldM = () => std(0xD4AF37, .25, .8);

function mesh(geo, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); return m;
}
// ควัน: Points ลอยขึ้นส่าย (ต่อกลุ่มสินค้า) — userData.tick อัปเดต
function makeSmoke(g, ox, oy, oz, count = 24, rise = .28, spread = .05) {
  const pos = new Float32Array(count * 3), seed = new Float32Array(count);
  for (let i = 0; i < count; i++) { seed[i] = Math.random() * 10; pos[i * 3] = ox; pos[i * 3 + 1] = oy + Math.random() * .12; pos[i * 3 + 2] = oz; }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xcfc8b8, size: .012, transparent: true, opacity: .45, depthWrite: false }));
  g.add(pts);
  g.userData.tick = (g.userData.tick || []).concat([(t) => {
    const a = pts.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      a[i * 3 + 1] = oy + ((t * rise + seed[i]) % .3);
      a[i * 3] = ox + Math.sin(t * 1.6 + seed[i] * 3) * spread * (a[i * 3 + 1] - oy) * 3;
    }
    pts.geometry.attributes.position.needsUpdate = true;
  }]);
}
// เปลวไฟ: emissive cone กะพริบ
function makeFlame(g, x, y, z, scale = 1) {
  const flame = mesh(new THREE.ConeGeometry(.035 * scale, .11 * scale, 10), new THREE.MeshStandardMaterial({ color: 0xffa53a, emissive: 0xff8c1a, emissiveIntensity: 1.6, roughness: .4 }), x, y, z);
  g.add(flame);
  g.userData.tick = (g.userData.tick || []).concat([(t) => { flame.material.emissiveIntensity = 1.5 + Math.sin(t * 6 + x * 9) * .4; flame.scale.setScalar(1 + Math.sin(t * 5 + z) * .08); }]);
}

const B = {
  'flame-8mode'() { // เตาไฟลาวา ฐานเหลี่ยม + เปลว
    const g = new THREE.Group();
    g.add(mesh(new THREE.BoxGeometry(.2, .1, .13), std(0x1d1d22, .4, .3), 0, .05, 0));
    g.add(mesh(new THREE.BoxGeometry(.21, .015, .14), goldM(), 0, .107, 0));
    makeFlame(g, 0, .18, 0, 1.2);
    return g;
  },
  'flame-2in1'() { // กระบอก + วงแหวนไฟ
    const g = new THREE.Group();
    g.add(mesh(new THREE.CylinderGeometry(.075, .09, .14, 20), std(0x23232a, .4, .3), 0, .07, 0));
    const ring = mesh(new THREE.TorusGeometry(.08, .008, 8, 24), new THREE.MeshStandardMaterial({ color: 0x66ccff, emissive: 0x33aaff, emissiveIntensity: 1.4 }), 0, .14, 0);
    ring.rotation.x = Math.PI / 2; g.add(ring);
    g.userData.tick = (g.userData.tick || []).concat([(t) => { ring.material.emissiveIntensity = 1.3 + Math.sin(t * 4) * .5; }]);
    makeFlame(g, 0, .21, 0, .9);
    return g;
  },
  'pagoda-cone'() { // กล่องของขวัญเจดีย์
    const g = new THREE.Group();
    g.add(mesh(new THREE.BoxGeometry(.16, .11, .16), ceramic(0xe9dfc8), 0, .055, 0));
    const roof = mesh(new THREE.ConeGeometry(.125, .09, 4), std(0x8c2f2f, .5), 0, .155, 0);
    roof.rotation.y = Math.PI / 4; g.add(roof);
    g.add(mesh(new THREE.BoxGeometry(.03, .115, .012), goldM(), 0, .06, .081));
    g.add(mesh(new THREE.SphereGeometry(.014, 8, 8), goldM(), 0, .21, 0));
    return g;
  },
  'backflow'() { // ภูเขาน้ำตกควัน + จาน
    const g = new THREE.Group();
    g.add(mesh(new THREE.CylinderGeometry(.14, .15, .02, 24), wood(0x4a3620), 0, .01, 0));
    const m1 = std(0x6b5a48, .7);
    g.add(mesh(new THREE.ConeGeometry(.085, .13, 12), m1, -.02, .08, 0));
    g.add(mesh(new THREE.ConeGeometry(.06, .1, 12), m1, .05, .065, .02));
    g.add(mesh(new THREE.ConeGeometry(.045, .08, 12), m1, 0, .185, -.01));
    makeSmoke(g, 0, .22, -.01, 26, .16, .04);
    return g;
  },
  'japan-clouds'() { // โดมเซรามิคญี่ปุ่น + ควัน
    const g = new THREE.Group();
    g.add(mesh(new THREE.CylinderGeometry(.11, .12, .02, 24), wood(0x4a3620), 0, .01, 0));
    const dome = mesh(new THREE.SphereGeometry(.085, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), ceramic(0xd8d2c2), 0, .02, 0);
    g.add(dome);
    g.add(mesh(new THREE.CylinderGeometry(.02, .02, .01, 12), std(0x333, .6), 0, .1, 0));
    makeSmoke(g, 0, .11, 0, 20, .2, .05);
    return g;
  },
  'layer-mountain'() { // ภูเขาซ้อน 3 ชั้น
    const g = new THREE.Group();
    g.add(mesh(new THREE.CylinderGeometry(.13, .14, .02, 24), wood(0x4a3620), 0, .01, 0));
    const tones = [0x8a7a62, 0x9a8a70, 0x6b5a48];
    [[.09, .1, 0], [.065, .085, .075], [.045, .07, .14]].forEach(([r, h, y], i) =>
      g.add(mesh(new THREE.ConeGeometry(r, h, 14), ceramic(tones[i]), (i - 1) * .02, y + h / 2 - .01, 0)));
    return g;
  },
  'cone-tower'() { // หอประทัด + กรวยรอบ
    const g = new THREE.Group();
    g.add(mesh(new THREE.CylinderGeometry(.1, .11, .02, 24), wood(0x4a3620), 0, .01, 0));
    g.add(mesh(new THREE.CylinderGeometry(.05, .065, .17, 14), ceramic(0xb08d5f), 0, .105, 0));
    g.add(mesh(new THREE.ConeGeometry(.055, .06, 14), std(0x8c2f2f, .5), 0, .22, 0));
    for (let i = 0; i < 5; i++) {
      const a = i / 5 * Math.PI * 2;
      g.add(mesh(new THREE.ConeGeometry(.022, .05, 10), std(0x7a5a3a, .6), Math.cos(a) * .07, .035, Math.sin(a) * .07));
    }
    return g;
  },
  'house-burner'() { // บ้านจัยหลังคาจั่ว + ปล่อง
    const g = new THREE.Group();
    g.add(mesh(new THREE.BoxGeometry(.16, .1, .13), ceramic(0xe4dcc8), 0, .05, 0));
    const roof = mesh(new THREE.CylinderGeometry(0, .115, .07, 4), std(0x8c2f2f, .5), 0, .135, 0);
    roof.rotation.y = Math.PI / 4; g.add(roof);
    g.add(mesh(new THREE.BoxGeometry(.025, .05, .025), ceramic(0xb08d5f), .05, .16, -.02));
    g.add(mesh(new THREE.BoxGeometry(.03, .045, .01), std(0x5a4028, .7), 0, .023, .066));
    makeSmoke(g, .05, .19, -.02, 16, .18, .03);
    return g;
  },
  'sandalwood'() { // ชามเซรามิค + ธูป 3 แท่ง
    const g = new THREE.Group();
    const pts = [];
    for (let i = 0; i <= 8; i++) pts.push(new THREE.Vector2(.02 + Math.sin(i / 8 * Math.PI / 2) * .07, i / 8 * .08));
    pts.push(new THREE.Vector2(.085, .082));
    g.add(mesh(new THREE.LatheGeometry(pts, 24), ceramic(0x3d5a6b), 0, 0, 0));
    g.add(mesh(new THREE.CylinderGeometry(.055, .055, .01, 20), std(0xc9b98a, .9), 0, .06, 0));
    [[-.02, .01], [.005, -.015], [.02, .012]].forEach(([sx, sz], i) => {
      const s = mesh(new THREE.CylinderGeometry(.003, .003, .14, 6), wood(0x6b4a2a), sx, .12, sz);
      s.rotation.z = (i - 1) * .12; g.add(s);
    });
    makeSmoke(g, .01, .2, 0, 14, .16, .03);
    return g;
  },
  'wire-holder'() { // ที่เสียบธูปลวดโค้ง ฐานไม้กลม
    const g = new THREE.Group();
    g.add(mesh(new THREE.CylinderGeometry(.07, .075, .018, 20), wood(0x8a5a3a), 0, .009, 0));
    const arc = mesh(new THREE.TorusGeometry(.05, .006, 8, 24, Math.PI), goldM(), 0, .02, 0);
    g.add(arc);
    [[-.05, 0], [.05, 0]].forEach(([x, z]) => g.add(mesh(new THREE.SphereGeometry(.009, 8, 8), goldM(), x, .02, z)));
    return g;
  },
  'nepal-incense'() { // มัดธูปเนปาล + ถาด
    const g = new THREE.Group();
    g.add(mesh(new THREE.CylinderGeometry(.09, .1, .015, 24), std(0x7a3a2a, .7), 0, .008, 0));
    const stick = new THREE.CylinderGeometry(.0028, .0028, .2, 5);
    const tones = [0xa86a3a, 0x8a5a30, 0xc98a4a];
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * Math.PI * 2, r = .012;
      const s = mesh(stick, wood(tones[i % 3]), Math.cos(a) * r, .11, Math.sin(a) * r);
      s.rotation.z = Math.sin(a) * .09; s.rotation.x = -Math.cos(a) * .09;
      g.add(s);
    }
    g.add(mesh(new THREE.CylinderGeometry(.017, .019, .05, 10), std(0xc9483a, .8), 0, .075, 0));
    return g;
  },
  'dragon-plate'() { // จานมังกรคู่ — จาน + ลายทอง torus knot
    const g = new THREE.Group();
    g.add(mesh(new THREE.CylinderGeometry(.13, .11, .018, 28), ceramic(0x8c2f2f), 0, .009, 0));
    const rim = mesh(new THREE.TorusGeometry(.125, .008, 8, 32), goldM(), 0, .018, 0);
    rim.rotation.x = Math.PI / 2; g.add(rim);
    const knot = mesh(new THREE.TorusKnotGeometry(.045, .01, 64, 8), goldM(), 0, .045, 0);
    knot.rotation.x = Math.PI / 2; g.add(knot);
    return g;
  },
  'yinyang'() { // หยินหยางโดมคู่
    const g = new THREE.Group();
    g.add(mesh(new THREE.CylinderGeometry(.11, .12, .02, 28), wood(0x4a3620), 0, .01, 0));
    g.add(mesh(new THREE.SphereGeometry(.05, 16, 10, 0, Math.PI, 0, Math.PI / 2), std(0x1a1a1a, .3), -.028, .02, 0));
    g.add(mesh(new THREE.SphereGeometry(.05, 16, 10, Math.PI, Math.PI, 0, Math.PI / 2), ceramic(0xe9e2d0), .028, .02, 0));
    return g;
  },
};

export function buildProduct3D(id) {
  const fn = B[id];
  if (!fn) { const g = new THREE.Group(); g.add(mesh(new THREE.BoxGeometry(.12, .08, .12), std(0x777, .5), 0, .04, 0)); return g; }
  return fn();
}
