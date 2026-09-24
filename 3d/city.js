/* ============================================================================
 * city.js — "เมืองกลางคืน" โลกภายนอกถัดจากหน้าร้าน Scentical
 *
 *   import { buildCity } from './city.js';
 *   const { colliders, walkMinZ, walkMaxZ } = buildCity(scene);
 *
 * พิกัดอ้างอิง: ผนังหน้าร้านอยู่ z = 10.6, ประตูกลาง x = 0 (กว้าง ~1.9m)
 * พื้นที่เดินนอกร้าน: z = 11 .. 26
 *
 * ข้อกำหนดด้านงบ:
 *  - mesh ทั้งเมือง ≤ ~120 ชิ้น (ใช้ geometry ร่วมกันทั้งฉาก)
 *  - texture เป็น CanvasTexture ล้วน = ไม่โหลดไฟล์ 0KB
 *  - PointLight เพิ่มไม่เกิน 2 ดวง (แสงที่เหลือใช้ emissive แทน)
 *  - ไม่แตะ scene.background / scene.fog (ของระบบหลัก)
 * ============================================================================ */
import * as THREE from 'three';

/* ------------------- RNG แบบ seed คงที่ ให้เมืองซ้ำหน้าตาเดิมทุกครั้ง ------------------- */
function mulberry32(seed) {
  let t = seed >>> 0;
  return function () {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r ^ (r + Math.imul(r ^ (r >>> 7), 61 | r))) >>> 0;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(0x5ceec1);
const pick = (arr) => arr[(rand() * arr.length) | 0];
const range = (a, b) => a + rand() * (b - a);

/* ------------------------------ CanvasTexture ------------------------------ */
function canvasTex(canvas, rx, ry) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(rx, ry);
  tex.anisotropy = 4;
  if (THREE.SRGBColorSpace !== undefined) tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function roundRectPath(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

/* --------------- พื้นถนน: หินอิฐซ้อนเรียง โทนน้ำตาลเข้ม-เทา --------------- */
function makeRoadCanvas() {
  const S = 256;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d');
  g.fillStyle = '#241f1b'; // ร่อง mortar
  g.fillRect(0, 0, S, S);
  const palette = ['#3b342e', '#423a32', '#36312c', '#453e35', '#3a332e', '#48413a'];
  const rowH = 32;
  for (let row = 0, y = 0; y < S; row++, y += rowH) {
    let x = row % 2 ? -28 : 0; // วางสลับครึ่งลูกอิฐเหมือนงานปูนจริง
    while (x < S) {
      const w = 46 + rand() * 26;
      g.fillStyle = pick(palette);
      g.fillRect(x + 1.5, y + 1.5, w - 3, rowH - 3);
      x += w;
    }
  }
  for (let i = 0; i < 700; i++) { // เม็ดตะกอน/ทราย
    g.fillStyle = rand() > 0.5 ? 'rgba(255,240,220,0.05)' : 'rgba(0,0,0,0.09)';
    g.fillRect(rand() * S, rand() * S, 2, 2);
  }
  return c;
}

/* --------- พื้นหินอ่อนสีอ่อน: ทางเดินกลาง + วงจัตุรัส (อ่อนกว่าถนน) --------- */
function makeStoneCanvas() {
  const S = 256;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d');
  g.fillStyle = '#4d4841';
  g.fillRect(0, 0, S, S);
  const cols = ['#8a8375', '#7e7769', '#938b7c', '#847d70', '#8e8778'];
  const T = 64;
  for (let y = 0; y < S; y += T) {
    for (let x = 0; x < S; x += T) {
      g.fillStyle = pick(cols);
      g.fillRect(x + 2, y + 2, T - 4, T - 4);
      g.fillStyle = 'rgba(255,250,235,0.07)'; // ขอบบนได้แสง
      g.fillRect(x + 2, y + 2, T - 4, 3);
    }
  }
  for (let i = 0; i < 500; i++) {
    g.fillStyle = rand() > 0.5 ? 'rgba(255,245,225,0.05)' : 'rgba(30,25,20,0.08)';
    g.fillRect(rand() * S, rand() * S, 2, 2);
  }
  return c;
}

/* -------- ผนังตึก: ตารางหน้าต่างจุดสีเหลืองอุ่น (map + emissiveMap ชิ้นเดียว) -------- */
function makeFacadeCanvas(cols, rows, tint) {
  const W = 128, H = 256;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d');
  g.fillStyle = tint;
  g.fillRect(0, 0, W, H);

  const mX = 12, gapX = 9, gapY = 12, topPad = 14, storeH = 30;
  const bodyH = H - topPad - storeH - 8;
  const winW = (W - mX * 2 - gapX * (cols - 1)) / cols;
  const rowH = (bodyH - gapY * (rows - 1)) / rows;

  for (let r = 0; r < rows; r++) {
    const y = topPad + r * (rowH + gapY);
    for (let cc = 0; cc < cols; cc++) {
      const x = mX + cc * (winW + gapX);
      const roll = rand();
      let col;
      if (roll < 0.62) col = pick(['#ffd28c', '#ffc878', '#ffe0a8', '#ffcf90']);   // ไฟเปิด
      else if (roll < 0.82) col = pick(['#8a6a3c', '#75552f']);                    // ไฟลิ่ม
      else col = '#171b22';                                                        // ไฟปิด
      g.fillStyle = col;
      g.fillRect(x, y, winW, rowH);
      if (col !== '#171b22') { // ครึ่งล่างห้องมืดกว่า ให้ลึกตา
        g.fillStyle = 'rgba(60,30,0,0.28)';
        g.fillRect(x, y + rowH * 0.55, winW, rowH * 0.45);
      }
    }
    const ledgeY = y + rowH + gapY / 2 - 2;
    if (ledgeY < H - storeH - 8) { // ชายคาคั่นชั้น
      g.fillStyle = 'rgba(0,0,0,0.35)';
      g.fillRect(0, ledgeY, W, 2);
    }
  }

  // ชั้นล่างเป็นหน้าร้านกระจกใหญ่สว่างกว่า
  const sY = H - storeH - 4;
  g.fillStyle = 'rgba(0,0,0,0.4)';
  g.fillRect(0, sY - 3, W, 3);
  const panes = Math.max(2, cols - 1);
  const pw = (W - mX * 2 - 8 * (panes - 1)) / panes;
  for (let p = 0; p < panes; p++) {
    g.fillStyle = rand() < 0.8 ? '#ffdd9e' : '#3a3f48';
    g.fillRect(mX + p * (pw + 8), sY, pw, storeH);
  }
  for (let i = 0; i < 220; i++) {
    g.fillStyle = rand() > 0.5 ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.06)';
    g.fillRect(rand() * W, rand() * H, 2, 2);
  }
  return c;
}

/* --------------------------- ป้ายนีออนคำไทยสั้น ๆ --------------------------- */
function makeNeonCanvas(text, color) {
  const W = 512, H = 170;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d');
  roundRectPath(g, 10, 10, W - 20, H - 20, 20);
  g.fillStyle = 'rgba(12,9,20,0.92)';
  g.fill();
  g.lineWidth = 5;
  g.strokeStyle = color;
  g.shadowColor = color;
  g.shadowBlur = 20;
  g.stroke();
  g.stroke(); // stroke ซ้ำให้ขอบเรืองแสงขึ้น
  g.font = 'bold 88px "Segoe UI", "Leelawadee UI", Tahoma, sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = color; // ชั้นแสงฟุ้งสีนีออน
  g.shadowBlur = 32;
  g.fillText(text, W / 2, H / 2 + 2);
  g.fillStyle = '#fff7e8'; // ชั้นแกนไฟสว่าง
  g.shadowBlur = 10;
  g.fillText(text, W / 2, H / 2 + 2);
  return c;
}

/* ------------------- ป้ายไม้ "SCENTICAL" + ลูกศรชี้กลับร้าน ------------------- */
function arrowLeftPath(g, cx, cy, len, th) {
  const x0 = cx - len / 2; // ปลายแหลม (ซ้ายของผ้าใบ)
  const x1 = cx + len / 2;
  const hw = th * 2.1;
  g.beginPath();
  g.moveTo(x0, cy);
  g.lineTo(x0 + hw, cy - hw);
  g.lineTo(x0 + hw, cy - th / 2);
  g.lineTo(x1, cy - th / 2);
  g.lineTo(x1, cy + th / 2);
  g.lineTo(x0 + hw, cy + th / 2);
  g.lineTo(x0 + hw, cy + hw);
  g.closePath();
}

function makeSignCanvas() {
  const W = 512, H = 256;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d');
  const planks = ['#7a5a33', '#6f4f2c', '#775531', '#694a29'];
  for (let i = 0; i < 4; i++) {
    g.fillStyle = planks[i];
    g.fillRect(0, (i * H) / 4, W, H / 4);
    g.fillStyle = 'rgba(0,0,0,0.28)';
    g.fillRect(0, (i * H) / 4 + H / 4 - 3, W, 3);
  }
  g.strokeStyle = 'rgba(60,35,15,0.35)'; // ลายไม้
  g.lineWidth = 2;
  for (let i = 0; i < 14; i++) {
    const y = rand() * H;
    g.beginPath();
    g.moveTo(rand() * W * 0.4, y);
    g.bezierCurveTo(W * 0.35, y + range(-8, 8), W * 0.6, y + range(-8, 8), W * (0.6 + rand() * 0.4), y + range(-6, 6));
    g.stroke();
  }
  g.strokeStyle = '#503719';
  g.lineWidth = 10;
  g.strokeRect(5, 5, W - 10, H - 10);
  // อักษรสลักไม้ (มีเงาล่างให้ดูนูน)
  g.font = 'bold 74px Georgia, "Times New Roman", serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = '#e8d5ae';
  g.fillText('SCENTICAL', W / 2 + 3, 92 + 3);
  g.fillStyle = '#33200e';
  g.fillText('SCENTICAL', W / 2, 92);
  // ลูกศรชี้ "กลับร้าน": ป้ายหันหน้าเข้าจัตุรัส (ทิศ -x) ซ้ายของผ้าใบ = ทิศ -z = หน้าร้าน
  arrowLeftPath(g, W / 2 + 3, 189, 210, 22);
  g.fillStyle = '#e8d5ae';
  g.fill();
  arrowLeftPath(g, W / 2, 186, 210, 22);
  g.fillStyle = '#33200e';
  g.fill();
  return c;
}

/* ================================ สร้างเมือง ================================ */
export function buildCity(scene) {
  const colliders = [];
  const city = new THREE.Group();
  city.name = 'scenticalCity';
  scene.add(city);

  /* ----- geometry กลาง แชร์ทั้งเมือง (scale ขยายเอา ไม่ new ซ้ำ) ----- */
  const boxGeo = new THREE.BoxGeometry(1, 1, 1);
  const planeGeo = new THREE.PlaneGeometry(1, 1);
  const cylGeo = new THREE.CylinderGeometry(1, 1, 1, 18);
  const circleGeo = new THREE.CircleGeometry(1, 40);
  const sphereGeo = new THREE.SphereGeometry(1, 12, 10);
  const icoGeo = new THREE.IcosahedronGeometry(1, 0);

  const addMesh = (m) => { city.add(m); return m; };
  const box = (mat, x, y, z, w, h, d) => {
    const m = new THREE.Mesh(boxGeo, mat);
    m.scale.set(w, h, d);
    m.position.set(x, y, z);
    return addMesh(m);
  };
  const cyl = (mat, x, z, r, h, y) => {
    const m = new THREE.Mesh(cylGeo, mat);
    m.scale.set(r, h, r);
    m.position.set(x, y, z);
    return addMesh(m);
  };

  /* ---------- 1) พื้นถนน 40×20 (z 10.6..30.6) + ทางเดินกลาง 3m + วงจัตุรัส ---------- */
  const road = addMesh(new THREE.Mesh(planeGeo, new THREE.MeshStandardMaterial({
    map: canvasTex(makeRoadCanvas(), 8, 4), roughness: 0.95, metalness: 0.02,
  })));
  road.rotation.x = -Math.PI / 2;
  road.scale.set(40, 20, 1);
  road.position.set(0, 0, 20.6);

  const stoneCanvas = makeStoneCanvas(); // วาดครั้งเดียว ใช้ซ้ำ 2 texture
  const walk = addMesh(new THREE.Mesh(planeGeo, new THREE.MeshStandardMaterial({
    map: canvasTex(stoneCanvas, 1.6, 5), roughness: 0.9, metalness: 0.02,
  })));
  walk.rotation.x = -Math.PI / 2;
  walk.scale.set(3, 9.6, 1);
  walk.position.set(0, 0.03, 15.4); // ทางเดินจากประตูร้าน (z 10.6..20.2)

  const plaza = addMesh(new THREE.Mesh(circleGeo, new THREE.MeshStandardMaterial({
    map: canvasTex(stoneCanvas, 5, 5), roughness: 0.9, metalness: 0.02,
  })));
  plaza.rotation.x = -Math.PI / 2;
  plaza.scale.set(6.6, 6.6, 1);
  plaza.position.set(0, 0.012, 22.6);

  /* ---------- 2) ตึกสองฝั่งถนน ฝั่งละ 5 หลัง + หน้าต่างเรืองแสง + นีออน ---------- */
  const X_OFF = 8.6;
  const ROWS = [
    { side: -1, specs: [
      { z: 12.9, w: 6.0, d: 3.4, h: 7.5 },
      { z: 16.8, w: 5.6, d: 3.6, h: 11.0 },
      { z: 20.6, w: 6.6, d: 3.5, h: 13.5 },
      { z: 24.5, w: 5.4, d: 3.7, h: 9.0 },
      { z: 28.3, w: 6.2, d: 3.4, h: 12.0 },
    ] },
    { side: 1, specs: [
      { z: 12.9, w: 5.8, d: 3.5, h: 12.5 },
      { z: 16.8, w: 6.4, d: 3.4, h: 8.0 },
      { z: 20.6, w: 5.6, d: 3.6, h: 14.0 },
      { z: 24.5, w: 6.6, d: 3.5, h: 10.0 },
      { z: 28.3, w: 5.8, d: 3.6, h: 6.5 },
    ] },
  ];
  const tints = ['#23262d', '#262223', '#1f2329', '#2a2420', '#212529'];
  const buildingMat = new THREE.MeshStandardMaterial({ color: 0x17191e, roughness: 0.9, metalness: 0.06 });
  const facadeX = (side, s) => side * X_OFF - side * (s.w / 2 + 0.07);

  for (const row of ROWS) {
    for (const s of row.specs) {
      const cx = row.side * X_OFF;
      box(buildingMat, cx, s.h / 2, s.z, s.w, s.h, s.d);
      // ผนังหน้าตึกหันเข้าถนน: plane + texture หน้าต่าง (emissiveMap แทนไฟจริง)
      const cols = Math.max(3, Math.min(6, Math.round(s.w / 1.15)));
      const winRows = Math.max(3, Math.min(12, Math.round(s.h / 1.4)));
      const fTex = canvasTex(makeFacadeCanvas(cols, winRows, pick(tints)), 1, 1);
      const facade = addMesh(new THREE.Mesh(planeGeo, new THREE.MeshStandardMaterial({
        map: fTex, emissive: 0xffffff, emissiveMap: fTex, emissiveIntensity: 0.9, roughness: 0.85,
      })));
      facade.scale.set(s.w, s.h, 1);
      facade.rotation.y = -row.side * Math.PI / 2;
      facade.position.set(facadeX(row.side, s), s.h / 2, s.z);
      // collider: วงกลมใหญ่ครอบทั้งหลัง
      colliders.push({ x: cx, z: s.z, r: Math.hypot(s.w / 2, s.d / 2) + 0.25 });
    }
  }

  // ป้ายนีออน 3 ป้าย (MeshBasicMaterial = เรืองแสงเอง ไม่กินงบไฟ)
  const neonDefs = [
    { side: 1, idx: 1, text: 'กาแฟ', color: '#ff9a3c', y: 4.1, w: 3.0 },
    { side: -1, idx: 1, text: 'ดอกไม้', color: '#ff5fa8', y: 4.9, w: 3.2 },
    { side: 1, idx: 3, text: 'อาหาร', color: '#54d97a', y: 3.7, w: 3.0 },
  ];
  for (const n of neonDefs) {
    const s = ROWS[n.side > 0 ? 1 : 0].specs[n.idx];
    const sign = addMesh(new THREE.Mesh(planeGeo, new THREE.MeshBasicMaterial({
      map: canvasTex(makeNeonCanvas(n.text, n.color), 1, 1), transparent: true,
    })));
    sign.scale.set(n.w, (n.w * 170) / 512, 1);
    sign.rotation.y = -n.side * Math.PI / 2;
    sign.position.set(facadeX(n.side, s) - n.side * 0.1, Math.min(n.y, s.h - 1.0), s.z);
  }

  /* ---------- 3) โคมถนน 4 ต้น วางเฉียงสลับสองข้างทางเดิน ---------- */
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x23262b, roughness: 0.55, metalness: 0.65 });
  const bulbMat = new THREE.MeshStandardMaterial({ color: 0x552d08, emissive: 0xffa64d, emissiveIntensity: 1.7, roughness: 0.4 });
  const lampSpots = [[-2.6, 13.0], [2.6, 15.2], [-2.6, 17.4], [2.6, 20.4]];
  for (const [lx, lz] of lampSpots) {
    cyl(poleMat, lx, lz, 0.07, 3.3, 1.65);
    const bulb = addMesh(new THREE.Mesh(sphereGeo, bulbMat));
    bulb.scale.set(0.2, 0.16, 0.2);
    bulb.position.set(lx, 3.34, lz);
    colliders.push({ x: lx, z: lz, r: 0.5 });
  }

  /* ---------- 4) จัตุรัสปลายถนน (ศูนย์กลาง z=22): น้ำพุ ม้านั่ง ต้นไม้ ป้ายไม้ ---------- */
  const FX = 0, FZ = 22;
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x585349, roughness: 0.85, metalness: 0.05 });
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x0d2b45, roughness: 0.12, metalness: 0.92, emissive: 0x0a2036, emissiveIntensity: 0.7,
  });
  const jetMat = new THREE.MeshStandardMaterial({
    color: 0xcfe9ff, emissive: 0xa8d8ff, emissiveIntensity: 1.15, roughness: 0.2, transparent: true, opacity: 0.8,
  });

  cyl(stoneMat, FX, FZ, 2.2, 0.55, 0.275); // ฐานกระบอกชั้นล่าง
  cyl(stoneMat, FX, FZ, 0.5, 0.6, 0.85);   // เสากลาง
  cyl(stoneMat, FX, FZ, 1.25, 0.38, 1.34); // ฐานชั้นบน (อ่าง)
  const w1 = addMesh(new THREE.Mesh(circleGeo, waterMat));
  w1.rotation.x = -Math.PI / 2; w1.scale.set(2.02, 2.02, 1); w1.position.set(FX, 0.57, FZ);
  const w2 = addMesh(new THREE.Mesh(circleGeo, waterMat));
  w2.rotation.x = -Math.PI / 2; w2.scale.set(1.05, 1.05, 1); w2.position.set(FX, 1.55, FZ);
  cyl(jetMat, FX, FZ, 0.1, 1.5, 2.3); // ลำน้ำกลาง
  colliders.push({ x: FX, z: FZ, r: 2.2 });

  // ม้านั่งไม้ 4 ตัว วางเฉียงรอบน้ำพุ หันหน้าเข้าศูนย์กลาง
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x6b4a2c, roughness: 0.8 });
  const legMat = new THREE.MeshStandardMaterial({ color: 0x3a3f45, roughness: 0.5, metalness: 0.7 });
  const benchD = 4.4;
  for (let i = 0; i < 4; i++) {
    const ang = Math.PI / 4 + (i * Math.PI) / 2;
    const bx = FX + Math.cos(ang) * benchD;
    const bz = FZ + Math.sin(ang) * benchD;
    const bg = new THREE.Group();
    bg.position.set(bx, 0, bz);
    bg.rotation.y = Math.atan2(FX - bx, FZ - bz);
    city.add(bg);
    const seat = new THREE.Mesh(boxGeo, woodMat);
    seat.scale.set(1.7, 0.09, 0.45); seat.position.set(0, 0.46, 0.05); bg.add(seat);
    const back = new THREE.Mesh(boxGeo, woodMat);
    back.scale.set(1.7, 0.5, 0.07); back.position.set(0, 0.8, -0.2); bg.add(back);
    const legL = new THREE.Mesh(boxGeo, legMat);
    legL.scale.set(0.09, 0.44, 0.42); legL.position.set(-0.68, 0.22, 0.05); bg.add(legL);
    const legR = legL.clone();
    legR.position.x = 0.68; bg.add(legR);
    colliders.push({ x: bx, z: bz, r: 0.5 });
  }

  // ต้นไม้ low-poly 4 ต้น มุมจัตุรัส
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3520, roughness: 0.95 });
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x1f4028, roughness: 1.0, flatShading: true });
  const treeSpots = [[-4.2, 17.2], [4.2, 17.2], [-4.2, 27.3], [4.2, 27.3]];
  for (const [tx, tz] of treeSpots) {
    const sc = range(0.9, 1.15);
    cyl(trunkMat, tx, tz, 0.14 * sc, 1.5 * sc, 0.75 * sc);
    const f1 = addMesh(new THREE.Mesh(icoGeo, leafMat));
    f1.scale.set(0.95 * sc, 1.15 * sc, 0.95 * sc);
    f1.position.set(tx, 1.95 * sc, tz);
    f1.rotation.y = range(0, Math.PI);
    const f2 = addMesh(new THREE.Mesh(icoGeo, leafMat));
    f2.scale.set(0.6 * sc, 0.7 * sc, 0.6 * sc);
    f2.position.set(tx, 2.65 * sc, tz);
    f2.rotation.y = range(0, Math.PI);
    colliders.push({ x: tx, z: tz, r: 0.5 });
  }

  // ป้ายไม้ "SCENTICAL" + ลูกศรชี้กลับหน้าร้าน
  const postMat = new THREE.MeshStandardMaterial({ color: 0x54401f, roughness: 0.9 });
  const signPost = addMesh(new THREE.Mesh(boxGeo, postMat));
  signPost.scale.set(0.12, 1.6, 0.12);
  signPost.position.set(4.95, 0.8, 22.6);
  const board = addMesh(new THREE.Mesh(planeGeo, new THREE.MeshStandardMaterial({
    map: canvasTex(makeSignCanvas(), 1, 1), roughness: 0.75,
  })));
  board.scale.set(1.9, 0.95, 1);
  board.rotation.y = -Math.PI / 2; // หันหน้าเข้าจัตุรัส
  board.position.set(4.88, 1.45, 22.6);
  colliders.push({ x: 4.95, z: 22.6, r: 0.5 });

  /* ---------- 5) ท้องฟ้า: ดาว ~150 ดวง ครึ่งทรงกลม r≈45 (ไม่แตะ bg/fog) ---------- */
  {
    const N = 150;
    const pos = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);
    const CX = 0, CY = 2, CZ = 21, R = 45;
    for (let i = 0; i < N; i++) {
      const az = rand() * Math.PI * 2;
      const el = range(0.12, 1.45); // เงยขึ้นจากขอบฟ้า
      const rr = R * range(0.9, 1.06);
      pos[i * 3] = CX + Math.cos(el) * Math.sin(az) * rr;
      pos[i * 3 + 1] = CY + Math.sin(el) * rr;
      pos[i * 3 + 2] = CZ + Math.cos(el) * Math.cos(az) * rr;
      const k = rand();
      let cr, cg, cb;
      if (k < 0.62) { cr = 1; cg = 1; cb = 1; }          // ขาว
      else if (k < 0.9) { cr = 1; cg = 0.9; cb = 0.68; } // ทอง
      else { cr = 0.8; cg = 0.87; cb = 1; }              // ขาวอมฟ้าจาง
      const b = range(0.4, 1);                           // ความสว่างจาง-สว่า
      col[i * 3] = cr * b; col[i * 3 + 1] = cg * b; col[i * 3 + 2] = cb * b;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const stars = new THREE.Points(geo, new THREE.PointsMaterial({
      size: 0.42, sizeAttenuation: true, vertexColors: true,
      transparent: true, opacity: 0.95, depthWrite: false,
    }));
    stars.name = 'cityStars';
    stars.frustumCulled = false;
    city.add(stars);
  }

  /* ---------- 6) ไฟจริงเพียง 2 ดวงตามงบ (ทางเดิน + เหนือน้ำพุ) ---------- */
  const lightA = new THREE.PointLight(0xffd9a6, 22, 13, 2);
  lightA.position.set(0, 3.2, 14.6);
  city.add(lightA);
  const lightB = new THREE.PointLight(0xffc287, 26, 15, 2);
  lightB.position.set(0, 4.3, 22.0);
  city.add(lightB);

  /* ---------- 7) กำแพงขอบเมือง (collider เฉย ๆ กันเดินลอยออกนอกถนน) ---------- */
  for (const side of [-1, 1]) {
    for (const bz of [13, 16.6, 20.2, 23.8, 27.4, 30.6]) {
      colliders.push({ x: side * 17.5, z: bz, r: 6.5 });
    }
  }

  city.updateMatrixWorld(true);
  city.matrixAutoUpdate = false; // เมืองนิ่ง ไม่ต้องคำนวณ matrix ใหม่ทุกเฟรม

  return { colliders, walkMinZ: 11, walkMaxZ: 26 };
}
