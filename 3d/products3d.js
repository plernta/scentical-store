// products3d.js — "Holo-Stand": การ์ดภาพจริงของร้านลอยบนฐานทอง (v3, แทนโมเดลปั้น procedural)
// หลักการแม่ 24 ก.ย. 2026: ลูกค้าต้องเห็น "สินค้าจริง" — รูปถ่ายจริงของร้านหมุนดูได้แบบห้างใหญ่
//   ลากซ้าย-ขวา = สลับมุมภาพจริง (หมุนรอบตัวสินค้า) · ลากขึ้น-ลง = เอียงการ์ดใน 3 มิติ · ซูมได้
// API ตายตัว (main.js เรียกอยู่): buildProduct3D(id) คืน Group ยืนบนโต๊ะ (ก้นที่ y=0, สูง .36 ≤ .45, กว้าง .33 ≤ .35):
//   userData.photos = [THREE.Texture...] มุมเรียงตามการหมุน · userData.setPhoto(i) สลับหน้าการ์ด (modulo) · userData.photoCount = n
// รูป: img/thumbs/<ชื่อ>.webp — ใบหลัก derive จาก imgFull ใน products.js:
//   'img/thumbs/' + imgFull.replace('../img/','').replace(/\//g,'_').replace(/\.(jpe?g|png)$/i,'.webp')
//   มุมเพิ่มเลือกจาก tmp_thumbs แบบ "มุมต่างกันจริง" (ตรวจรูปแล้ว ตัดโปสเตอร์/ภาพโฆษณา — flame _05, wire _05 ออก)
// render-on-demand: ไม่มี animation ตลอดกาล — มีแต่ userData.tick (อาเรย์ fn(t)) วงแหวนหายใจช้า ๆ

import * as THREE from 'three';

/* ---------- มุมภาพจริงต่อสินค้า (ใบแรก = รูปหลักของ products.js · ครั้งละ 3-4 มุม) ---------- */
const H = {
  flame8: 'flame-aroma-diffuser-air-humidifier-ultr',
  flame2: 'best-selling-usb-ultrasonic-flame-humidi',
  pagoda: 'natural-cone-incense-pagoda-incense-smal',
  backflow: 'household-ceramic-incense-stick-backflow',
  japan: 'japanese-style-ceramic-indoor-view-of-sm',
  layer: 'layer-mountain-ceramic-incense-burner-in',
  cone: 'inverted-cone-incense-incense-tower-sand',
  house: 'removable-house-incense-burner',
  sandal: 'incense-burner-household-indoor-sandalwo',
  wire: 'ceramic-wire-incense-burner-home-indoor-',
  nepal: 'nepal-handmade-incense-aromatherapy-joss',
  dragon: 'double-dragon-incense-plate-incense-burn',
  yinyang: 'ceramic-incense-burner-incense-holder-cr',
};
const ANGLES = {
  'flame-8mode':      [H.flame8 + '_img_13', H.flame8 + '_img_04', H.flame8 + '_img_09', H.flame8 + '_img_02'],
  'flame-2in1':       [H.flame2 + '_img_04', H.flame2 + '_img_01', H.flame2 + '_img_02'],
  'pagoda-cone':      [H.pagoda + '_img_02', H.pagoda + '_img_01', H.pagoda + '_img_06'],
  'backflow':         [H.backflow + '_img_01', H.backflow + '_img_02', H.backflow + '_img_03'],
  'japan-clouds':     [H.japan + '_img_01', H.japan + '_img_02', H.japan + '_img_05'],
  'layer-mountain':   [H.layer + '_img_01', H.layer + '_img_02', H.layer + '_img_03'],
  'cone-tower':       [H.cone + '_img_01', H.cone + '_img_02', H.cone + '_img_04'],
  'house-burner':     [H.house + '_img_04', H.house + '_img_01', H.house + '_img_03'],
  'sandalwood-burner':[H.sandal + '_img_01', H.sandal + '_img_03', H.sandal + '_img_05'],
  'wire-holder':      [H.wire + '_img_01', H.wire + '_img_02', H.wire + '_img_04'],
  'nepal-incense':    [H.nepal + '_img_04', H.nepal + '_img_01', H.nepal + '_img_02'],
  'dragon-plate':     [H.dragon + '_img_01'], // คลังมือใบเดียว = 1 มุม
  'yinyang-burner':   [H.yinyang + '_img_03', H.yinyang + '_img_01', H.yinyang + '_img_02'],
};

/* ---------- เท็กซ์เจอร์: SRGB · anisotropy 4 · แคชตาม URL · ล้มเหลว = CanvasTexture เทาเข้มมีข้อความ id ---------- */
const loader = new THREE.TextureLoader();
const texCache = new Map(); // url -> THREE.Texture (สำเร็จหรือ placeholder ก็แคช กันยิงซ้ำ)

function cfg(t) { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }

function placeholderTex(label, sub) {
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = 512;
  const g = cv.getContext('2d');
  g.fillStyle = '#2b2b2e'; g.fillRect(0, 0, 512, 512);
  g.strokeStyle = 'rgba(212,175,55,.55)'; g.lineWidth = 10; g.strokeRect(16, 16, 480, 480);
  g.textAlign = 'center';
  g.fillStyle = '#9a948a'; g.font = '600 60px Prompt, sans-serif'; g.fillText(label, 256, 250);
  g.fillStyle = '#6f6a60'; g.font = '300 40px Prompt, sans-serif'; g.fillText(sub, 256, 330);
  return cfg(new THREE.CanvasTexture(cv));
}

function loadPhoto(file, id, i, n, onReady) {
  const url = 'img/thumbs/' + file;
  const hit = texCache.get(url);
  if (hit) { onReady(hit); return; }
  loader.load(url,
    t => { const x = cfg(t); texCache.set(url, x); onReady(x); },
    undefined,
    () => { // onError: ห้ามพังทั้งหน้า — การ์ดเทาเข้มบอก id แทน
      const x = placeholderTex(id, 'photo ' + (i + 1) + '/' + n + ' unavailable');
      texCache.set(url, x); onReady(x);
    });
}

/* ---------- จีโอเมทรี/วัสดุแชร์ข้าม 13 สแตนด์ ---------- */
const baseGeo = new THREE.CylinderGeometry(.045, .045, .022, 32);         // ฐานทอง เส้นผ่านศูนย์กลาง .09 สูง .022
const cardGeo = new THREE.BoxGeometry(.3, .3, .018);                      // การ์ด .3×.3 หนา .018 (หนาพอเอียงจริง)
const ringGeo = new THREE.TorusGeometry(.062, .0035, 8, 40);              // วงแหวนฮอโลใต้การ์ด
const beamGeo = new THREE.CylinderGeometry(.165, .165, .33, 28, 1, true); // คอลัมน์แสงโปร่งล้อมการ์ด
const baseMat = new THREE.MeshStandardMaterial({ color: 0xD4AF37, metalness: .8, roughness: .3 });
const edgeMat = new THREE.MeshStandardMaterial({ color: 0x241c10, roughness: .22, metalness: .35 }); // ขอบเข้ม roughness ต่ำ

/* ---------- ตัวอย่างคัตเอาต์จริง (แม่ให้ pick 1 = ไฟลาวา 8 โหมด): ภาพสินค้าจริงตัดพื้นหลัง ยืนใน 3 มิติ ---------- */
const CUTOUT_BY_ID = {
 "flame-8mode": {
  "handle": "flame-aroma-diffuser-air-humidifier-ultr",
  "order": [
   "img_13",
   "img_01",
   "img_02",
   "img_03",
   "img_04",
   "img_06",
   "img_08",
   "img_09",
   "img_10",
   "img_11",
   "img_12",
   "img_13",
   "img_14",
   "img_15",
   "img_17"
  ]
 },
 "flame-2in1": {
  "handle": "best-selling-usb-ultrasonic-flame-humidi",
  "order": [
   "img_04",
   "img_01",
   "img_02",
   "img_03",
   "img_04",
   "img_05",
   "img_06",
   "img_07",
   "img_08",
   "img_09",
   "img_10"
  ]
 },
 "pagoda-cone": {
  "handle": "natural-cone-incense-pagoda-incense-smal",
  "order": [
   "img_02",
   "img_01",
   "img_02",
   "img_03",
   "img_04",
   "img_05",
   "img_06",
   "img_07",
   "img_08",
   "img_09",
   "img_10"
  ]
 },
 "backflow": {
  "handle": "household-ceramic-incense-stick-backflow",
  "order": [
   "img_01",
   "img_01",
   "img_02",
   "img_03",
   "img_04",
   "img_05"
  ]
 },
 "japan-clouds": {
  "handle": "japanese-style-ceramic-indoor-view-of-sm",
  "order": [
   "img_01",
   "img_01",
   "img_02",
   "img_03",
   "img_04",
   "img_05"
  ]
 },
 "layer-mountain": {
  "handle": "layer-mountain-ceramic-incense-burner-in",
  "order": [
   "img_01",
   "img_01",
   "img_02",
   "img_03"
  ]
 },
 "cone-tower": {
  "handle": "inverted-cone-incense-incense-tower-sand",
  "order": [
   "img_01",
   "img_01",
   "img_02",
   "img_03",
   "img_04"
  ]
 },
 "house-burner": {
  "handle": "removable-house-incense-burner",
  "order": [
   "img_04",
   "img_01",
   "img_02",
   "img_03",
   "img_04",
   "img_05",
   "img_06"
  ]
 },
 "sandalwood-burner": {
  "handle": "incense-burner-household-indoor-sandalwo",
  "order": [
   "img_01",
   "img_01",
   "img_02",
   "img_03",
   "img_04",
   "img_05",
   "img_06"
  ]
 },
 "wire-holder": {
  "handle": "ceramic-wire-incense-burner-home-indoor-",
  "order": [
   "img_01",
   "img_01",
   "img_02",
   "img_03",
   "img_04"
  ]
 },
 "nepal-incense": {
  "handle": "nepal-handmade-incense-aromatherapy-joss",
  "order": [
   "img_04",
   "img_01",
   "img_02",
   "img_03",
   "img_04",
   "img_05",
   "img_06",
   "img_07",
   "img_08",
   "img_09",
   "img_10"
  ]
 },
 "dragon-plate": {
  "handle": "double-dragon-incense-plate-incense-burn",
  "order": [
   "img_01",
   "img_01"
  ]
 },
 "yinyang-burner": {
  "handle": "ceramic-incense-burner-incense-holder-cr",
  "order": [
   "img_03",
   "img_01",
   "img_02",
   "img_03"
  ]
 }
};
const cutoutCache = new Map();
const cutoutLoader = new THREE.TextureLoader(); cutoutLoader.setCrossOrigin('anonymous');
function loadCutout(url, cb) {
  if (cutoutCache.has(url)) { cb(cutoutCache.get(url)); return; }
  cutoutLoader.load(url, t => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; cutoutCache.set(url, t); cb(t); }, undefined, () => {});
}
let shadowTex = null;
function softShadow() {
  if (!shadowTex) {
    const cv = document.createElement('canvas'); cv.width = cv.height = 128;
    const c = cv.getContext('2d');
    const grd = c.createRadialGradient(64, 64, 6, 64, 64, 62);
    grd.addColorStop(0, 'rgba(0,0,0,.4)'); grd.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = grd; c.fillRect(0, 0, 128, 128);
    shadowTex = new THREE.CanvasTexture(cv);
  }
  const m = new THREE.Mesh(new THREE.PlaneGeometry(.32, .2), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.position.y = .004;
  return m;
}
function buildCutoutProduct(id) {
  const cfg = CUTOUT_BY_ID[id];
  const files = cfg.order.map(n => 'img/cutouts/' + cfg.handle + '_' + n + '.webp');
  const g = new THREE.Group();
  g.add(softShadow());
  const mat = new THREE.SpriteMaterial({ transparent: true, depthWrite: true, alphaTest: .18, opacity: 1 });
  const sp = new THREE.Sprite(mat);
  const S = .34; sp.scale.set(S, S, 1); sp.position.y = S / 2 + .025;
  g.add(sp);
  // AI 3D (TripoSR): โหลดแบบขี้เกียจ — หยิบตัวไหนค่อยดึงโมเดล 3D ตัวนั้น (หน้าเว็บเบา ไม่โหลด 75MB ตอนเปิด)
  g.userData.loadGLB = () => {
    import('./glb-products.js?v=4').then(m => m.attachGLB(id, g, sp)).catch(() => {});
  };
  // invisible hitbox: จุดคลิกกว้างกว่าตัวสินค้า (มาตรฐานเกม — คลิก/แตะง่าย)
  const hit = new THREE.Mesh(new THREE.BoxGeometry(.8, .75, .5), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }));
  hit.position.y = .3; hit.userData.isHit = true; g.add(hit);
  const photos = []; let cur = 0;
  loadCutout(files[0], t => { mat.map = t; mat.needsUpdate = true; photos[0] = t; });
  g.userData.photos = photos;
  g.userData.photoCount = files.length;
  g.userData.isCutout = true;
  g.userData.setPhoto = i => {
    cur = ((Math.round(i) % files.length) + files.length) % files.length;
    if (photos[cur]) { mat.map = photos[cur]; mat.needsUpdate = true; return; }
    loadCutout(files[cur], t => { photos[cur] = t; if (cur === g.userData._pi % files.length) { mat.map = t; mat.needsUpdate = true; } });
  };
  return g;
}

export function buildProduct3D(id) {
  if (CUTOUT_BY_ID[id]) return buildCutoutProduct(id);
  const g = new THREE.Group();
  const list = ANGLES[id] || [String(id).replace(/[^a-z0-9-]/gi, '') || 'product']; // id ไม่รู้จัก = การ์ด placeholder บอกชื่อ
  const n = list.length;

  /* ฐานทองวางพื้นโต๊ะ (ก้น Group ที่ y=0) */
  const base = new THREE.Mesh(baseGeo, baseMat); base.position.y = .011; g.add(base);

  /* การ์ดภาพจริง: หน้า = มุมปัจจุบัน · หลัง = มุมถัดไป (ให้หมุนดูต่อเนื่องรอบตัวสินค้า) */
  const photos = list.map((f, i) => placeholderTex(id, 'loading ' + (i + 1) + '/' + n));
  const frontMat = new THREE.MeshStandardMaterial({ map: photos[0], roughness: .48, metalness: 0 });
  const backMat  = new THREE.MeshStandardMaterial({ map: photos[1 % n], roughness: .48, metalness: 0 });
  const card = new THREE.Mesh(cardGeo, [edgeMat, edgeMat, edgeMat, edgeMat, frontMat, backMat]);
  card.position.y = .20; // ลอยเหนือฐาน (กลาง y≈.20 · สูงสุด .35)
  g.add(card);

  let cur = 0;
  g.userData.photos = photos;
  g.userData.photoCount = n;
  g.userData.setPhoto = (i) => {           // สลับหน้าการ์ดเป็นมุมที่ i (วนกลับ modulo)
    cur = ((Math.round(i) % n) + n) % n;
    frontMat.map = photos[cur];
    backMat.map = photos[(cur + 1) % n];
    frontMat.needsUpdate = backMat.needsUpdate = true;
  };

  /* โหลดภาพจริงแทน placeholder ทีละใบ (สำเร็จ/ล้มเหลวแต่ละใบไม่กระทบกัน) */
  list.forEach((f, i) => loadPhoto(f + '.webp', id, i, n, tex => {
    photos[i] = tex;
    g.userData.setPhoto(cur);              // รีเฟรชเฉพาะหน้าการ์ดที่กำลังแสดงอยู่
  }));

  /* แสงฮอโลแกรมจาง ๆ: วงแหวนทองใต้การ์ด + คอลัมน์แสงโปร่ง additive */
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xD4AF37, transparent: true, opacity: .5 });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2; ring.position.y = .037;
  g.add(ring);
  const beamMat = new THREE.MeshBasicMaterial({
    color: 0xFFD98A, transparent: true, opacity: .06,
    blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false,
  });
  const beam = new THREE.Mesh(beamGeo, beamMat);
  beam.position.y = .187; beam.renderOrder = 2; // additive เขียนทับการ์ดนิด ๆ = ฟีลจอโชว์ลอย
  g.add(beam);

  /* tick เบามาก (main.js: for..of userData.tick fn(tAnim)) — วงแหวนหายใจช้า period ~7.9 วิ · เป็นฟังก์ชันของเวลา เรียกซ้ำปลอดภัย */
  const ph0 = Math.random() * Math.PI * 2;
  g.userData.tick = [(t) => { ringMat.opacity = .38 + .22 * Math.sin(t * .8 + ph0); }];

  return g;
}
