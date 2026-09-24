// Scentical 3D Showroom v2 — ร้านห้องเสมือนจริง + หยิบสินค้าหมุน 360° (บัญชาแม่ 24 ก.ย. 2026)
// three.js r165 MIT · vanilla ES module · open-source only · render-on-demand
import * as THREE from 'three';
import { PRODUCTS, STORE } from './products.js?v=4';
import { buildRoom } from './room.js?v=4';
import { buildProduct3D } from './products3d.js?v=4';
import { PickupController } from './pickup.js?v=4';

/* ---------- error toast ---------- */
const errBox = document.getElementById('err');
window.addEventListener('error', e => { errBox.style.display = 'block'; errBox.textContent = '⚠ ' + (e.message || e.error); });

/* ---------- i18n ---------- */
const T = {
  th: {
    sub: 'โชว์รูม 3 มิติ · เดินเลือก หยิบดูได้',
    hintDesktop: 'เดิน: W A S D · หมุนมุม: ลากเมาส์ · คลิกสินค้า = หยิบขึ้นมาดู · ลาก = หมุน 360° · ล้อเมาส์ = ซูม',
    hintTouch: 'เดิน: จอยซ้าย · หมุนมุม: ลากฝั่งขวา · แตะสินค้า = หยิบดู · ลาก = หมุน 360°',
    order: 'สั่งซื้อผ่าน LINE', note: 'Pre-order ส่ง 10–14 วัน · ทัก LINE @scentical ยืนยันสต็อก+ค่าส่งภายในวันเดียว',
    putback: 'วางกลับ', photo: 'ดูรูปจริง',
    helpTitle: 'วิธีเดินช้อปในโชว์รูม',
    help: [
      ['W A S D / ลูกศร', 'เดินสำรวจร้าน'],
      ['ลากเมาส์', 'หมุนมุมมอง'],
      ['คลิกสินค้า', 'หยิบขึ้นมาดู — เหมือนจับของจริง'],
      ['ลาก / ล้อเมาส์', 'หมุนสินค้า 360° / ซูมดูใกล้'],
      ['วางกลับ / ESC', 'วางสินค้าลงตำแหน่งเดิม'],
      ['ปุ่ม ไทย / EN', 'สลับภาษา · โลโก้บนซ้าย = กลับร้านหลัก'],
    ],
    load: 'กำลังเปิดโชว์รูม…', baht: '฿', tagFallback: 'สินค้า',
  },
  en: {
    sub: '3D showroom · walk, pick up & inspect',
    hintDesktop: 'Move: W A S D · Look: drag · Click product = pick it up · Drag = rotate 360° · Wheel = zoom',
    hintTouch: 'Move: left joystick · Look: drag right · Tap product = pick up · Drag = rotate 360°',
    order: 'Order via LINE', note: 'Pre-order, ships in 10–14 days · LINE @scentical confirms stock & shipping same day',
    putback: 'Put back', photo: 'Real photo',
    helpTitle: 'How to shop in the showroom',
    help: [
      ['W A S D / arrows', 'walk around the shop'],
      ['Drag mouse', 'look around'],
      ['Click a product', 'pick it up — like holding the real thing'],
      ['Drag / wheel', 'rotate the item 360° / zoom in'],
      ['Put back / ESC', 'return it to its spot'],
      ['ไทย / EN button', 'switch language · top-left logo = back to store'],
    ],
    load: 'Opening the showroom…', baht: '฿', tagFallback: 'Product',
  },
};
let lang = 'th';
const $ = id => document.getElementById(id);

/* ---------- renderer / scene / camera ---------- */
const canvas = $('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
const isTouch = matchMedia('(pointer:coarse)').matches;
renderer.setPixelRatio(Math.min(devicePixelRatio, isTouch ? 1.75 : 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setSize(innerWidth, innerHeight);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x120d08);
scene.fog = new THREE.FogExp2(0x120d08, .024);

const camera = new THREE.PerspectiveCamera(66, innerWidth / innerHeight, .05, 120);
scene.add(camera); // ให้กล้องเป็น parent ของสินค้าที่หยิบขึ้นมาได้
camera.rotation.order = 'YXZ';
const SPAWN = { x: 0, z: 8.2 };
let yaw = 0, pitch = -0.06;
const player = new THREE.Vector3(SPAWN.x, 1.55, SPAWN.z);

scene.add(new THREE.HemisphereLight(0x9a8a68, 0x141008, 1.0));
const sun = new THREE.DirectionalLight(0xffe6b0, 1.1); sun.position.set(4, 9, 6); scene.add(sun);

/* ---------- ห้องร้าน (v2) + เมือง (โหลดถ้ามี) ---------- */
const room = buildRoom(scene);
const BOUNDS = { x: 13.9, zIn: 9.9, zOut: 24 };
const colliders = room.colliders;
// ผนังหน้าร้าน = ชนได้ ยกเว้นช่องประตูกลาง (|x| < 1.35) → เดินออกไปเมืองได้
for (let wx = -13; wx <= 13; wx += 2) {
  if (Math.abs(wx) < 1.6) continue;
  colliders.push({ x: wx, z: 10.6, r: 1.05 });
}
try {
  const m = await import('./city.js');
  const city = m.buildCity(scene);
  if (city && city.walkMaxZ) BOUNDS.zOut = Math.min(city.walkMaxZ, 40);
  if (city && Array.isArray(city.colliders)) colliders.push(...city.colliders);
} catch (e) { /* เมืองยังไม่ถูกสร้าง = เดันในร้านได้ตามปกติ ไม่พัง */ }

/* ---------- ป้ายแบรนด์ผนังหลัง ---------- */
function brandWallTexture() {
  const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 320;
  const g = cv.getContext('2d');
  g.fillStyle = '#171208'; g.fillRect(0, 0, 1024, 320);
  g.strokeStyle = 'rgba(212,175,55,.5)'; g.lineWidth = 2; g.strokeRect(10, 10, 1004, 300);
  g.fillStyle = '#F5F1E4'; g.font = '700 108px "Cormorant Garamond", serif';
  g.textAlign = 'center'; try { g.letterSpacing = '18px'; } catch (e) {}
  g.fillText('SCENTICAL', 512, 150);
  g.fillStyle = '#D4AF37'; g.font = '300 40px Prompt, sans-serif';
  g.fillText('ของหอมที่มองเห็น · มีพิธี', 512, 235);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const brandWall = new THREE.Mesh(new THREE.PlaneGeometry(5.8, 1.8), new THREE.MeshBasicMaterial({ map: brandWallTexture() }));
brandWall.position.set(0, 3.6, -10.4); scene.add(brandWall);

/* ---------- วางสินค้า 13 ชิ้นลงโต๊ะ (วัตถุจริง ไม่มีกรอบ/แผ่นภาพ) ---------- */
const TABLES = [
  { idx: 0, ids: ['flame-2in1', 'flame-8mode', 'pagoda-cone'] },          // ฮีโร่แถวหน้า
  { idx: 1, ids: ['backflow', 'japan-clouds', 'layer-mountain'] },
  { idx: 2, ids: ['cone-tower', 'house-burner', 'sandalwood-burner'] },
  { idx: 3, ids: ['wire-holder', 'nepal-incense', 'dragon-plate', 'yinyang-burner'] },
];
const byId = Object.fromEntries(PRODUCTS.map((p, i) => [p.id, i]));
const entries = [];
const clickables = [];   // กล่องคลิก (invisible hitbox) — ยิง ray เฉพาะอันนี้ เบาและแม่น ไม่โดนผิวโมเดลแสนเหลี่ยมบัง
const ringGeo = new THREE.RingGeometry(.16, .19, 28);
try {
  if (!Array.isArray(PRODUCTS) || PRODUCTS.length !== 13) throw new Error('products.js ต้องมี 13 สินค้า — ได้ ' + (PRODUCTS && PRODUCTS.length));
  for (const t of TABLES) {
    const tb = room.tables[t.idx];
    t.ids.forEach((id, i) => {
      const pi = byId[id]; if (pi == null) return;
      const g = buildProduct3D(id);
      const sx = -tb.len / 2 + (i + 1) * tb.len / (t.ids.length + 1);
      const wx = tb.x + Math.cos(tb.rot) * sx;
      const wz = tb.z - Math.sin(tb.rot) * sx;
      g.position.set(wx, tb.topY, wz);
      g.rotation.y = Math.random() * Math.PI * 2;
      scene.add(g);
      const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0xD4AF37, transparent: true, opacity: .16, side: THREE.DoubleSide }));
      ring.rotation.x = -Math.PI / 2; ring.position.set(wx, tb.topY + .005, wz); scene.add(ring);
      const entry = { id: pi, data: PRODUCTS[pi], group: g, ring };
      let hitBox = null;
      g.traverse(o => { o.userData.entry = entry; if (o.userData.isHit) hitBox = o; });
      if (hitBox) clickables.push(hitBox); else clickables.push(g);
      entries.push(entry);
    });
  }
  if (entries.length !== 13) throw new Error('วางสินค้าได้ ' + entries.length + '/13 — เช็ค id ใน TABLES ตรง products.js');
} catch (e) { errBox.style.display = 'block'; errBox.textContent = '⚠ ' + e.message; }

/* ---------- pickup controller ---------- */
const pickup = new PickupController(camera, canvas, scene);

/* ---------- loading (เบา: ไม่มี texture โหลด = จบเร็ว) ---------- */
$('barI').style.width = '100%'; $('loadSt').textContent = '100%';
setTimeout(() => $('load').classList.add('off'), 450);

/* ---------- input: เดิน / มอง / หยิบ ---------- */
const keys = {};
addEventListener('keydown', e => {
  keys[e.key.toLowerCase()] = true; poke();
  if (e.key === 'Escape') { closeModal(); $('help').classList.remove('open'); if (pickup.entry) putBack(); }
});
addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; poke(); });

let look = null, itemDrag = null;
canvas.addEventListener('pointerdown', e => {
  poke();
  canvas.setPointerCapture(e.pointerId);
  if (pickup.entry) { itemDrag = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: 0 }; return; }
  if (isTouch && e.clientX < innerWidth * .38 && !joyActive) { joyStart(e); return; }
  look = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: 0 };
  canvas.classList.add('look');
});
canvas.addEventListener('pointermove', e => {
  poke();
  if (itemDrag && e.pointerId === itemDrag.id) {
    const dx = e.clientX - itemDrag.x, dy = e.clientY - itemDrag.y;
    itemDrag.x = e.clientX; itemDrag.y = e.clientY; itemDrag.moved += Math.abs(dx) + Math.abs(dy);
    pickup.rotate(dx, dy);
    return;
  }
  if (joyActive && e.pointerId === joyId) { joyMove(e); return; }
  if (!look || e.pointerId !== look.id) return;
  const dx = e.clientX - look.x, dy = e.clientY - look.y;
  look.x = e.clientX; look.y = e.clientY; look.moved += Math.abs(dx) + Math.abs(dy);
  yaw -= dx * .0044; pitch = THREE.MathUtils.clamp(pitch - dy * .0038, -1.25, .85);
});
canvas.addEventListener('pointerup', e => {
  poke();
  if (itemDrag && e.pointerId === itemDrag.id) { itemDrag = null; return; }
  if (joyActive && e.pointerId === joyId) { joyEnd(); return; }
  if (look && e.pointerId === look.id) {
    if (look.moved < 9) tapWorld(e.clientX, e.clientY);
    look = null; canvas.classList.remove('look');
  }
});
canvas.addEventListener('pointercancel', () => { look = null; itemDrag = null; joyEnd(); });

/* joystick มือถือ */
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

/* ---------- raycast: เล็ง + แตะหยิบ ---------- */
const ray = new THREE.Raycaster(); const v2 = new THREE.Vector2();
function aimRay(cx, cy) {
  v2.set(cx / innerWidth * 2 - 1, -(cy / innerHeight) * 2 + 1);
  ray.setFromCamera(v2, camera);
  const hits = ray.intersectObjects(clickables, false);
  for (const h of hits) {
    if (h.object.userData.entry) return h.object.userData.entry;
  }
  return null;
}
function tapWorld(cx, cy) {
  if (modalOpen || pickup.active) return;
  const entry = aimRay(cx, cy);
  if (entry) { pickup.pick(entry); showInspect(entry); }
}
let hovered = null;
function hoverWorld() {
  if (modalOpen) return;
  if (isTouch) return;
  const entry = aimRay(innerWidth / 2, innerHeight / 2);
  if (entry !== hovered) {
    if (hovered) hovered.ring.material.opacity = .16;
    hovered = entry;
    if (hovered && !pickup.active) hovered.ring.material.opacity = .7;
    $('cross').style.background = hovered ? '#D4AF37' : 'rgba(239,233,218,.85)';
    canvas.style.cursor = hovered ? 'pointer' : 'grab';
  }
}

/* ---------- inspect panel (หยิบสินค้าอยู่) ---------- */
function showInspect(entry) {
  const p = entry.data;
  $('iTh').textContent = p.name_th; $('iEn').textContent = p.name_en;
  $('iPrice').textContent = T[lang].baht + p.price;
  $('iOrderT').textContent = T[lang].order;
  $('iOrder').href = STORE.line;
  $('iPhotoT').textContent = T[lang].photo;
  $('iBackT').textContent = T[lang].putback;
  $('inspect').classList.add('open');
}
function hideInspect() { $('inspect').classList.remove('open'); }
function putBack() { pickup.release(); hideInspect(); hovered = null; poke(); }
$('iBack').addEventListener('click', putBack);
$('iPhoto').addEventListener('click', () => { if (pickup.entry) openModal(pickup.entry.id); });

/* ---------- modal รูปจริง (คง v1) ---------- */
let modalOpen = false;
function openModal(i) {
  const p = PRODUCTS[i]; if (!p) return;
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
  if (modalOpen || pickup.entry) { /* รีเฟรช panel ปัจจุบัน */
    if (pickup.entry) showInspect(pickup.entry);
  }
}
$('th').addEventListener('click', () => { lang = 'th'; applyLang(); poke(); });
$('en').addEventListener('click', () => { lang = 'en'; applyLang(); poke(); });
$('hlp').addEventListener('click', () => { $('help').classList.add('open'); });
$('help').addEventListener('click', e => { if (e.target === $('help')) $('help').classList.remove('open'); });
applyLang();
let hintTimer = setTimeout(() => { $('hint').style.opacity = '0'; }, 30000);

/* ---------- เดิน + loop (render-on-demand) ---------- */
function movePlayer(dt) {
  let mx = 0, mz = 0;
  if (keys['w'] || keys['arrowup']) mz -= 1;
  if (keys['s'] || keys['arrowdown']) mz += 1;
  if (keys['a'] || keys['arrowleft']) mx -= 1;
  if (keys['d'] || keys['arrowright']) mx += 1;
  mx += jx; mz += jy;
  const len = Math.hypot(mx, mz);
  if (len > .01) {
    mx /= Math.max(len, 1); mz /= Math.max(len, 1);
    const fx = -Math.sin(yaw), fz = -Math.cos(yaw);
    const rx = Math.cos(yaw), rz = -Math.sin(yaw);
    player.x += (fx * -mz + rx * mx) * 3.1 * dt;
    player.z += (fz * -mz + rz * mx) * 3.1 * dt;
  }
  player.x = THREE.MathUtils.clamp(player.x, player.z > 11.3 ? -12 : -BOUNDS.x, player.z > 11.3 ? 12 : BOUNDS.x);
  player.z = THREE.MathUtils.clamp(player.z, -BOUNDS.zIn, BOUNDS.zOut);
  for (const c of colliders) {
    const dx = player.x - c.x, dz = player.z - c.z;
    const d = Math.hypot(dx, dz), min = c.r + .3;
    if (d < min && d > 1e-4) { player.x = c.x + dx / d * min; player.z = c.z + dz / d * min; }
  }
  camera.position.set(player.x, 1.55, player.z);
  camera.rotation.set(pitch, yaw, 0);
}
let raf = 0, lastActive = 0, lastFrame = 0, tAnim = 0;
function poke(extraMs = 0) {
  lastActive = Math.max(lastActive, performance.now() + extraMs);
  if (!raf) { lastFrame = performance.now(); raf = requestAnimationFrame(loop); }
}
function loop(now) {
  raf = 0;
  const dt = Math.min((now - lastFrame) / 1000, .05);
  lastFrame = now; tAnim += dt;
  if (!modalOpen && !pickup.active) movePlayer(dt);
  pickup.update(dt);
  hoverWorld();
  for (const e of entries) {
    if (e.group.userData.tick) for (const fn of e.group.userData.tick) fn(tAnim);
  }
  renderer.render(scene, camera);
  if (performance.now() < lastActive || pickup.active || itemDrag || look || joyActive || keys['w'] || keys['a'] || keys['s'] || keys['d'] || keys['arrowup'] || keys['arrowdown'] || keys['arrowleft'] || keys['arrowright']) raf = requestAnimationFrame(loop);
}
poke(3000);

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight); poke();
});
document.addEventListener('visibilitychange', () => { if (!document.hidden) poke(800); }); // กลับมาดูแท็บ = ปลุกระบบให้เรนเดอร์ต่อ (กัน release ค้างกลางอากาศ)
