// room.js — ห้องร้านจริง: พื้นไม้ · เพดาน+คาน+โคมห้อย · ชั้นผนัง · เคาน์เตอร์ · ประตู · ต้นไม้ · โต๊ะสินค้า (v2)
// v9 แต่งบรรยากาศ "ห้องชงธูป-หอมยามค่ำ": ตะเกียงกะพริบ · ชั้นเซรามิคผนังข้าง · ต้นไม้เพิ่ม · พรมใหญ่ · ภาพกรอบทอง
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

/* ผืนผ้าใบลายพู่กันหมึก (ซูมิเอะ) สำหรับภาพแต่งผนัง — CanvasTexture ล้วน ไม่โหลดไฟล์
   kind: 'enso' (วงพู่กัน) · 'yama' (ภูเขาหมึก) · 'take' (ไผ่) */
function sumiTexture(kind, w, h) {
  const cv = document.createElement('canvas');
  cv.width = 512; cv.height = Math.max(64, Math.round(512 * h / w));
  const W = cv.width, H = cv.height;
  const g = cv.getContext('2d');
  g.fillStyle = '#191410'; g.fillRect(0, 0, W, H);   // กระดาษวาสิโทนเข้ม
  for (let i = 0; i < 600; i++) {                    // เม็ดกระดาษ
    g.fillStyle = Math.random() > .5 ? 'rgba(255,240,210,.03)' : 'rgba(0,0,0,.05)';
    g.fillRect(Math.random() * W, Math.random() * H, 2, 2);
  }
  g.strokeStyle = 'rgba(212,175,55,.85)'; g.lineWidth = W * .022; g.strokeRect(W * .03, W * .03, W - W * .06, H - W * .06); // ขอบทองในตัว
  const ink = 'rgba(236,230,214,';
  if (kind === 'enso') {          // วงเอ็นโซ: เสียมพู่กันติดกันเล็กน้อยแบบพู่กันจริง
    g.strokeStyle = ink + '.92)'; g.lineWidth = H * .075; g.lineCap = 'round';
    g.beginPath(); g.arc(W / 2, H / 2, H * .3, -Math.PI * .42, Math.PI * 1.42); g.stroke();
    g.strokeStyle = ink + '.45)'; g.lineWidth = H * .03;
    g.beginPath(); g.arc(W / 2, H / 2, H * .3, Math.PI * 1.02, Math.PI * 1.32); g.stroke();
  } else if (kind === 'yama') {   // ภูเขาหมึกสามชั้น + พระจันทร์เล็ก
    const ridge = (y0, a, op) => {
      g.fillStyle = ink + op + ')';
      g.beginPath(); g.moveTo(W * .09, y0);
      g.quadraticCurveTo(W * .28, y0 - a, W * .46, y0 - a * .35);
      g.quadraticCurveTo(W * .6, y0 - a * 1.15, W * .91, y0 + a * .12);
      g.lineTo(W * .91, H); g.lineTo(W * .09, H); g.closePath(); g.fill();
    };
    ridge(H * .74, H * .34, .26);
    ridge(H * .84, H * .26, .48);
    ridge(H * .93, H * .18, .78);
    g.fillStyle = ink + '.9)'; g.beginPath(); g.arc(W * .74, H * .24, H * .09, 0, Math.PI * 2); g.fill();
  } else {                        // 'take' — ลำไผ่กับใบไผ่
    g.strokeStyle = ink + '.92)'; g.lineWidth = H * .05; g.lineCap = 'round';
    g.beginPath(); g.moveTo(W * .32, H * .9); g.quadraticCurveTo(W * .38, H * .5, W * .34, H * .12); g.stroke();
    g.strokeStyle = ink + '.4)'; g.lineWidth = H * .012;
    for (const sy of [.3, .55, .8]) { g.beginPath(); g.moveTo(W * .3, H * sy); g.lineTo(W * .38, H * sy); g.stroke(); }
    g.strokeStyle = ink + '.85)'; g.lineWidth = H * .022;
    for (const [bx, by, dir] of [[.36, .38, 1], [.35, .62, -1], [.34, .2, 1]]) {
      g.beginPath(); g.moveTo(W * bx, H * by);
      g.quadraticCurveTo(W * (bx + .2 * dir), H * (by - .05), W * (bx + .34 * dir), H * (by + .02));
      g.stroke();
    }
  }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* ลายพรมขอบทองผืนเดียวจบ: พื้นแดงเข้ม-น้ำตาล + ขอบอิฐเข้ม + เส้นทองคู่ + เพชรทองเรียงขอบ */
function rugTexture() {
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = 256;
  const g = cv.getContext('2d');
  g.fillStyle = '#481d16'; g.fillRect(0, 0, 512, 256);
  for (let i = 0; i < 900; i++) {  // เนื้อขนแพร
    g.fillStyle = Math.random() > .5 ? 'rgba(255,200,150,.035)' : 'rgba(0,0,0,.06)';
    g.fillRect(Math.random() * 512, Math.random() * 256, 2, 2);
  }
  g.strokeStyle = '#2c1810'; g.lineWidth = 22; g.strokeRect(11, 11, 490, 234);       // ขอบน้ำตาลเข้ม
  g.strokeStyle = 'rgba(212,175,55,.8)'; g.lineWidth = 3; g.strokeRect(28, 28, 456, 200); // เส้นทองคู่
  g.lineWidth = 1.5; g.strokeRect(38, 38, 436, 180);
  g.fillStyle = 'rgba(212,175,55,.5)';
  for (let x = 72; x < 460; x += 52) {   // ลายเพชรขอบบน-ล่าง
    for (const y of [22, 234]) {
      g.save(); g.translate(x, y); g.rotate(Math.PI / 4); g.fillRect(-5, -5, 10, 10); g.restore();
    }
  }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
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
    const pl = new THREE.PointLight(0xffd9a0, 30, 14, 1.6); pl.position.y = -1.35; g.add(pl);
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
  table(0, -2.8, 0, 3.4);      // ฮีโร่ 3 ตัว (ขยับเข้าใกล้จุดเกิด)
  table(-8.3, -5.2, Math.PI / 2, 2.6);  // ซ้าย 3 ตัว
  table(8.3, -5.2, Math.PI / 2, 2.6);   // ขวา 3 ตัว
  table(0, -8.7, 0, 4.4);      // หลัง 4 ตัว

  /* ================================================================
     บรรยากาศ "ห้องชงธูป-หอมยามค่ำ" (v9) — ของประดับ + ตะเกียงกะพริบ
     ค่าปรับทั้งหมดรวมที่ MOOD3 ด้านล่าง (แม่สั่งปรับแก้ตรงนี้ได้เลย)
     ของเพิ่มทั้งหมด ~30 ชิ้น low-poly · MeshStandardMaterial ธรรมดา
     ================================================================ */
  const MOOD3 = {
    lantern: { x: 0, z: -2.8, chain: 1.0, r: .17, color: 0xffb066, intensity: 9, dist: 9 }, // ตะเกียงเหนือโต๊ะฮีโร่
    shelf: { x: 14.68, z: .6, y: [1.5, 2.15], len: 2.6 },   // ชั้นเซรามิคผนังขวา [แกน x, กลาง z, ระดับ y, ความยาว]
    plants: [[-12.2, -8.6], [12.4, 6.8]],                   // ต้นไม้เขียวเข้มเพิ่ม 2 จุด
    rug: { x: 0, y: .006, z: -5.2, w: 18.6, d: 7.6 },       // พรมใหญ่ใต้ชุดโต๊ะ U
    frames: [                                                // ภาพกรอบทอง [x, y, z, หมุน Y, กว้าง, สูง, ลาย]
      [4.9, 2.15, -10.44, 0, 1.5, 1.45, 'enso'],             // ผนังหลังขวา (ใต้แถบทอง y=3.1 พอดี)
      [-9.8, 3.5, -10.44, 0, 1.7, .7, 'yama'],               // ผนังหลังซ้าย เหนือแถบทอง
      [14.84, 2.3, -4.5, -Math.PI / 2, 1.5, 1.45, 'take'],   // ผนังขวา
    ],
  };
  const ticks = scene.userData.ambientTicks || (scene.userData.ambientTicks = []);

  /* --- 1) ตะเกียงแขวนเหนือโต๊ะฮีโร่: ลูกแก้วสว่างนุ่ม + PointLight อุ่นกะพริบแบบเปลวเทียน --- */
  {
    const L = MOOD3.lantern;
    const lg = new THREE.Group(); lg.position.set(L.x, 4, L.z);
    const chain = new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, L.chain, 6), std(0x1c1c1c, .5, .6));
    chain.position.y = -L.chain / 2; lg.add(chain);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(.09, .14, .16, 10), std(0x241d12, .5, .4));
    cap.position.y = -L.chain - .05; lg.add(cap);
    const glowM = new THREE.MeshStandardMaterial({ color: 0x33200e, emissive: L.color, emissiveIntensity: 1.5, roughness: .4 });
    const orb = new THREE.Mesh(new THREE.SphereGeometry(L.r, 14, 12), glowM);
    orb.position.y = -L.chain - .22; lg.add(orb);
    const lamp = new THREE.PointLight(L.color, L.intensity, L.dist, 1.8);
    lamp.position.y = -L.chain - .24; lg.add(lamp);
    scene.add(lg);
    ticks.push(t => {   // กะพริบเบา ๆ ด้วย sin เวลา (สองความถี่ซ้อน = ให้ใจคล้ายเปลวเทียน)
      const f = 1 + .09 * Math.sin(t * 8.3) + .05 * Math.sin(t * 21.7 + 1.3);
      lamp.intensity = L.intensity * f;
      glowM.emissiveIntensity = 1.5 * f;
    });
  }

  /* --- 2) ชั้นไม้วางแจกัน-ถ้วยเซรามิคเคลือบเข้ม (ผนังขวา) --- */
  {
    const S = MOOD3.shelf;
    const boardM = std(0x2e2012, .85);
    const glazes = [0x24384a, 0x8a3b22, 0x5d7a68, 0x1d1a17, 0xcbb894, 0x4a2c3a, 0x3f5a46, 0x6b4426]; // สีเคลือบเข้ม
    let gi = 0;
    for (const y of S.y) {
      const board = new THREE.Mesh(new THREE.BoxGeometry(.34, .05, S.len), boardM);
      board.position.set(S.x, y, S.z); scene.add(board);
      for (let i = 0; i < 4; i++) {   // 3 แจกันทรงต่างกัน + 1 ถ้วยแบน
        const z = S.z - S.len / 2 + (i + .5) * S.len / 4;
        if (i === 3) {
          const bowl = new THREE.Mesh(new THREE.CylinderGeometry(.1, .06, .06, 12), std(glazes[(gi++) % glazes.length], .3));
          bowl.position.set(S.x, y + .055, z); scene.add(bowl);
          continue;
        }
        const h = .16 + i * .05, r = .05 + (i % 2) * .02;
        const vase = new THREE.Mesh(new THREE.CylinderGeometry(r * .7, r, h, 10), std(glazes[(gi++) % glazes.length], .35));
        vase.position.set(S.x, y + .025 + h / 2, z); scene.add(vase);
      }
    }
  }

  /* --- 3) ต้นไม้เขียวเข้มเพิ่มอีก 2 จุด (ลำต้นทรงกระบอก + ใบ icosahedron เขียวหม่น) --- */
  {
    const leafM = new THREE.MeshStandardMaterial({ color: 0x2e4a2e, roughness: .95, flatShading: true });
    for (const [px, pz] of MOOD3.plants) {
      const pg = new THREE.Group(); pg.position.set(px, 0, pz);
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(.24, .18, .42, 12), std(0x5e3420, .8));
      pot.position.y = .21; pg.add(pot);
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.04, .06, .95, 8), std(0x46331f, .9));
      trunk.position.y = .85; pg.add(trunk);
      for (const [bi, [ly, s]] of [[1.5, .42], [1.82, .32], [2.08, .24]].entries()) {
        const leaf = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 0), leafM);
        leaf.scale.set(s, s * 1.25, s); leaf.position.y = ly;
        leaf.rotation.set(bi * .7, bi * 1.3, bi * .4);
        pg.add(leaf);
      }
      scene.add(pg); colliders.push({ x: px, z: pz, r: .45 });
    }
  }

  /* --- 4) พรมใหญ่ใต้ชุดโต๊ะ U (แดงเข้ม-น้ำตาล ลายขอบทอง — ลายอยู่ใน texture ผืนเดียว) --- */
  {
    const R = MOOD3.rug;
    const rugBig = new THREE.Mesh(new THREE.PlaneGeometry(R.w, R.d), new THREE.MeshStandardMaterial({ map: rugTexture(), roughness: .95 }));
    rugBig.rotation.x = -Math.PI / 2; rugBig.position.set(R.x, R.y, R.z); scene.add(rugBig);
  }

  /* --- 5) ภาพกรอบทองบนผนัง 3 ชิ้น (กรอบเข้มนูน + ผืนผ้าใบลายหมึก) --- */
  for (const [fx, fy, fz, ry, fw, fh, kind] of MOOD3.frames) {
    const fg = new THREE.Group(); fg.position.set(fx, fy, fz); fg.rotation.y = ry;
    const backing = new THREE.Mesh(new THREE.BoxGeometry(fw + .1, fh + .1, .05), std(0x0b0805, .6, .2));
    fg.add(backing);
    const art = new THREE.Mesh(new THREE.PlaneGeometry(fw, fh), new THREE.MeshStandardMaterial({ map: sumiTexture(kind, fw, fh), roughness: .85 }));
    art.position.z = .028; fg.add(art);
    scene.add(fg);
  }

  return { tables, colliders };
}
