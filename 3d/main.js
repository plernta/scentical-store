// Scentical 3D Showroom — three.js r165 (MIT) · vanilla ES module · open-source only
// สร้าง 24 ก.ย. 2026 ตามบัญชาแม่ — เดินช้อปในโลก 3 มิติ คลิกสินค้า สั่งผ่าน LINE @scentical
import * as THREE from 'three';
import { PRODUCTS, STORE } from './products.js';

/* ---------- error toast ---------- */
const errBox = document.getElementById('err');
window.addEventListener('error', e => { errBox.style.display = 'block'; errBox.textContent = '⚠ ' + (e.message || e.error); });

/* ---------- i18n ---------- */
const T = {
  th: {
    sub: 'โชว์รูม 3 มิติ · เดินเลือกชมได้',
    hintDesktop: 'เดิน: W A S D / ลูกศร · หมุนมุม: ลากเมาส์ · คลิกสินค้าเพื่อดูรายละเอียด',
    hintTouch: 'เดิน: จอยซ้าย · หมุนมุม: ลากฝั่งขวา · แตะสินค้าเพื่อดูรายละเอียด',
    order: 'สั่งซื้อผ่าน LINE', note: 'Pre-order ส่ง 10–14 วัน · ทัก LINE @scentical ยืนยันสต็อก+ค่าส่งภายในวันเดียว',
    helpTitle: 'วิธีเดินช้อปในโชว์รูม',
    help: [
      ['W A S D / ลูกศร', 'เดินไปหน้า–หลัง–ซ้าย–ขวา'],
      ['ลากเมาส์', 'หมุมมองซ้าย–ขวา–บน–ล่าง'],
      ['คลิก / แตะสินค้า', 'เปิดรายละเอียด + ราคา + ปุ่มสั่งซื้อ'],
      ['จอยวงกลม (มือถือ)', 'เดินด้วยนิ้วเดียว ฝั่งซ้ายจอ'],
      ['ปุ่ม ไทย / EN', 'สลับภาษา'],
      ['กลับร้านหลัก', 'กดโลโก้ SCENTICAL ด้านบนซ้าย'],
    ],
    load: 'กำลังเปิดโชว์รูม…', baht: '฿', tagFallback: 'สินค้า', langBtn: ['ไทย', 'EN'],
  },
  en: {
    sub: '3D showroom · walk around & shop',
    hintDesktop: 'Move: W A S D / arrows · Look: drag · Click a product to view',
    hintTouch: 'Move: left joystick · Look: drag right side · Tap a product to view',
    order: 'Order via LINE', note: 'Pre-order, ships in 10–14 days · LINE @scentical confirms stock & shipping same day',
    helpTitle: 'How to shop in the showroom',
    help: [
      ['W A S D / arrows', 'walk forward–back–left–right'],
      ['Drag mouse', 'look around'],
      ['Click / tap product', 'open details, price & order button'],
      ['Joystick (mobile)', 'walk with your left thumb'],
      ['ไทย / EN button', 'switch language'],
      ['Back to store', 'tap the SCENTICAL logo top-left'],
    ],
    load: 'Opening the showroom…', baht: '฿', tagFallback: 'Product', langBtn: ['ไทย', 'EN'],
  },
};
let lang = 'th';
const $ = id => document.getElementById(id);

/* ---------- renderer / scene ---------- */
const canvas = $('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
const isTouch = matchMedia('(pointer:coarse)').matches;
renderer.setPixelRatio(Math.min(devicePixelRatio, isTouch ? 1.75 : 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setSize(innerWidth, innerHeight);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0805);
scene.fog = new THREE.FogExp2(0x0a0805, 0.03);

const camera = new THREE.PerspectiveCamera(66, innerWidth / innerHeight, 0.1, 120);
camera.rotation.order = 'YXZ';
const SPAWN = { x: 0, z: 8.2 };
let yaw = 0, pitch = -0.04;
const player = new THREE.Vector3(SPAWN.x, 1.55, SPAWN.z);

/* ---------- lights ---------- */
scene.add(new THREE.HemisphereLight(0x8a7a55, 0x14100a, 1.15));
const sun = new THREE.DirectionalLight(0xffe6b0, 1.5); sun.position.set(4, 9, 6); scene.add(sun);
for (const [lx, lz] of [[-5, 4], [5, 4], [0, -4]]) {
  const p = new THREE.PointLight(0xffd98a, 22, 14, 1.8); p.position.set(lx, 3.4, lz); scene.add(p);
}

/* ---------- floor & walls ---------- */
function floorTexture() {
  const cv = document.createElement('canvas'); cv.width = cv.height = 256;
  const g = cv.getContext('2d');
  g.fillStyle = '#141008'; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 900; i++) {
    g.fillStyle = `rgba(212,175,55,${Math.random() * 0.05})`;
    g.fillRect(Math.random() * 256, Math.random() * 256, 1.5, 1.5);
  }
  g.strokeStyle = 'rgba(212,175,55,.09)'; g.lineWidth = 1;
  g.strokeRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(cv);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(16, 12);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const floor = new THREE.Mesh(new THREE.PlaneGeometry(34, 26), new THREE.MeshStandardMaterial({ map: floorTexture(), roughness: .85, metalness: .1 }));
floor.rotation.x = -Math.PI / 2; scene.add(floor);

// ทางเดินกลางสีทองจาง ๆ
const runway = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 15.5), new THREE.MeshBasicMaterial({ color: 0x2a2210, transparent: true, opacity: .55 }));
runway.rotation.x = -Math.PI / 2; runway.position.set(0, .012, -0.4); scene.add(runway);

const wallMat = new THREE.MeshStandardMaterial({ color: 0x120e08, roughness: .95 });
function wall(w, h, x, y, z, ry) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, .3), wallMat);
  m.position.set(x, y, z); m.rotation.y = ry || 0; scene.add(m); return m;
}
wall(30, 4.4, 0, 2.2, -10.6);            // หลัง
wall(30, 4.4, 0, 2.2, 10.6);             // หน้า
wall(21, 4.4, -15, 2.2, 0, Math.PI / 2); // ซ้าย
wall(21, 4.4, 15, 2.2, 0, Math.PI / 2);  // ขวา
// คาดทองบนผนัง
const trimMat = new THREE.MeshBasicMaterial({ color: 0x8f6f1e });
for (const [w, x, z, ry] of [[30, 0, -10.42, 0], [30, 0, 10.42, 0], [21, -14.82, 0, Math.PI / 2], [21, 14.82, 0, Math.PI / 2]]) {
  const t = new THREE.Mesh(new THREE.BoxGeometry(w, .08, .05), trimMat);
  t.position.set(x, 3.1, z); t.rotation.y = ry; scene.add(t);
}

/* ---------- brand back wall ---------- */
function brandWallTexture() {
  const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 320;
  const g = cv.getContext('2d');
  g.fillStyle = '#171208'; g.fillRect(0, 0, 1024, 320);
  g.strokeStyle = 'rgba(212,175,55,.5)'; g.lineWidth = 2; g.strokeRect(10, 10, 1004, 300);
  g.fillStyle = '#F5F1E4'; g.font = '700 108px "Cormorant Garamond", serif';
  g.textAlign = 'center'; g.letterSpacing = '18px';
  g.fillText('SCENTICAL', 512, 150);
  g.fillStyle = '#D4AF37'; g.font = '300 40px Prompt, sans-serif';
  g.fillText('ของหอมที่มองเห็น · มีพิธี', 512, 235);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const brandWall = new THREE.Mesh(new THREE.PlaneGeometry(5.8, 1.8), new THREE.MeshBasicMaterial({ map: brandWallTexture() }));
brandWall.position.set(0, 3.6, -10.4); scene.add(brandWall);

/* ---------- loading ---------- */
const manager = new THREE.LoadingManager();
manager.onProgress = (u, n, tot) => { const p = Math.round(n / tot * 100); $('barI').style.width = p + '%'; $('loadSt').textContent = p + '%'; };
manager.onLoad = () => { $('loadSt').textContent = '100%'; setTimeout(() => $('load').classList.add('off'), 350); };
const texLoader = new THREE.TextureLoader(manager);
texLoader.setCrossOrigin('anonymous');
function loadTex(url) {
  const t = texLoader.load(url, undefined, undefined, () => console.warn('tex fail', url));
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}
const thumbUrl = full => 'img/thumbs/' + full.replace(/^\.\.\/img\//, '').replace(/\//g, '_').replace(/\.(jpe?g|png)$/i, '.webp');

/* ---------- canvas label helpers ---------- */
function textSprite(main, sub, opts = {}) {
  const pad = 18, w = 512;
  const cv = document.createElement('canvas'); cv.width = w; cv.height = opts.h || 200;
  const g = cv.getContext('2d');
  g.fillStyle = opts.bg || 'rgba(12,10,6,.86)';
  g.beginPath(); g.roundRect(0, 0, w, cv.height, 26); g.fill();
  g.strokeStyle = opts.border || 'rgba(212,175,55,.4)'; g.lineWidth = 3; g.stroke();
  g.textAlign = 'center';
  g.fillStyle = opts.color || '#F5F1E4';
  g.font = `500 ${opts.size || 46}px Prompt, sans-serif`;
  g.fillText(main, w / 2, opts.subY || 82, w - pad * 2);
  if (sub) { g.fillStyle = 'rgba(163,157,140,.95)'; g.font = `300 28px Inter, sans-serif`; g.fillText(sub, w / 2, (opts.subY || 82) + 48, w - pad * 2); }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthWrite: false }));
  sp.scale.set(opts.sw || 1.5, (opts.sw || 1.5) * cv.height / w, 1);
  return sp;
}
function priceSprite(baht) {
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 108;
  const g = cv.getContext('2d');
  g.fillStyle = '#D4AF37'; g.beginPath(); g.roundRect(0, 0, 256, 108, 54); g.fill();
  g.fillStyle = '#0C0A06'; g.font = '600 62px Prompt, sans-serif'; g.textAlign = 'center';
  g.fillText(baht, 128, 78);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthWrite: false }));
  sp.scale.set(.78, .33, 1);
  return sp;
}

/* ---------- pedestals ---------- */
const WORLD = { minX: -13.2, maxX: 13.2, minZ: -9.2, maxZ: 9.2 };
const colliders = []; // {x,z,r}
const clickables = [];
const pedestalGroups = [];

const baseMat = new THREE.MeshStandardMaterial({ color: 0x1a1510, roughness: .6, metalness: .25 });
const topMat = new THREE.MeshStandardMaterial({ color: 0x241d12, roughness: .45, metalness: .35 });
const goldMat = new THREE.MeshStandardMaterial({ color: 0xD4AF37, roughness: .3, metalness: .8 });
const backMat = new THREE.MeshStandardMaterial({ color: 0x0e0b07, roughness: .9 });

function buildPedestal(p, i) {
  const g = new THREE.Group();
  g.position.set(p.x, 0, p.z);

  const base = new THREE.Mesh(new THREE.BoxGeometry(.92, .96, .92), baseMat);
  base.position.y = .48; g.add(base);
  const slab = new THREE.Mesh(new THREE.BoxGeometry(1.06, .07, 1.06), topMat);
  slab.position.y = .99; g.add(slab);
  const trim = new THREE.Mesh(new THREE.BoxGeometry(1.1, .022, 1.1), goldMat);
  trim.position.y = 1.03; g.add(trim);

  // แผ่นรูปสินค้า (หันเข้าทางจุดเกิด/ทางเดินกลาง)
  const toCenter = Math.atan2(-p.x, -p.z); // หันเข้าหา (0,0)
  const holder = new THREE.Group();
  holder.position.y = 1.68; holder.rotation.y = toCenter;
  const back = new THREE.Mesh(new THREE.PlaneGeometry(1.34, 1.34), backMat);
  back.position.z = -.012; holder.add(back);
  const img = new THREE.Mesh(new THREE.PlaneGeometry(1.22, 1.22),
    new THREE.MeshBasicMaterial({ map: loadTex(thumbUrl(p.imgFull)), toneMapped: false }));
  img.userData.productId = i; clickables.push(img); holder.add(img);
  g.add(holder);

  // ป้ายชื่อ + ราคา
  const name = textSprite(p.name_th, p.name_en, { sw: 1.75 });
  name.position.set(p.x, 2.92, p.z); scene.add(name);
  const price = priceSprite(T[lang].baht + p.price);
  price.position.set(p.x, 2.5, p.z); scene.add(price);

  // วงแหวนทองใต้พีดิสตัล
  const ring = new THREE.Mesh(new THREE.RingGeometry(1.0, 1.12, 40),
    new THREE.MeshBasicMaterial({ color: 0xD4AF37, transparent: true, opacity: .33, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2; ring.position.set(p.x, .015, p.z); scene.add(ring);

  colliders.push({ x: p.x, z: p.z, r: 1.05 });
  pedestalGroups.push({ data: p, group: g, img, name, price, ring });
  scene.add(g);
}

/* ---------- build world (หลัง products.js พร้อม) ---------- */
try {
  if (!Array.isArray(PRODUCTS) || PRODUCTS.length !== 13) throw new Error('products.js ต้องมี 13 สินค้า — ได้ ' + (PRODUCTS && PRODUCTS.length));
  PRODUCTS.forEach(buildPedestal);
} catch (e) { errBox.style.display = 'block'; errBox.textContent = '⚠ ' + e.message; }

/* ---------- input ---------- */
const keys = {};
addEventListener('keydown', e => { keys[e.key.toLowerCase()] = true; poke(); });
addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; poke(); });

let look = null; // {id,x,y}
canvas.addEventListener('pointerdown', e => {
  poke();
  canvas.setPointerCapture(e.pointerId);
  if (isTouch && e.clientX < innerWidth * .38 && !joyActive) { joyStart(e); return; }
  look = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: 0 };
  canvas.classList.add('look');
});
canvas.addEventListener('pointermove', e => {
  poke();
  if (joyActive && e.pointerId === joyId) { joyMove(e); return; }
  if (!look || e.pointerId !== look.id) return;
  const dx = e.clientX - look.x, dy = e.clientY - look.y;
  look.x = e.clientX; look.y = e.clientY; look.moved += Math.abs(dx) + Math.abs(dy);
  yaw -= dx * .0044; pitch = THREE.MathUtils.clamp(pitch - dy * .0038, -1.25, .85);
});
canvas.addEventListener('pointerup', e => {
  poke();
  if (joyActive && e.pointerId === joyId) { joyEnd(); return; }
  if (look && e.pointerId === look.id) {
    if (look.moved < 9) tapWorld(e.clientX, e.clientY);
    look = null; canvas.classList.remove('look');
  }
});
canvas.addEventListener('pointercancel', () => { look = null; joyEnd(); });

/* joystick (มือถือ) */
const joy = $('joy'), knob = joy.querySelector('.knob');
let joyActive = false, joyId = null, jx = 0, jy = 0, joyCenter = null;
function joyStart(e) { joyActive = true; joyId = e.pointerId; joyCenter = { x: e.clientX, y: e.clientY }; joy.style.display = 'block'; }
function joyMove(e) {
  const dx = THREE.MathUtils.clamp(e.clientX - joyCenter.x, -44, 44);
  const dy = THREE.MathUtils.clamp(e.clientY - joyCenter.y, -44, 44);
  knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
  jx = dx / 44; jy = dy / 44;
}
function joyEnd() { joyActive = false; joyId = null; jx = jy = 0; knob.style.transform = 'translate(-50%,-50%)'; joy.style.display = 'none'; }

/* ---------- raycast tap ---------- */
const ray = new THREE.Raycaster(); const v2 = new THREE.Vector2();
function tapWorld(cx, cy) {
  if (modalOpen) return;
  v2.set(cx / innerWidth * 2 - 1, -(cy / innerHeight) * 2 + 1);
  ray.setFromCamera(v2, camera);
  const hit = ray.intersectObjects(clickables, false)[0];
  if (hit) openModal(hit.object.userData.productId);
}
let hovered = null;
function hoverWorld() {
  if (isTouch || modalOpen) return;
  v2.set(0, 0); ray.setFromCamera(v2, camera);
  const hit = ray.intersectObjects(clickables, false)[0];
  const id = hit ? hit.object.userData.productId : null;
  if (id !== hovered) {
    if (hovered != null) pedestalGroups[hovered].img.scale.setScalar(1);
    hovered = id;
    if (hovered != null) pedestalGroups[hovered].img.scale.setScalar(1.06);
    canvas.style.cursor = hovered != null ? 'pointer' : 'grab';
  }
}

/* ---------- modal ---------- */
let modalOpen = false, curProduct = null;
function openModal(i) {
  const p = PRODUCTS[i]; if (!p) return;
  curProduct = p;
  $('mImg').src = p.imgFull; $('mImg').alt = p.name_en;
  $('mTh').textContent = p.name_th; $('mEn').textContent = p.name_en;
  $('mPrice').textContent = T[lang].baht + p.price;
  $('mTag').textContent = p.tag || (lang === 'th' ? T.th.tagFallback : T.en.tagFallback);
  $('mTag').style.display = p.tag ? '' : 'none';
  $('mDesc').textContent = lang === 'th' ? p.desc_th : p.desc_en;
  $('mOrderT').textContent = T[lang].order;
  $('mOrder').href = STORE.line;
  $('mNote').textContent = T[lang].note;
  $('modal').classList.add('open'); modalOpen = true; poke();
}
function closeModal() { $('modal').classList.remove('open'); modalOpen = false; poke(); }
$('x').addEventListener('click', closeModal);
$('modal').addEventListener('click', e => { if (e.target === $('modal')) closeModal(); });
addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); $('help').classList.remove('open'); } });

/* ---------- lang & help ---------- */
function applyLang() {
  document.body.classList.toggle('en', lang === 'en');
  $('th').classList.toggle('on', lang === 'th');
  $('en').classList.toggle('on', lang === 'en');
  $('subT').textContent = T[lang].sub;
  $('hint').textContent = isTouch ? T[lang].hintTouch : T[lang].hintDesktop;
  $('hTitle').textContent = T[lang].helpTitle;
  $('hList').innerHTML = T[lang].help.map(([k, v]) => `<li><k>${k}</k><span>${v}</span></li>`).join('');
  $('loadSt').textContent = T[lang].load;
  if (modalOpen && curProduct) openModal(PRODUCTS.indexOf(curProduct)); // สลับภาษาแล้ว modal รีเฟรชทันที
}
$('th').addEventListener('click', () => { lang = 'th'; applyLang(); poke(); });
$('en').addEventListener('click', () => { lang = 'en'; applyLang(); poke(); });
$('hlp').addEventListener('click', () => { $('help').classList.add('open'); });
$('help').addEventListener('click', e => { if (e.target === $('help')) $('help').classList.remove('open'); });
let hintTimer = setTimeout(() => { $('hint').style.opacity = '0'; }, 30000); // ค้างไว้นานขึ้นสำหรับผู้สูงวัย
applyLang();

/* ---------- movement & loop (render-on-demand: เรนเดอร์เมื่อมีการใช้งาน พักเมื่อปล่อยทิ้ง) ---------- */
const BOUNDS = { x: 13.9, z: 9.9 };
function movePlayer(dt) {
  let mx = 0, mz = 0;
  if (keys['w'] || keys['arrowup']) mz -= 1;
  if (keys['s'] || keys['arrowdown']) mz += 1;
  if (keys['a'] || keys['arrowleft']) mx -= 1;
  if (keys['d'] || keys['arrowright']) mx += 1;
  mx += jx; mz += jy;
  const len = Math.hypot(mx, mz);
  if (len > 0.01) {
    mx /= Math.max(len, 1); mz /= Math.max(len, 1);
    const speed = 3.1;
    const fx = -Math.sin(yaw), fz = -Math.cos(yaw);
    const rx = Math.cos(yaw), rz = -Math.sin(yaw);
    player.x += (fx * -mz + rx * mx) * speed * dt;
    player.z += (fz * -mz + rz * mx) * speed * dt;
  }
  // ขอบโลก
  player.x = THREE.MathUtils.clamp(player.x, -BOUNDS.x, BOUNDS.x);
  player.z = THREE.MathUtils.clamp(player.z, -BOUNDS.z, BOUNDS.z);
  // ชนพีดิสตัล (วงกลม)
  for (const c of colliders) {
    const dx = player.x - c.x, dz = player.z - c.z;
    const d = Math.hypot(dx, dz), min = c.r + .3;
    if (d < min && d > 1e-4) { player.x = c.x + dx / d * min; player.z = c.z + dz / d * min; }
  }
  camera.position.set(player.x, 1.55, player.z);
  camera.rotation.set(pitch, yaw, 0);
}
let raf = 0, lastActive = 0, lastFrame = 0;
function poke(extraMs = 0) {
  lastActive = Math.max(lastActive, performance.now() + extraMs);
  if (!raf) { lastFrame = performance.now(); raf = requestAnimationFrame(loop); }
}
function loop(now) {
  raf = 0;
  const dt = Math.min((now - lastFrame) / 1000, .05);
  lastFrame = now;
  if (!modalOpen) movePlayer(dt);
  hoverWorld();
  renderer.render(scene, camera);
  if (performance.now() < lastActive) raf = requestAnimationFrame(loop);
}
poke(3000); // ช่วงเปิดเรนเดอร์ ~3 วิ แล้วพักอัตโนมัติจนกว่าจะมีการสัมผัส

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight); poke();
});
