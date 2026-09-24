// products.js — ข้อมูลจริง 13 สินค้า Scentical (สร้างโดย agent สถาปัตย์ 24 ก.ย. 2026)
// ที่มา: ราคา = PRICE map ใน build_site.py · ชื่อ/คำบรรยาย = content_th_en.py (ตัดจาก body_html จริง)
// รูปหลัก imgFull = GALLERY_ALLOW/FIRST_IMG ใน build_site.py + ls ยืนยันไฟล์จริงใน ../img/
export const STORE = {
  name: "Scentical",
  tagline_th: "ของหอมที่มองเห็น มีพิธี ให้เป็นของขวัญได้",
  tagline_en: "Radiance in Every Scent",
  line: "https://line.me/R/ti/p/@scentical",
  note_th: "pre-order ส่ง 10-14 วัน",
  note_en: "Pre-order, ships in 10-14 days"
};

export const PRODUCTS = [
  {
    id: "flame-8mode",
    name_th: "เครื่องพ่นหอมไฟลาวาพร้อมไฟสีตามอารมณ์",
    name_en: "Flame Aroma Diffuser & Humidifier with LED Mood Light",
    price: 499,
    img: "img/thumbs/flame-aroma-diffuser-air-humidifier-ultr_img_13.webp",
    imgFull: "../img/flame-aroma-diffuser-air-humidifier-ultr/img_13.jpg",
    desc_th: "ไฟลาวาเต็มรูปแบบ 8 โหมดให้เลือกตามอารมณ์ — ตัวท็อปของร้าน",
    desc_en: "8 lighting modes of realistic flame glow — our top pick for bedtime calm.",
    tag: "ฮีโร่",
    x: 0, z: -3
  },
  {
    id: "flame-2in1",
    name_th: "เครื่องพ่นหอมไฟลาวา 2-in-1 (RGB)",
    name_en: "2-in-1 Flame Diffuser & Humidifier (RGB)",
    price: 449,
    img: "img/thumbs/best-selling-usb-ultrasonic-flame-humidi_img_04.webp",
    imgFull: "../img/best-selling-usb-ultrasonic-flame-humidi/img_04.jpg",
    desc_th: "เปลวไฟ RGB วิบวับพร้อมไอหอมบางเบา — เปิดทีไหนมุมนั้นอุ่นขึ้นทันที",
    desc_en: "A flickering RGB flame with soft cool mist — instant warmth for any corner.",
    tag: "ฮีโร่",
    x: -4.8, z: -2.6
  },
  {
    id: "pagoda-cone",
    name_th: "กำยานธรรมชาติกล่องของขวัญ ทรงเจดีย์",
    name_en: "Natural Botanical Cone Incense – Pagoda Gift Box",
    price: 169,
    img: "img/thumbs/natural-cone-incense-pagoda-incense-smal_img_02.webp",
    imgFull: "../img/natural-cone-incense-pagoda-incense-smal/img_02.jpg",
    desc_th: "กำยานพฤกษชาติกดมือในกล่องเจดีย์จิ๋ว — หยิบไปเป็นของขวัญได้เลย ไม่ต้องห่อเพิ่ม",
    desc_en: "Hand-pressed botanical cones in a pagoda box — lovely enough to gift as-is.",
    tag: "ฮีโร่",
    x: 4.8, z: -2.6
  },
  {
    id: "backflow",
    name_th: "เตาธูปกลิ้งเซรามิค “หมอกน้ำตกภูเขา”",
    name_en: "Ceramic Backflow Incense Burner – Waterfall Smoke Mountain",
    price: 299,
    img: "img/thumbs/household-ceramic-incense-stick-backflow_img_01.webp",
    imgFull: "../img/household-ceramic-incense-stick-backflow/img_01.jpg",
    desc_th: "ควันไหลลงซอกภูเขาเซรามิคเหมือนน้ำตกกลางหมอก — ของสวยที่ให้ทั้งกลิ่นและความสงบ ชิ้นเด่นประจำร้าน",
    desc_en: "Watch smoke pour down sculpted ceramic peaks like a misty waterfall — our signature piece.",
    tag: "ของสวยต้องมี",
    x: -6.4, z: -6
  },
  {
    id: "japan-clouds",
    name_th: "ของประดับควันเซรามิคสไตล์ญี่ปุ่น “หมอกและเมฆ”",
    name_en: "Japanese-Style Smoke & Clouds Ceramic Ornament",
    price: 329,
    img: "img/thumbs/japanese-style-ceramic-indoor-view-of-sm_img_01.webp",
    imgFull: "../img/japanese-style-ceramic-indoor-view-of-sm/img_01.jpg",
    desc_th: "จัดวางแล้วเหมือนเมฆพลิ้วยามเช้า — ของประดับที่มีชีวิตขึ้นมาทุกครั้งที่จุดธูป",
    desc_en: "Smoke that curls like clouds over a quiet landscape — beautiful even unlit.",
    tag: "ของสวยต้องมี",
    x: 6.4, z: -6
  },
  {
    id: "layer-mountain",
    name_th: "เตาธูปกลิ้งภูเขาซ้อนชั้น",
    name_en: "Layer Mountain Backflow Incense Burner – Ceramic Cascade",
    price: 279,
    img: "img/thumbs/layer-mountain-ceramic-incense-burner-in_img_01.webp",
    imgFull: "../img/layer-mountain-ceramic-incense-burner-in/img_01.jpg",
    desc_th: "ยอดเขาซ้อนชั้นให้สายหมอกไหลยาวต่อเนื่อง สามสีเคลือบให้เลือก — มุมโปรดของสายถ่ายรูป",
    desc_en: "Handcrafted layered peaks in 3 glazes — a mountain range drawn in smoke.",
    tag: "ของสวยต้องมี",
    x: -10.4, z: -4.4
  },
  {
    id: "cone-tower",
    name_th: "กำยานกลิ้งทรงเจดีย์ 4 กลิ่น",
    name_en: "Backflow Cone Incense Tower – 4 Scents",
    price: 189,
    img: "img/thumbs/inverted-cone-incense-incense-tower-sand_img_01.webp",
    imgFull: "../img/inverted-cone-incense-incense-tower-sand/img_01.jpg",
    desc_th: "กำยานกลิ้งรูกลาง 4 กลิ่น จุดแล้วควันไหลลงเป็นสาย — ชุดเริ่มต้นสำหรับคนเพิ่งเริ่มเล่นสายกลิ่น",
    desc_en: "Hollow-core cones in 4 scents that pour smoke downward — made for backflow burners.",
    tag: "ชุดเริ่มต้น",
    x: 10.4, z: -4.4
  },
  {
    id: "house-burner",
    name_th: "เตาธูปทรงบ้านเซรามิคฝาเปิดได้",
    name_en: "House-Shaped Ceramic Incense Burner – Removable Top (13 cm)",
    price: 249,
    img: "img/thumbs/removable-house-incense-burner_img_04.webp",
    imgFull: "../img/removable-house-incense-burner/img_04.jpg",
    desc_th: "บ้านจิ๋วเซรามิคสูง 13 ซม. ฝาเปิด-ถอดล้างง่าย กลิ่นลอยออกมาจากในบ้านน้อย ๆ อย่างนุ่มนวล",
    desc_en: "A little ceramic house that breathes fragrance — one of our most giftable pieces.",
    tag: "ใช้ทุกวัน",
    x: -8, z: -9
  },
  {
    id: "sandalwood-burner",
    name_th: "เตาเซรามิคทำมือสำหรับธูปไม้จันทน์-อการ์วู้ด",
    name_en: "Handcrafted Ceramic Burner for Sandalwood & Agarwood",
    price: 299,
    img: "img/thumbs/incense-burner-household-indoor-sandalwo_img_01.webp",
    imgFull: "../img/incense-burner-household-indoor-sandalwo/img_01.jpg",
    desc_th: "ออกแบบมาเพื่อกลิ่นไม้โดยเฉพาะ — สองสีเคลือบโทนธรรมชาติ น้ำตาลอุ่นและเบจนุ่ม",
    desc_en: "Made for wood scents — two earthy glazes, warm brown and soft beige.",
    tag: "กลิ่นซิกเนเจอร์",
    x: -4.8, z: -9
  },
  {
    id: "wire-holder",
    name_th: "ที่เสียบธูปเซรามิคขาวาย (ฐานแดง)",
    name_en: "Ceramic Wire Incense Stick Holder – Red Base",
    price: 129,
    img: "img/thumbs/ceramic-wire-incense-burner-home-indoor-_img_01.webp",
    imgFull: "../img/ceramic-wire-incense-burner-home-indoor-/img_01.jpg",
    desc_th: "เล็ก ง่าย ใช้ทุกวัน — ฐานเซรามิคสีแดงรับเถ้าไว้หมด มือไม่เปื้อน",
    desc_en: "One stick, one small sculpture — a bold red base for everyday rituals.",
    tag: "ใช้ทุกวัน",
    x: -1.6, z: -9
  },
  {
    id: "nepal-incense",
    name_th: "ธูปหอมทำมือเนปาล — สมุนไพรหิมาลัย",
    name_en: "Nepal Handmade Incense Sticks – Himalayan Herbs",
    price: 249,
    img: "img/thumbs/nepal-handmade-incense-aromatherapy-joss_img_04.webp",
    imgFull: "../img/nepal-handmade-incense-aromatherapy-joss/img_04.jpg",
    desc_th: "ร้อยมือจากเนปาล กลิ่นสมุนไพรลึก ๆ สงบ ๆ — สำหรับช่วงเวลาพักของตัวเอง",
    desc_en: "Hand-rolled in Nepal from natural Himalayan herbs — clean, earthy, deeply calming.",
    tag: "พรีเมียม",
    x: 1.6, z: -9
  },
  {
    id: "dragon-plate",
    name_th: "จานเตาธูปแบบมังกรคู่สลักนูน",
    name_en: "Double Dragon Incense Plate Burner – Sculpted Ceramic",
    price: 199,
    img: "img/thumbs/double-dragon-incense-plate-incense-burn_img_01.webp",
    imgFull: "../img/double-dragon-incense-plate-incense-burn/img_01.jpg",
    desc_th: "เซรามิคสลักมังกรคู่ลายมงคล — จานรองธูปที่เป็นทั้งเครื่องเซ่นไหว้และของประดับ",
    desc_en: "Two sculpted dragons guard a generous 100 mm tray — a talisman you can actually use.",
    tag: "สะสม",
    x: 4.8, z: -9
  },
  {
    id: "yinyang-burner",
    name_th: "เตาธูปหยินหยางเซรามิคทำมือ",
    name_en: "Yinyang Ceramic Incense Burner – Handcrafted Taijitu",
    price: 259,
    img: "img/thumbs/ceramic-incense-burner-incense-holder-cr_img_03.webp",
    imgFull: "../img/ceramic-incense-burner-incense-holder-cr/img_03.jpg",
    desc_th: "ความสมดุลสองขั้วในชิ้นเดียว — เตาทำมือสำหรับคนที่ชอบเรื่องราวของแต่ละชิ้น",
    desc_en: "Balance in smoke and stone — a handcrafted Taijitu for daily rituals.",
    tag: "สะสม",
    x: 8, z: -9
  }
];

// ── ตารางอ้างอิงราคา (ราคาเสนอ รอแม่ยืนยัน — แก้ที่เดียวที่ PRICE map ใน build_site.py) ──
// ทุกตัว: PRICE map ใน shokun-memory/projects/scentical/build_site.py (24 ก.ย. 2026)
// 3 ฮีโร่ตรวจซ้ำกับ lazada-listing-3hero-2026-09-24.md ตรงเป๊ะ:
//   flame-8mode ฿499 · flame-2in1 ฿449 · pagoda-cone ฿169
// ที่เหลือ (PRICE map): backflow ฿299 · japan-clouds ฿329 · layer-mountain ฿279 · cone-tower ฿189
//   house-burner ฿249 · sandalwood-burner ฿299 · wire-holder ฿129 · nepal-incense ฿249
//   dragon-plate ฿199 · yinyang-burner ฿259
// imgFull ทุกไฟล์ ls ยืนยันมีจริงใน deploy/img/<โฟลเดอร์สินค้า>/ และเป็นรูปแรกตาม
//   FIRST_IMG/GALLERY_ALLOW ใน build_site.py (อนุญาตหลัง audit ตัดภาพ 24 ก.ย. เท่านั้น)
//   3 ฮีโร่ตรงกับรูปหลักลิสต์ Lazada: img_13 / img_04 / img_02
