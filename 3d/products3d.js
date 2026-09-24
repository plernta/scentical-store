// products3d.js v5c — สินค้าทั้ง 13 เป็น "คัตเอาต์ภาพจริง" (โปร่งใส ไม่มีพื้นหลัง/กรอบ) บนโต๊ะ
// + รองรับ GLB โมเดล 3D จาก AI (TripoSR) โหลดแบบขี้เกียจตอนหยิบ — หมุน 360° ได้จริง
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

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
   "img_02",
   "img_03"
  ]
 },
 "cone-tower": {
  "handle": "inverted-cone-incense-incense-tower-sand",
  "order": [
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
   "img_05",
   "img_06"
  ]
 },
 "sandalwood-burner": {
  "handle": "incense-burner-household-indoor-sandalwo",
  "order": [
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
   "img_02",
   "img_03",
   "img_04",
   "img_05"
  ]
 },
 "nepal-incense": {
  "handle": "nepal-handmade-incense-aromatherapy-joss",
  "order": [
   "img_04",
   "img_01",
   "img_02",
   "img_03",
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
   "img_01"
  ]
 },
 "yinyang-burner": {
  "handle": "ceramic-incense-burner-incense-holder-cr",
  "order": [
   "img_03",
   "img_01",
   "img_02"
  ]
 }
};

const DEPTH_RATIO = { 'flame-2in1': .55, 'flame-8mode': .7 };
const loader = new GLTFLoader();
loader.setCrossOrigin('anonymous');
const cutoutLoader = new THREE.TextureLoader();
cutoutLoader.setCrossOrigin('anonymous');
const cutoutCache = new Map();
const tried = new Set();

const std = (color, roughness = .8, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });

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
  const m = new THREE.Mesh(new THREE.PlaneGeometry(.34, .2), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.position.y = .004;
  return m;
}

function loadCutout(url, cb) {
  if (cutoutCache.has(url)) { cb(cutoutCache.get(url)); return; }
  cutoutLoader.load(url, t => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; cutoutCache.set(url, t); cb(t); }, undefined, () => {});
}

export function buildProduct3D(id) {
  const g = new THREE.Group();
  g.add(softShadow());
  const cfg = CUTOUT_BY_ID[id];
  const files = cfg ? cfg.order.map(n => 'img/cutouts/' + cfg.handle + '_' + n + '.webp') : [];
  const mat = new THREE.SpriteMaterial({ transparent: true, depthWrite: true, alphaTest: .18, opacity: 1 });
  const sp = new THREE.Sprite(mat);
  const S = .34; sp.scale.set(S, S, 1); sp.position.y = S / 2 + .025;
  g.add(sp);
  const photos = []; let cur = 0;
  if (files[0]) loadCutout(files[0], t => { mat.map = t; mat.needsUpdate = true; photos[0] = t; });
  g.userData.photos = photos;
  g.userData.photoCount = files.length;
  g.userData.isCutout = true;
  g.userData.setPhoto = i => {
    cur = ((Math.round(i) % files.length) + files.length) % files.length;
    g.userData._pi = cur;
    if (photos[cur]) { mat.map = photos[cur]; mat.needsUpdate = true; return; }
    loadCutout(files[cur], t => { photos[cur] = t; if (cur === g.userData._pi) { mat.map = t; mat.needsUpdate = true; } });
  };
  // AI 3D (TripoSR): โหลดแบบขี้เกียจ — หยิบตัวไหนค่อยดึงโมเดล 3D ตัวนั้น
  g.userData.loadGLB = () => {
    import('./glb-products.js?v=5').then(m2 => m2.attachGLB(id, g, sp)).catch(() => {});
  };
  // invisible hitbox: จุดคลิกกว้างกว่าตัวสินค้า (มาตรฐานเกม — คลิก/แตะง่าย)
  const hit = new THREE.Mesh(new THREE.BoxGeometry(.8, .75, .5), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }));
  hit.position.y = .3; hit.userData.isHit = true; g.add(hit);
  return g;
}
