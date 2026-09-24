// room.js — ห้องร้านจริง: พื้นไม้ · เพดาน+คาน+โคมห้อย · ชั้นผนัง · เคาน์เตอร์ · ประตู · ต้นไม้ · โต๊ะสินค้า (v2)
import * as THREE from 'three';

const std = (color, roughness = .8, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
const goldM = () => std(0xD4AF37, .3, .7);

function woodTexture() {
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = 512;
  const g = cv.getContext('2d');
  g.fillStyle = '#4a3category320'; g.fillStyle = '#4a3320'; g.fillRect(0, 0, 512, 512);
  for (let plank = 0; plank < 8; plank++) {
    const y = plank * 64;
    g.fillStyle = ['#54381f', '#4a3320', '#5c4025', '#46301c'][plank % 4];
    g.fillRect(0, y, 512, 62);
    g.strokeStyle = 'rgba(20,12,4,.55)'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(0, y + 62); g.lineTo(512, y + 62); g.stroke();
    for (let s = 0; s < 30; s++) {
      g.strokeStyle = `rgba(30,20,8,${.08 + Math.random() * .1})`; g.lineWidth = 1;
      const sy = y + Math.random() * 60;
      g.beginPath(); g.moveTo(0, sy); g.bezierCurveTo(170, sy + 3, 340, sy - 3, 512, sy); g.stroke();
    }
  }
  const t = new THREE.CanvasTexture(cv);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(6, 4);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function buildRoom(scene) {
  const colliders = [];
  /* พื้นไม้ */
  const floorMat = std(0xffffff, .85); floorMat.map = woodTexture();
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 22), floorMat);
  floor.rotation.x = -Math.PI / 2; scene.add(floor);

  /* เพดาน + คาน */
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(30, 22), std(0x1a140c, .95));
  ceil.rotation.x = Math.PI / 2; ceil.position.y = 4; scene.add(ceil);
  const beamM = std(0x3a2a16, .85);
  for (const z of [-6.5, -2, 2.5, 7]) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(30, .18, .22), beamM);
    b.position.set(0, 3.9, z); scene.add(b);
  }

  /* โคมห้อย 3 ดวง */
  for (const [lx, lz] of [[-5, -3.5], [5, -3.5], [0, 1.5]]) {
    const g = new THREE.Group(); g.position.set(lx, 0, lz);
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, 1.1, 6), std(0x222, .5, .5)));
    const shade = new THREE.Mesh(new THREE.ConeGeometry(.3, .28, 20, 1, true), std(0x241d12, .5, .4));
    shade.position.y = -1.2; shade.material.side = THREE.DoubleSide; g.add(shade);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(.07, 12, 10), new THREE.MeshStandardMaterial({ color: 0xffe2b0, emissive: 0xffd28a, emissiveIntensity: 2.2 }));
    bulb.position.y = -1.32; g.add(bulb);
    const pl = new THREE.PointLight(0xffd9a0, 14, 9, 1.7); pl.position.y = -1.35; g.add(pl);
    g.position.y = 4; scene.add(g);
  }

  /* ผนัง + คาดทอง (คงเดิม) */
  const wallM = std(0x161009, .95);
  const mk = (w, h, x, y, z, ry) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, .3), wallM); m.position.set(x, y, z); m.rotation.y = ry || 0; scene.add(m); };
  mk(30, 4.4, 0, 2.2, -10.6); mk(30, 4.4, 0, 2.2, 10.6); mk(21, 4.4, -15, 2.2, 0, Math.PI / 2); mk(21, 4.4, 15, 2.2, 0, Math.PI / 2);
  for (const [w, x, z, ry] of [[30, 0, -10.42, 0], [30, 0, 10.42, 0], [21, -14.82, 0, Math.PI / 2], [21, 14.82, 0, Math.PI / 2]]) {
    const t = new THREE.Mesh(new THREE.BoxGeometry(w, .08, .05), goldM()); t.position.set(x, 3.1, z); t.rotation.y = ry; scene.add(t);
  }

  /* ชั้นวางของตกแต่งบนผนังหลัง */
  const shelfM = std(0x3a2a16, .85);
  const tones = [0x8c6a4a, 0x6b8a7a, 0xa88a5a, 0x7a5a6a, 0x9a4a3a, 0x5a6a8a, 0xc0a878, 0x4a5a3a];
  let tone = 0;
  for (const sy of [1.7, 2.5]) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(9, .06, .32), shelfM);
    s.position.set(-3.5, sy, -10.35); scene.add(s);
    for (let i = 0; i < 9; i++) {
      const h = .14 + ((i * 7 + sy * 10) % 3) * .05;
      const kind = (i + sy) % 3;
      const item = kind === 0
        ? new THREE.Mesh(new THREE.CylinderGeometry(.035, .045, h, 10), std(tones[(tone++) % tones.length], .35))
        : kind === 1
          ? new THREE.Mesh(new THREE.BoxGeometry(.08, h, .08), std(tones[(tone++) % tones.length], .6))
          : new THREE.Mesh(new THREE.SphereGeometry(.05, 10, 8), std(tones[(tone++) % tones.length], .4));
      item.position.set(-7.5 + i * .95, sy + .03 + h / 2, -10.35);
      scene.add(item);
    }
  }

  /* เคาน์เตอร์แคชเชียร์ (มุมขวาหน้า) */
  const cg = new THREE.Group(); cg.position.set(9.5, 0, 6.5); cg.rotation.y = -.5;
  cg.add(new THREE.Mesh(new THREE.BoxGeometry(2.6, .95, .8), std(0x3a2a16, .85))).children[0].position.y = .475;
  const ctop = new THREE.Mesh(new THREE.BoxGeometry(2.8, .06, .95), std(0x241d12, .4, .3)); ctop.position.y = .98; cg.add(ctop);
  const reg = new THREE.Mesh(new THREE.BoxGeometry(.3, .22, .25), std(0x222, .4, .4)); reg.position.set(.8, 1.12, 0); cg.add(reg);
  const bell = new THREE.Mesh(new THREE.SphereGeometry(.05, 10, 8), goldM()); bell.position.set(-.7, 1.06, 0); cg.add(bell);
  scene.add(cg); colliders.push({ x: 9.5, z: 6.5, r: 1.5 });

  /* ประตูทางเข้า (ผนังหน้ากลาง) */
  const dg = new THREE.Group(); dg.position.set(0, 0, 10.4);
  dg.add(new THREE.Mesh(new THREE.BoxGeometry(1.7, 3, .12), std(0x241a10, .85)));
  dg.children[0].position.y = 1.5;
  for (const px of [-.95, .95]) { const p = new THREE.Mesh(new THREE.BoxGeometry(.14, 3.1, .2), goldM()); p.position.set(px, 1.55, 0); dg.add(p); }
  const lintel = new THREE.Mesh(new THREE.BoxGeometry(2.05, .16, .2), goldM()); lintel.position.y = 3.05; dg.add(lintel);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(.05, 10, 8), goldM()); knob.position.set(.6, 1.5, -.1); dg.add(knob);
  scene.add(dg);

  /* ต้นไม้ 2 กระถาง */
  for (const [px, pz] of [[-11, 7.5], [11.5, -7.5]]) {
    const pg = new THREE.Group(); pg.position.set(px, 0, pz);
    pg.add(new THREE.Mesh(new THREE.CylinderGeometry(.22, .17, .4, 12), std(0x8c4a2a, .35)));
    pg.children[pg.children.length - 1].position.y = .2;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.035, .05, .7, 8), std(0x5a4028, .9)); trunk.position.y = .75; pg.add(trunk);
    for (const [ly, lr] of [[1.15, .38], [1.45, .3], [1.72, .22]]) {
      pg.add(new THREE.Mesh(new THREE.ConeGeometry(lr, .45, 10), std(0x3f6a34, .85)).translateY(ly));
    }
    scene.add(pg); colliders.push({ x: px, z: pz, r: .5 });
  }

  /* พรมกลางร้าน */
  const rug = new THREE.Mesh(new THREE.CircleGeometry(2.6, 40), std(0x4a1f1f, .95));
  rug.rotation.x = -Math.PI / 2; rug.position.set(0, .014, -2.5); scene.add(rug);
  const rugRing = new THREE.Mesh(new THREE.RingGeometry(2.42, 2.6, 40), goldM());
  rugRing.rotation.x = -Math.PI / 2; rugRing.position.set(0, .016, -2.5); scene.add(rugRing);

  /* โต๊ะสินค้า 4 ตัว (U-shape) — top y = .78 */
  const tables = [];
  const topM = std(0x54381f, .75); const legM = std(0x3a2a16, .8);
  function table(x, z, rot, len) {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot;
    const top = new THREE.Mesh(new THREE.BoxGeometry(len, .06, 1), topM); top.position.y = .75; g.add(top);
    for (const [lx, lz] of [[-len / 2 + .12, -.38], [len / 2 - .12, -.38], [-len / 2 + .12, .38], [len / 2 - .12, .38]]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(.09, .72, .09), legM); leg.position.set(lx, .36, lz); g.add(leg);
    }
    const skirt = new THREE.Mesh(new THREE.BoxGeometry(len, .08, .9), legM); skirt.position.y = .68; g.add(skirt);
    scene.add(g);
    tables.push({ x, z, rot, len, topY: .78 });
    colliders.push({ x, z, r: Math.max(len / 2 * .72, 1.1) });
  }
  table(0, -3.4, 0, 3.4);      // ฮีโร่ 3 ตัว
  table(-8.3, -5.2, Math.PI / 2, 2.6);  // ซ้าย 3 ตัว
  table(8.3, -5.2, Math.PI / 2, 2.6);   // ขวา 3 ตัว
  table(0, -8.7, 0, 4.4);      // หลัง 4 ตัว

  return { tables, colliders };
}
