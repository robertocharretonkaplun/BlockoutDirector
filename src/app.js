import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createPromptTools } from './promptTools.js';
import { t, getLang, setLang, applyStaticI18n } from './i18n.js';

/* ============================================================
   NUCLEO - utilidades, estado, escena base, selección, render
   ============================================================ */
const $ = id => document.getElementById(id);
const DEG = THREE.MathUtils.degToRad, RAD = THREE.MathUtils.radToDeg;
let _uid = 1;
const uid = p => p + '_' + Date.now().toString(36) + (_uid++).toString(36);
const v3 = v => [+v.x.toFixed(4), +v.y.toFixed(4), +v.z.toFixed(4)];
const eDeg = e => [+RAD(e.x).toFixed(2), +RAD(e.y).toFixed(2), +RAD(e.z).toFixed(2)];

function toast(msg, ms = 2800) {
  const d = document.createElement('div');
  d.className = 'toastMsg'; d.textContent = t(msg);
  $('toast').appendChild(d);
  setTimeout(() => d.remove(), ms);
}
function bufToB64(buf){ const b=new Uint8Array(buf); let s=''; for(let i=0;i<b.length;i+=0x8000) s+=String.fromCharCode.apply(null,b.subarray(i,i+0x8000)); return btoa(s); }
function b64ToBuf(b64){ const s=atob(b64); const b=new Uint8Array(s.length); for(let i=0;i<s.length;i++) b[i]=s.charCodeAt(i); return b.buffer; }
function download(name, href){ const a=document.createElement('a'); a.href=href; a.download=name; document.body.appendChild(a); a.click(); a.remove(); }
function sanitize(s){ return (s||'x').replace(/[^\wáéíóúñÁÉÍÓÚÑ-]+/g,'_').slice(0,60); }

// ---------- estado global ----------
const R = { characters: [], props: [], cameras: [], shots: [], captures: [], assets: {} };
let sceneName = 'Escena_001', sceneDesc = '';
let booting = false;
let selected = null;

const SKY_PRESETS = {
  dia:      { label:'Día',       top:'#3f7fd6', bottom:'#dceaf7', sun:3.2, sunColor:'#fff7e8', amb:0.95, ambColor:'#cfe2f3' },
  amanecer: { label:'Amanecer',  top:'#6b83c9', bottom:'#ffd9a8', sun:2.4, sunColor:'#ffd9a0', amb:0.7,  ambColor:'#d8c9e8' },
  atardecer:{ label:'Atardecer', top:'#4a2a6b', bottom:'#ff9a55', sun:2.2, sunColor:'#ffb066', amb:0.65, ambColor:'#e8b48c' },
  noche:    { label:'Noche',     top:'#05070f', bottom:'#16233f', sun:0.6, sunColor:'#9db8ff', amb:0.35, ambColor:'#5570a8' },
  interior: { label:'Interior',  top:'#46474d', bottom:'#8b8d95', sun:2.4, sunColor:'#fff2df', amb:0.85, ambColor:'#cdd3da' },
  espacio:  { label:'Espacio',   top:'#010104', bottom:'#0b0d1c', sun:1.8, sunColor:'#dfe8ff', amb:0.3,  ambColor:'#3c4668' }
};
const FLOORS = {
  madera:  { label:'Madera',   color:'#8a6a48' },
  concreto:{ label:'Concreto', color:'#8f9298' },
  pasto:   { label:'Pasto',    color:'#5e8f4e' },
  arena:   { label:'Arena',    color:'#cfba8f' },
  negro:   { label:'Negro',    color:'#17181c' },
  blanco:  { label:'Blanco',   color:'#e2e4e8' }
};
const env = { sky:'interior', floor:'madera', grid:true, shadows:true, fog:false, labels:true,
              sun:2.4, sunColor:'#fff2df', sunElev:52, sunAzim:35, amb:0.85, ambColor:'#cdd3da' };

// ---------- three.js base ----------
const renderer = new THREE.WebGLRenderer({ canvas: $('c'), antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
const freeCam = new THREE.PerspectiveCamera(55, innerWidth/innerHeight, 0.1, 1400);
freeCam.position.set(6.5, 4.2, 8.5);
let viewCam = freeCam;          // cámara que dibuja el viewport principal
let activeCamEnt = null;        // entidad cámara activa cuando viewCam !== freeCam
const freeTargetSaved = new THREE.Vector3(0, 1, 0);

const controls = new OrbitControls(freeCam, renderer.domElement);
controls.target.set(0, 1, 0);
controls.enableDamping = true; controls.dampingFactor = 0.09;
controls.maxPolarAngle = Math.PI * 0.495;
controls.minDistance = 0.4; controls.maxDistance = 160;
// Navegación estilo Unreal: el clic izquierdo queda libre para el "vuelo" (ver más abajo).
// Orbitar = botón central o Alt+clic izquierdo; paneo = clic derecho; zoom = rueda.
controls.mouseButtons = { LEFT: null, MIDDLE: THREE.MOUSE.ROTATE, RIGHT: THREE.MOUSE.PAN };

// cielo degradado
const skyMat = new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, fog: false,
  uniforms: {
    topColor:    { value: new THREE.Color('#46474d') },
    bottomColor: { value: new THREE.Color('#8b8d95') },
    offset:      { value: 30 },
    exponent:    { value: 0.65 }
  },
  vertexShader: `varying vec3 vWorldPosition;
    void main(){ vec4 wp = modelMatrix * vec4(position,1.0); vWorldPosition = wp.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: `uniform vec3 topColor; uniform vec3 bottomColor; uniform float offset; uniform float exponent;
    varying vec3 vWorldPosition;
    void main(){ float h = normalize(vWorldPosition + vec3(0.0, offset, 0.0)).y;
      gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h,0.0), exponent), 0.0)), 1.0); }`
});
const sky = new THREE.Mesh(new THREE.SphereGeometry(500, 32, 15), skyMat);
sky.userData.noPick = true;
scene.add(sky);

// luces
const hemi = new THREE.HemisphereLight(0xcdd3da, 0x55524c, 0.85);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff2df, 2.4);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -24; sun.shadow.camera.right = 24;
sun.shadow.camera.top = 24; sun.shadow.camera.bottom = -24;
sun.shadow.camera.near = 0.5; sun.shadow.camera.far = 120;
sun.shadow.bias = -0.0004;
scene.add(sun); scene.add(sun.target);

// suelo + grid
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(260, 260),
  new THREE.MeshStandardMaterial({ color: 0x8a6a48, roughness: 0.9, metalness: 0 })
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
floor.userData.isFloor = true;
scene.add(floor);

const grid = new THREE.GridHelper(80, 80, 0x000000, 0x000000);
grid.material.opacity = 0.14; grid.material.transparent = true;
grid.position.y = 0.012;
grid.userData.noPick = true;
scene.add(grid);

// anillo de selección (marca rosa bajo el objeto seleccionado)
const selRing = new THREE.Mesh(
  new THREE.RingGeometry(0.42, 0.5, 48),
  new THREE.MeshBasicMaterial({ color: 0xff4d8d, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false })
);
selRing.rotation.x = -Math.PI / 2;
selRing.visible = false;
selRing.userData.noPick = true;
scene.add(selRing);

// gizmo de transformación
const tc = new TransformControls(freeCam, renderer.domElement);
tc.size = 0.85;
tc.addEventListener('dragging-changed', e => {
  controls.enabled = !e.value;
  if (e.value) pushUndo(); else syncInspectorFromSel();
});
tc.addEventListener('objectChange', () => {
  if (selected && selected.kind === 'camera') selected.root.scale.set(1, 1, 1);
  syncInspectorFromSel();
});
scene.add(tc);

function setTool(mode) {
  tc.setMode(mode);
  document.querySelectorAll('#toolSeg .btn').forEach(b => b.classList.toggle('active', b.dataset.tool === mode));
}
document.querySelectorAll('#toolSeg .btn').forEach(b => b.onclick = () => setTool(b.dataset.tool));

// ---------- entorno ----------
function applyEnv() {
  const p = SKY_PRESETS[env.sky];
  skyMat.uniforms.topColor.value.set(p.top);
  skyMat.uniforms.bottomColor.value.set(p.bottom);
  hemi.intensity = env.amb;
  hemi.color.set(env.ambColor);
  hemi.groundColor.set(new THREE.Color(env.ambColor).multiplyScalar(0.45));
  sun.intensity = env.sun;
  sun.color.set(env.sunColor);
  const el = DEG(env.sunElev), az = DEG(env.sunAzim);
  sun.position.set(Math.cos(el) * Math.sin(az) * 30, Math.sin(el) * 30, Math.cos(el) * Math.cos(az) * 30);
  sun.castShadow = env.shadows;
  floor.material.color.set(FLOORS[env.floor].color);
  grid.visible = env.grid;
  scene.fog = env.fog ? new THREE.Fog(new THREE.Color(p.bottom), 18, 120) : null;
}
function syncEnvUI() {
  document.querySelectorAll('#skyChips .chip').forEach(c => c.classList.toggle('active', c.dataset.sky === env.sky));
  $('selFloor').value = env.floor;
  $('chkGrid').checked = env.grid; $('chkShadows').checked = env.shadows;
  $('chkFog').checked = env.fog; $('chkLabels').checked = env.labels;
  $('rngSun').value = env.sun; $('colSun').value = env.sunColor;
  $('rngSunElev').value = env.sunElev; $('rngSunAzim').value = env.sunAzim;
  $('rngAmb').value = env.amb; $('colAmb').value = env.ambColor;
}
// deslizadores: snapshot de undo al iniciar el gesto
['rngSun','rngSunElev','rngSunAzim','rngAmb'].forEach(id => $(id).addEventListener('pointerdown', () => pushUndo()));
$('rngSun').addEventListener('input', e => { env.sun = +e.target.value; applyEnv(); });
$('rngSunElev').addEventListener('input', e => { env.sunElev = +e.target.value; applyEnv(); });
$('rngSunAzim').addEventListener('input', e => { env.sunAzim = +e.target.value; applyEnv(); });
$('rngAmb').addEventListener('input', e => { env.amb = +e.target.value; applyEnv(); });
$('colSun').addEventListener('change', e => { pushUndo(); env.sunColor = e.target.value; applyEnv(); });
$('colAmb').addEventListener('change', e => { pushUndo(); env.ambColor = e.target.value; applyEnv(); });
$('selFloor').addEventListener('change', e => { pushUndo(); env.floor = e.target.value; applyEnv(); });
$('chkGrid').addEventListener('change', e => { env.grid = e.target.checked; applyEnv(); });
$('chkShadows').addEventListener('change', e => { env.shadows = e.target.checked; applyEnv(); });
$('chkFog').addEventListener('change', e => { env.fog = e.target.checked; applyEnv(); });
$('chkLabels').addEventListener('change', e => { env.labels = e.target.checked; });

// ---------- selección por clic ----------
const ray = new THREE.Raycaster();
const pDown = new THREE.Vector2();
let downOnGizmo = false;
renderer.domElement.addEventListener('pointerdown', e => {
  pDown.set(e.clientX, e.clientY);
  downOnGizmo = !!tc.axis;
});
renderer.domElement.addEventListener('pointerup', e => {
  if (e.button !== 0 || downOnGizmo || tc.dragging) return;
  if (Math.hypot(e.clientX - pDown.x, e.clientY - pDown.y) > 5) return;
  pick(e);
});
function findEnt(id) {
  return R.characters.find(c => c.id === id) || R.props.find(p => p.id === id) || R.cameras.find(c => c.id === id) || null;
}
function pick(e) {
  const ndc = new THREE.Vector2((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  ray.setFromCamera(ndc, viewCam);
  const hits = ray.intersectObjects(scene.children, true);
  for (const h of hits) {
    let o = h.object, bad = false, ent = null;
    while (o) {
      if (o.userData.noPick || o === tc) { bad = true; break; }
      if (o.userData.entId) { ent = findEnt(o.userData.entId); break; }
      o = o.parent;
    }
    if (bad) continue;
    if (ent) { setSelected(ent); return; }
    if (h.object.userData.isFloor) break;
  }
  setSelected(null);
}
function tagEnt(root, id) { root.traverse(o => { o.userData.entId = id; }); }

// ---------- etiquetas flotantes ----------
const labelsEl = $('labels');
const labelPool = new Map();
const _lv = new THREE.Vector3();
function updateLabels() {
  const used = new Set();
  if (env.labels) {
    const place = (id, text, wx, wy, wz, cls) => {
      _lv.set(wx, wy, wz).project(viewCam);
      if (_lv.z > 1 || _lv.z < -1 || Math.abs(_lv.x) > 1.15 || Math.abs(_lv.y) > 1.15) return;
      let d = labelPool.get(id);
      if (!d) { d = document.createElement('div'); d.className = 'label3d' + (cls ? ' ' + cls : ''); labelsEl.appendChild(d); labelPool.set(id, d); }
      if (d.textContent !== text) d.textContent = text;
      d.style.left = ((_lv.x * 0.5 + 0.5) * innerWidth) + 'px';
      d.style.top = ((-_lv.y * 0.5 + 0.5) * innerHeight) + 'px';
      used.add(id);
    };
    for (const c of R.characters) {
      const p = c.root.position;
      place(c.id, c.name, p.x, p.y + (c.labelY || 1.95) * c.root.scale.y, p.z);
    }
    for (const c of R.cameras) {
      if (viewCam === c.cam) continue;
      const p = c.cam.position;
      place(c.id, `${c.name} · ${Math.round(c.cam.fov)}°`, p.x, p.y + 0.3, p.z, 'camlbl');
    }
  }
  for (const [id, d] of labelPool) if (!used.has(id)) { d.remove(); labelPool.delete(id); }
}

// ---------- render limpio (sin ayudas visuales) ----------
function collectClutter() {
  const list = [grid, selRing, tc];
  for (const c of R.cameras) { list.push(c.viz); if (c.pathViz) list.push(c.pathViz); }
  for (const e of [...R.characters, ...R.props]) if (e.pathViz) list.push(e.pathViz);
  for (const p of R.props) if (p.type === 'luz' && p.marker) list.push(p.marker);
  return list;
}
function cleanRender(rndr, cam, w, h) {
  const hidden = [];
  for (const o of collectClutter()) if (o && o.visible) { o.visible = false; hidden.push(o); }
  const pa = cam.aspect;
  cam.aspect = w / h; cam.updateProjectionMatrix();
  rndr.render(scene, cam);
  cam.aspect = pa; cam.updateProjectionMatrix();
  for (const o of hidden) o.visible = true;
}

// ---------- bucle principal ----------
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const dt = clock.getDelta();
  tickPlayback(dt);
  controls.update();

  if (selected) {
    selRing.visible = true;
    const p = selected.root.position;
    selRing.position.set(p.x, 0.02, p.z);
    selRing.scale.setScalar((selected.ringScale || 1) * Math.max(Math.abs(selected.root.scale.x), 0.2));
  } else selRing.visible = false;

  updateLabels();

  if (viewCam === freeCam) {
    renderer.render(scene, viewCam);
  } else {
    const hidden = [];
    if (activeCamEnt) {
      if (activeCamEnt.viz.visible) { activeCamEnt.viz.visible = false; hidden.push(activeCamEnt.viz); }
    }
    const pa = viewCam.aspect;
    viewCam.aspect = innerWidth / innerHeight; viewCam.updateProjectionMatrix();
    renderer.render(scene, viewCam);
    viewCam.aspect = pa; viewCam.updateProjectionMatrix();
    for (const o of hidden) o.visible = true;
  }
  renderPip();
}

addEventListener('resize', () => {
  renderer.setSize(innerWidth, innerHeight);
  freeCam.aspect = innerWidth / innerHeight;
  freeCam.updateProjectionMatrix();
});

// ---------- atajos de teclado ----------
addEventListener('keydown', e => {
  if (e.target.matches('input,textarea,select')) return;
  const k = e.key.toLowerCase();
  // con el lanzador de proyectos abierto solo se atiende Escape
  if (!$('launcher').classList.contains('hidden')) {
    if (e.key === 'Escape') {
      if (!$('modalBack').classList.contains('hidden')) closeModal();
      else closeLauncher();
    }
    return;
  }
  if (e.ctrlKey && k === 'z') { e.preventDefault(); doUndo(); }
  else if (e.ctrlKey && k === 'y') { e.preventDefault(); doRedo(); }
  else if (e.ctrlKey && k === 'd') { e.preventDefault(); if (selected) duplicateEnt(selected); }
  else if (e.key === 'Delete' && selected) deleteEnt(selected);
  else if (k === 'w') setTool('translate');
  else if (k === 'e') setTool('rotate');
  else if (k === 'r') setTool('scale');
  else if (k === 'f' && selected) { controls.target.copy(selected.root.position).add(new THREE.Vector3(0, 0.9, 0)); }
  else if (e.key === 'Escape') {
    if (!$('modalBack').classList.contains('hidden')) closeModal();
    else setSelected(null);
  }
});

// colapsar tarjetas del panel izquierdo
document.querySelectorAll('#leftPanel .card .hd').forEach(h => {
  h.addEventListener('click', () => h.parentElement.classList.toggle('closed'));
});

$('inpSceneName').addEventListener('change', e => { sceneName = e.target.value || 'Escena'; });
$('inpSceneDesc').addEventListener('change', e => { sceneDesc = e.target.value; });
$('btnUndo').onclick = () => doUndo();
$('btnRedo').onclick = () => doRedo();

/* ============================================================
   MANIQUIES - construcción articulada y sistema de poses
   ============================================================ */
const BASE_HIPS = 0.95;
const JOINT_LABELS = {
  hips:'Cadera', spine:'Columna', chest:'Pecho', neck:'Cuello / cabeza',
  shoulderL:'Hombro izq.', elbowL:'Codo izq.', shoulderR:'Hombro der.', elbowR:'Codo der.',
  hipL:'Pierna izq.', kneeL:'Rodilla izq.', footL:'Pie izq.',
  hipR:'Pierna der.', kneeR:'Rodilla der.', footR:'Pie der.'
};
const CHAR_COLORS = ['#e8896a','#e6c84f','#63b56a','#2fa8a8','#d94f6e','#8a6fd6','#5b8dd9','#9aa0a8'];
let colorIdx = 0;

function _capsule(r, len, mat) {
  const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 4, 12), mat);
  m.castShadow = true;
  return m;
}
function buildMannequin(colorHex) {
  const mat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.65, metalness: 0.05 });
  const root = new THREE.Group();
  const J = {};
  const g = (parent, x, y, z) => { const gr = new THREE.Group(); gr.position.set(x, y, z); parent.add(gr); return gr; };

  J.hips = g(root, 0, BASE_HIPS, 0);
  const pelvis = _capsule(0.11, 0.08, mat); pelvis.scale.set(1.15, 0.8, 0.9); pelvis.position.y = 0.02; J.hips.add(pelvis);

  J.spine = g(J.hips, 0, 0.12, 0);
  const belly = _capsule(0.1, 0.1, mat); belly.position.y = 0.05; belly.scale.set(1.05, 1, 0.85); J.spine.add(belly);

  J.chest = g(J.spine, 0, 0.16, 0);
  const chestM = _capsule(0.115, 0.13, mat); chestM.position.y = 0.07; chestM.scale.set(1.18, 1, 0.85); J.chest.add(chestM);

  J.neck = g(J.chest, 0, 0.21, 0);
  const neckM = _capsule(0.04, 0.05, mat); neckM.position.y = 0.02; J.neck.add(neckM);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.105, 20, 16), mat);
  head.castShadow = true; head.position.y = 0.17; head.scale.set(0.88, 1.05, 0.92); J.neck.add(head);

  for (const side of ['L', 'R']) {
    const sx = side === 'L' ? 1 : -1;
    const sh = g(J.chest, sx * 0.21, 0.15, 0); J['shoulder' + side] = sh;
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 10), mat); ball.castShadow = true; sh.add(ball);
    const upArm = _capsule(0.05, 0.18, mat); upArm.position.y = -0.15; sh.add(upArm);
    const el = g(sh, 0, -0.3, 0); J['elbow' + side] = el;
    const fore = _capsule(0.045, 0.16, mat); fore.position.y = -0.12; el.add(fore);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 10), mat);
    hand.castShadow = true; hand.position.y = -0.27; hand.scale.set(0.8, 1.15, 0.9); el.add(hand);

    const hip = g(J.hips, sx * 0.105, -0.03, 0); J['hip' + side] = hip;
    const thigh = _capsule(0.07, 0.26, mat); thigh.position.y = -0.2; hip.add(thigh);
    const knee = g(hip, 0, -0.42, 0); J['knee' + side] = knee;
    const shin = _capsule(0.055, 0.26, mat); shin.position.y = -0.19; knee.add(shin);
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.07, 0.26), mat);
    foot.castShadow = true; foot.position.set(0, -0.45, 0.06); knee.add(foot);
  }
  return { root, joints: J, mat };
}

// Poses predefinidas: rotaciones en grados por articulación (+ desplazamiento de cadera)
const POSES = {
  'De pie':          { j: {} },
  'De pie relajado': { j: { shoulderL:[0,0,6], shoulderR:[0,0,-6], neck:[3,8,0], spine:[0,4,0] } },
  'Caminando':       { j: { hipL:[-27,0,0], kneeL:[12,0,0], hipR:[22,0,0], kneeR:[40,0,0], shoulderL:[22,0,0], shoulderR:[-24,0,0], elbowL:[-15,0,0], elbowR:[-30,0,0], chest:[4,6,0] } },
  'Corriendo':       { j: { hipL:[-55,0,0], kneeL:[25,0,0], hipR:[35,0,0], kneeR:[95,0,0], shoulderL:[45,0,0], elbowL:[-95,0,0], shoulderR:[-50,0,0], elbowR:[-95,0,0], chest:[14,0,0], neck:[-6,0,0] }, hipsOffset: -0.06 },
  'Sentado':         { j: { hipL:[-86,0,4], hipR:[-86,0,-4], kneeL:[84,0,0], kneeR:[84,0,0], shoulderL:[-14,0,4], shoulderR:[-14,0,-4], elbowL:[-25,0,0], elbowR:[-25,0,0], chest:[4,0,0] }, hipsOffset: -0.42 },
  'Sentado hablando':{ j: { hipL:[-86,0,6], hipR:[-86,0,-6], kneeL:[80,0,0], kneeR:[84,0,0], shoulderR:[-55,0,-18], elbowR:[-70,0,0], shoulderL:[-12,0,5], elbowL:[-20,0,0], chest:[6,-8,0], neck:[0,10,0] }, hipsOffset: -0.42 },
  'Hablando':        { j: { shoulderR:[-45,0,-15], elbowR:[-60,0,0], shoulderL:[-15,0,8], elbowL:[-25,0,0], neck:[0,6,0], chest:[2,-5,0] } },
  'Señalando':       { j: { shoulderR:[-85,0,-5], elbowR:[-8,0,0], neck:[0,-8,0], chest:[2,-10,0], shoulderL:[0,0,5] } },
  'Agachado':        { j: { hipL:[-105,0,8], hipR:[-105,0,-8], kneeL:[125,0,0], kneeR:[125,0,0], chest:[28,0,0], shoulderL:[-35,0,10], shoulderR:[-35,0,-10], elbowL:[-45,0,0], elbowR:[-45,0,0], neck:[-18,0,0] }, hipsOffset: -0.55 },
  'Defensivo':       { j: { shoulderL:[-55,0,-20], elbowL:[-105,0,0], shoulderR:[-60,0,25], elbowR:[-100,0,0], chest:[10,-12,0], hipL:[-18,0,0], hipR:[8,0,0], kneeL:[22,0,0], kneeR:[12,0,0], neck:[6,0,0] }, hipsOffset: -0.08 },
  'Triste':          { j: { neck:[22,0,0], chest:[10,0,0], shoulderL:[4,0,3], shoulderR:[4,0,-3], spine:[4,0,0] } },
  'Sorprendido':     { j: { shoulderL:[-95,0,25], shoulderR:[-95,0,-25], elbowL:[-30,0,0], elbowR:[-30,0,0], neck:[-12,0,0], chest:[-4,0,0] } },
  'Enojado':         { j: { shoulderL:[-25,0,-8], elbowL:[-115,0,0], shoulderR:[-25,0,8], elbowR:[-115,0,0], chest:[8,0,0], neck:[8,0,0] } },
  'Manos en cintura':{ j: { shoulderL:[0,0,40], elbowL:[-75,-50,0], shoulderR:[0,0,-40], elbowR:[-75,50,0] } },
  'Alcanzar objeto': { j: { shoulderR:[-70,0,-10], elbowR:[-15,0,0], chest:[8,0,0], hipL:[-8,0,0], hipR:[6,0,0], neck:[4,0,0] } }
};
let customPoses = {};
try { customPoses = JSON.parse(localStorage.getItem('bd_poses') || '{}'); } catch { customPoses = {}; }
function getPose(name) { return POSES[name] || customPoses[name] || null; }
function allPoseNames() { return [...Object.keys(POSES), ...Object.keys(customPoses)]; }

function applyPose(ent, poseDef, name) {
  if (!poseDef) return;
  if (ent.rig) { applyPoseToRig(ent, poseDef, name); return; }
  if (!ent.joints) return;
  for (const k in ent.joints) ent.joints[k].rotation.set(0, 0, 0);
  ent.joints.hips.position.y = BASE_HIPS + (poseDef.hipsOffset || 0);
  for (const k in (poseDef.j || {})) {
    const j = ent.joints[k]; if (!j) continue;
    const r = poseDef.j[k];
    j.rotation.set(DEG(r[0]), DEG(r[1]), DEG(r[2]));
  }
  ent.poseName = name || 'Personalizada';
}
function applyPoseByName(ent, name) { applyPose(ent, getPose(name), name); }
function currentPoseOf(ent) {
  if (!ent.joints) return ent.curPose ? JSON.parse(JSON.stringify(ent.curPose)) : { j: {}, hipsOffset: 0 };
  const j = {};
  for (const k in ent.joints) {
    const r = ent.joints[k].rotation;
    const deg = [+RAD(r.x).toFixed(1), +RAD(r.y).toFixed(1), +RAD(r.z).toFixed(1)];
    if (deg.some(v => Math.abs(v) > 0.05)) j[k] = deg;
  }
  return { j, hipsOffset: +(ent.joints.hips.position.y - BASE_HIPS).toFixed(3) };
}
function saveCustomPose(name, pose) {
  customPoses[name] = pose;
  try { localStorage.setItem('bd_poses', JSON.stringify(customPoses)); } catch {}
}

// punto de aparición: delante de la cámara actual, sobre el suelo
function spawnPos() {
  const dir = new THREE.Vector3();
  viewCam.getWorldDirection(dir);
  const p = viewCam.position.clone().add(dir.multiplyScalar(5));
  p.y = 0;
  p.x += (Math.random() - 0.5) * 0.8; p.z += (Math.random() - 0.5) * 0.8;
  return p;
}

function addMannequin(opts = {}) {
  if (!opts.noUndo) pushUndo();
  const color = opts.color || CHAR_COLORS[colorIdx++ % CHAR_COLORS.length];
  const { root, joints, mat } = buildMannequin(color);
  const id = opts.id || uid('char');
  const ent = {
    kind: 'character', charKind: 'mannequin', id,
    name: opts.name || `${t('Personaje')} ${R.characters.length + 1}`,
    role: opts.role || '', emotion: opts.emotion || '', notes: opts.notes || '',
    colorHex: color, root, joints, mat, poseName: 'De pie', ringScale: 1,
    path: opts.path ? JSON.parse(JSON.stringify(opts.path)) : { interpolation: 'catmullrom', keyframes: [] },
    pathViz: null
  };
  const p = opts.pos || spawnPos();
  root.position.copy(p instanceof THREE.Vector3 ? p : new THREE.Vector3(...p));
  if (opts.rotY !== undefined) root.rotation.y = DEG(opts.rotY);
  tagEnt(root, id);
  scene.add(root);
  R.characters.push(ent);
  updatePathViz(ent);
  applyPoseByName(ent, opts.pose || 'De pie');
  renderCharList();
  if (!opts.noSelect) setSelected(ent);
  return ent;
}

/* ---------- modelo de personaje por defecto (GLB del usuario) ---------- */
const DEFAULT_CHAR_ID = 'asset_defaultchar';
const DEFAULT_CHAR_KEY = 'bd_default_char';
let defaultChar = null; // {name, b64}

function registerDefaultChar(name, b64, persist) {
  defaultChar = { name, b64 };
  R.assets[DEFAULT_CHAR_ID] = { name, b64 };
  if (persist) { try { localStorage.setItem(DEFAULT_CHAR_KEY, JSON.stringify(defaultChar)); } catch {} }
  updateCharModelHint();
}
function updateCharModelHint() {
  const el = $('charModelHint');
  if (el) el.textContent = defaultChar
    ? t('Modelo actual: {n} (con poses retargeteadas a su esqueleto)', { n: defaultChar.name })
    : t('Sin GLB cargado: «+ Personaje» crea maniquíes. Usa «Cambiar modelo» para usar tu personaje.');
}
async function tryLoadDefaultChar() {
  try {
    const saved = JSON.parse(localStorage.getItem(DEFAULT_CHAR_KEY) || 'null');
    if (saved && saved.b64) { registerDefaultChar(saved.name, saved.b64, false); return; }
  } catch {}
  try {
    const resp = await fetch('Slate/exported-model.glb');
    if (resp.ok) {
      registerDefaultChar('exported-model', bufToB64(await resp.arrayBuffer()), true);
      return;
    }
  } catch {}
  updateCharModelHint();
}
function ensureDefaultAsset() {
  if (defaultChar && !R.assets[DEFAULT_CHAR_ID]) R.assets[DEFAULT_CHAR_ID] = { ...defaultChar };
}
// crea un personaje con el modelo por defecto (GLB del usuario si existe, si no maniquí)
function addCharacterAuto(opts = {}) {
  if (!defaultChar) return addMannequin(opts);
  ensureDefaultAsset();
  if (!opts.noUndo) pushUndo();
  const poseName = opts.pose || 'De pie';
  instantiateGlb(DEFAULT_CHAR_ID, 'character', {
    id: opts.id, name: opts.name || `Personaje ${R.characters.length + 1}`,
    role: opts.role || '', emotion: opts.emotion || '', notes: opts.notes || '',
    color: opts.color || null,
    pos: opts.pos ? (opts.pos instanceof THREE.Vector3 ? v3(opts.pos) : opts.pos) : v3(spawnPos()),
    rot: [0, opts.rotY || 0, 0],
    pose: getPose(poseName), poseName
  }, !opts.noSelect);
}

/* ---------- retarget de poses a esqueletos GLB ---------- */
const RIG_PATTERNS = {
  hips: ['pelvis', 'hips', 'hip'],
  spine: ['spine_01', 'spine1', 'spine'],
  chest: ['spine_03', 'spine_02', 'spine2', 'chest', 'upperchest'],
  neck: ['neck_01', 'neck', 'head'],
  shoulderL: ['upperarm_l', 'leftarm', 'upper_arm.l', 'upper_arml', 'l_upperarm', 'arm_l'],
  elbowL: ['lowerarm_l', 'leftforearm', 'forearm.l', 'forearml', 'l_forearm', 'forearm_l'],
  shoulderR: ['upperarm_r', 'rightarm', 'upper_arm.r', 'upper_armr', 'r_upperarm', 'arm_r'],
  elbowR: ['lowerarm_r', 'rightforearm', 'forearm.r', 'forearmr', 'r_forearm', 'forearm_r'],
  hipL: ['thigh_l', 'leftupleg', 'upper_leg.l', 'upleg_l', 'l_thigh'],
  kneeL: ['calf_l', 'leftleg', 'lower_leg.l', 'shin.l', 'l_calf', 'leg_l'],
  footL: ['foot_l', 'leftfoot', 'foot.l', 'l_foot', 'ankle_l', 'leftankle'],
  hipR: ['thigh_r', 'rightupleg', 'upper_leg.r', 'upleg_r', 'r_thigh'],
  kneeR: ['calf_r', 'rightleg', 'lower_leg.r', 'shin.r', 'r_calf', 'leg_r'],
  footR: ['foot_r', 'rightfoot', 'foot.r', 'r_foot', 'ankle_r', 'rightankle']
};
const _IDQ = new THREE.Quaternion();

function buildRig(model, wrap) {
  const bones = [];
  model.traverse(o => { if (o.isBone) bones.push(o); });
  if (!bones.length) return null;
  const clean = n => n.toLowerCase().replace(/^mixamorig:?/, '').replace(/\s+/g, '');
  const used = new Set();
  const map = {};
  for (const [joint, pats] of Object.entries(RIG_PATTERNS)) {
    for (const pat of pats) {
      const b = bones.find(bo => {
        const n = clean(bo.name);
        if (used.has(bo) || /twist|leaf|_ik|ik_|roll|_end/.test(n)) return false;
        if (joint.startsWith('shoulder') && /fore|lower|hand/.test(n)) return false;
        return n.includes(pat);
      });
      if (b) { map[joint] = b; used.add(b); break; }
    }
  }
  if (!map.hips || !map.shoulderL || !map.shoulderR || !map.hipL || !map.hipR) return null;
  wrap.updateMatrixWorld(true);
  // orientaciones de bind (mundo y local) de todos los nodos del modelo
  const bindW = new Map();
  model.traverse(o => {
    const q = new THREE.Quaternion();
    o.getWorldQuaternion(q);
    bindW.set(o, q);
  });
  // corrección de bind: normaliza extremidades a direcciones canónicas (colgando
  // hacia abajo) aunque el modelo venga en T-pose, A-pose o una postura idle.
  // Así las poses de la biblioteca aterrizan igual en cualquier esqueleto.
  const rest = {};
  const wpos = b => new THREE.Vector3().setFromMatrixPosition(b.matrixWorld);
  const findBone = pats => bones.find(bo => {
    const n = clean(bo.name);
    return !/twist|leaf|_ik|ik_|roll|_end/.test(n) && pats.some(p => n.includes(p));
  });
  const limbRest = (rootJ, midJ, endPats, tx) => {
    const a = map[rootJ], b = map[midJ];
    if (!a || !b) return;
    const target = new THREE.Vector3(tx, -1, 0).normalize();
    const d = wpos(b).sub(wpos(a));
    if (d.lengthSq() < 1e-8) return;
    d.normalize();
    if (d.angleTo(target) > 0.02) rest[rootJ] = new THREE.Quaternion().setFromUnitVectors(d, target);
    const end = findBone(endPats);
    if (!end) return;
    const d2 = wpos(end).sub(wpos(b));
    if (d2.lengthSq() < 1e-8) return;
    d2.normalize();
    if (rest[rootJ]) d2.applyQuaternion(rest[rootJ]);
    if (d2.angleTo(target) > 0.02) rest[midJ] = new THREE.Quaternion().setFromUnitVectors(d2, target);
  };
  limbRest('shoulderL', 'elbowL', ['hand_l', 'lefthand', 'hand.l'], 0.12);
  limbRest('shoulderR', 'elbowR', ['hand_r', 'righthand', 'hand.r'], -0.12);
  limbRest('hipL', 'kneeL', ['foot_l', 'leftfoot', 'foot.l'], 0.03);
  limbRest('hipR', 'kneeR', ['foot_r', 'rightfoot', 'foot.r'], -0.03);
  // Correccion de yaw del pie: algunos rigs tienen el hueso foot apuntando de lado.
  // Usamos el vector foot -> ball/toe para alinear los dedos al frente del personaje.
  const footFix = {};
  const footForwardFix = (footJ, toePats) => {
    const foot = map[footJ], toe = findBone(toePats);
    if (!foot || !toe) return;
    const d = wpos(toe).sub(wpos(foot));
    d.y = 0;
    if (d.lengthSq() < 1e-8) return;
    d.normalize();
    const target = new THREE.Vector3(0, 0, 1);
    if (d.angleTo(target) > 0.02) footFix[footJ] = new THREE.Quaternion().setFromUnitVectors(d, target);
  };
  footForwardFix('footL', ['ball_l', 'toe_l', 'lefttoe', 'toe.l', 'l_toe']);
  footForwardFix('footR', ['ball_r', 'toe_r', 'righttoe', 'toe.r', 'r_toe']);
  // datos para el desplazamiento vertical de cadera (sentarse, agacharse)
  const pq = new THREE.Quaternion(), ppv = new THREE.Vector3(), psv = new THREE.Vector3();
  map.hips.parent.matrixWorld.decompose(ppv, pq, psv);
  const hips = { bindPos: map.hips.position.clone(), wqi: pq.clone().invert(), invS: 1 / (psv.y || 1) };
  // altura para la etiqueta flotante, desde el hueso de la cabeza
  const headB = findBone(['head']);
  const height = (headB ? wpos(headB).y : wpos(map.neck || map.hips).y) + 0.35;
  return { map, bindW, rest, footFix, hips, model, height };
}

// Aplica una pose (definida en el espacio del personaje) a los huesos del rig.
// Para cada hueso mapeado: L' = (Ap·Wp)⁻¹ · (Ab·Wb), donde A acumula las
// rotaciones de la pose en espacio del personaje y W son orientaciones de bind.
function applyPoseToRig(ent, poseDef, name) {
  const rig = ent.rig;
  if (!rig) return;
  const poseJ = poseDef.j || {};
  const totals = new Map();
  const footBones = new Map();
  const yawOnly = q => {
    const f = new THREE.Vector3(0, 0, 1).applyQuaternion(q);
    f.y = 0;
    if (f.lengthSq() < 1e-8) return _IDQ.clone();
    return new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), f.normalize());
  };
  for (const [joint, bone] of Object.entries(rig.map)) {
    if (joint === 'footL' || joint === 'footR') {
      footBones.set(bone, joint);
      continue;
    }
    const q = new THREE.Quaternion();
    const pr = poseJ[joint];
    if (pr) q.setFromEuler(new THREE.Euler(DEG(pr[0]), DEG(pr[1]), DEG(pr[2]), 'XYZ'));
    if (rig.rest[joint]) q.multiply(rig.rest[joint]);
    totals.set(bone, q);
  }
  const qa = new THREE.Quaternion(), qb = new THREE.Quaternion();
  const walk = (node, A) => {
    let An = A;
    const footJoint = footBones.get(node);
    if (footJoint) {
      const footQ = new THREE.Quaternion();
      const pr = poseJ[footJoint];
      if (pr) footQ.setFromEuler(new THREE.Euler(DEG(pr[0]), DEG(pr[1]), DEG(pr[2]), 'XYZ'));
      const fix = (rig.footFix && rig.footFix[footJoint]) || _IDQ;
      An = yawOnly(A).multiply(footQ).multiply(fix);
    } else {
      const tot = totals.get(node);
      if (tot) An = A.clone().multiply(tot);
    }
    if (node.isBone && rig.bindW.has(node)) {
      const Wb = rig.bindW.get(node);
      const Wp = rig.bindW.get(node.parent) || _IDQ;
      qa.copy(A).multiply(Wp).invert();
      qb.copy(An).multiply(Wb);
      node.quaternion.copy(qa.multiply(qb));
    }
    for (const c of node.children) walk(c, An);
  };
  walk(rig.model, _IDQ);
  const off = new THREE.Vector3(0, poseDef.hipsOffset || 0, 0)
    .applyQuaternion(rig.hips.wqi).multiplyScalar(rig.hips.invS);
  rig.map.hips.position.copy(rig.hips.bindPos).add(off);
  ent.curPose = JSON.parse(JSON.stringify({ j: poseDef.j || {}, hipsOffset: poseDef.hipsOffset || 0 }));
  ent.poseName = name || 'Personalizada';
}

// tinte de color para modelos GLB. Puede conservar texturas o dejar solo el color.
const MATERIAL_MAP_KEYS = [
  'map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'emissiveMap',
  'alphaMap', 'bumpMap', 'displacementMap', 'lightMap', 'envMap', 'specularMap',
  'clearcoatMap', 'clearcoatNormalMap', 'clearcoatRoughnessMap',
  'sheenColorMap', 'sheenRoughnessMap', 'transmissionMap', 'thicknessMap',
  'iridescenceMap', 'iridescenceThicknessMap'
];
function materialList(mat) {
  if (!mat) return [];
  return Array.isArray(mat) ? mat.filter(Boolean) : [mat];
}
function rememberMaterialAppearance(mat) {
  if (!mat.userData.bdAppearance) {
    mat.userData.bdAppearance = {
      color: mat.color ? mat.color.clone() : null,
      maps: Object.fromEntries(MATERIAL_MAP_KEYS.map(k => [k, mat[k] || null]))
    };
  }
  return mat.userData.bdAppearance;
}
function tintModel(root, hex, tintOnly = false) {
  const tint = hex ? new THREE.Color(hex) : null;
  root.traverse(o => {
    if (!o.isMesh) return;
    for (const mat of materialList(o.material)) {
      const base = rememberMaterialAppearance(mat);
      if (mat.color && base.color) {
        if (tintOnly && tint) mat.color.copy(tint);
        else if (tint) mat.color.copy(base.color).lerp(tint, 0.7);
        else mat.color.copy(base.color);
      }
      for (const key of MATERIAL_MAP_KEYS)
        if (key in mat) mat[key] = tintOnly ? null : base.maps[key];
      mat.needsUpdate = true;
    }
  });
}

/* ============================================================
   PROPS - primitivas, mobiliario, luces e importación GLB
   ============================================================ */
const PROP_DEFS = {
  mesa:    { label:'Mesa',    icon:'ph-table',     color:'#a07c52', ring:1.9 },
  silla:   { label:'Silla',   icon:'ph-armchair',  color:'#a07c52', ring:1.0 },
  cubo:    { label:'Cubo',    icon:'ph-cube',      color:'#9fa6b2', ring:0.9 },
  esfera:  { label:'Esfera',  icon:'ph-circle',    color:'#9fa6b2', ring:0.8 },
  cilindro:{ label:'Cilindro',icon:'ph-cylinder',  color:'#9fa6b2', ring:0.8 },
  pared:   { label:'Pared',   icon:'ph-wall',      color:'#d8d9dd', ring:3.2 },
  puerta:  { label:'Puerta',  icon:'ph-door',      color:'#8a6238', ring:1.2 },
  luz:     { label:'Luz',     icon:'ph-lightbulb', color:'#ffe9b0', ring:0.6 }
};
const propIcon = type => type === 'glb' ? 'ph-package' : (PROP_DEFS[type] ? PROP_DEFS[type].icon : 'ph-cube');

function buildPropMesh(type, colorHex) {
  const mat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.75, metalness: 0.05 });
  const gr = new THREE.Group();
  const box = (w, h, d, x, y, z) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; gr.add(m); return m;
  };
  let marker = null, light = null;
  switch (type) {
    case 'mesa': {
      box(1.8, 0.08, 0.9, 0, 0.75, 0);
      for (const [lx, lz] of [[0.8,0.38],[-0.8,0.38],[0.8,-0.38],[-0.8,-0.38]]) box(0.08, 0.72, 0.08, lx, 0.36, lz);
      break;
    }
    case 'silla': {
      box(0.46, 0.06, 0.46, 0, 0.45, 0);
      box(0.46, 0.52, 0.06, 0, 0.74, -0.2);
      for (const [lx, lz] of [[0.19,0.19],[-0.19,0.19],[0.19,-0.19],[-0.19,-0.19]]) box(0.05, 0.44, 0.05, lx, 0.22, lz);
      break;
    }
    case 'cubo': box(0.55, 0.55, 0.55, 0, 0.275, 0); break;
    case 'esfera': {
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.32, 24, 18), mat);
      m.position.y = 0.32; m.castShadow = true; m.receiveShadow = true; gr.add(m); break;
    }
    case 'cilindro': {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.7, 24), mat);
      m.position.y = 0.35; m.castShadow = true; m.receiveShadow = true; gr.add(m); break;
    }
    case 'pared': box(3, 2.6, 0.15, 0, 1.3, 0); break;
    case 'puerta': {
      box(1.06, 2.16, 0.1, 0, 1.11, 0).material = new THREE.MeshStandardMaterial({ color: '#6b6f76', roughness: 0.8 });
      const panel = box(0.92, 2.04, 0.07, 0, 1.05, 0.02);
      const knob = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), new THREE.MeshStandardMaterial({ color: '#c9a227', roughness: 0.35, metalness: 0.7 }));
      knob.position.set(0.36, 1.02, 0.08); gr.add(knob);
      break;
    }
    case 'luz': {
      marker = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 14, 10),
        new THREE.MeshStandardMaterial({ color: colorHex, emissive: colorHex, emissiveIntensity: 1.4, roughness: 0.4 })
      );
      marker.position.y = 1.6; gr.add(marker);
      light = new THREE.PointLight(colorHex, 40, 0, 2);
      light.position.y = 1.6; light.castShadow = false; gr.add(light);
      break;
    }
  }
  return { gr, marker, light };
}

function addProp(type, opts = {}) {
  if (!opts.noUndo) pushUndo();
  const def = PROP_DEFS[type];
  const color = opts.color || def.color;
  const { gr, marker, light } = buildPropMesh(type, color);
  const id = opts.id || uid('prop');
  const count = R.props.filter(p => p.type === type).length + 1;
  const ent = {
    kind: 'prop', id, type,
    name: opts.name || `${t(def.label).replace(/^[^ ]+ /, '')} ${count}`,
    colorHex: color, root: gr, marker, light, ringScale: def.ring,
    path: opts.path ? JSON.parse(JSON.stringify(opts.path)) : { interpolation: 'catmullrom', keyframes: [] },
    pathViz: null
  };
  if (light) ent.lightParams = opts.lightParams || { color, intensity: 40, distance: 0 };
  if (ent.lightParams && light) {
    light.color.set(ent.lightParams.color); light.intensity = ent.lightParams.intensity; light.distance = ent.lightParams.distance;
    if (marker) { marker.material.color.set(ent.lightParams.color); marker.material.emissive.set(ent.lightParams.color); }
  }
  const p = opts.pos || spawnPos();
  gr.position.copy(p instanceof THREE.Vector3 ? p : new THREE.Vector3(...p));
  if (opts.rotY !== undefined) gr.rotation.y = DEG(opts.rotY);
  if (opts.scale !== undefined) gr.scale.setScalar(opts.scale);
  tagEnt(gr, id);
  scene.add(gr);
  R.props.push(ent);
  updatePathViz(ent);
  renderPropList();
  if (!opts.noSelect) setSelected(ent);
  return ent;
}

// ---------- importación GLB ----------
let glbTarget = 'prop';
$('btnGlbChar').onclick = () => { glbTarget = 'character'; $('fileGlb').click(); };
$('btnGlbProp').onclick = () => { glbTarget = 'prop'; $('fileGlb').click(); };
$('fileGlb').addEventListener('change', async e => {
  const f = e.target.files[0];
  if (!f) return;
  e.target.value = '';
  try {
    const buf = await f.arrayBuffer();
    const name = f.name.replace(/\.(glb|gltf)$/i, '');
    pushUndo();
    if (glbTarget === 'character') {
      registerDefaultChar(name, bufToB64(buf), true);
      addCharacterAuto({ noUndo: true, name });
      toast(t('"{n}" es ahora tu modelo de personaje por defecto', { n: name }));
    } else {
      const assetId = uid('asset');
      R.assets[assetId] = { name: f.name, b64: bufToB64(buf) };
      instantiateGlb(assetId, 'prop', { name, pos: v3(spawnPos()) }, true);
    }
  } catch (err) { console.error(err); toast('No se pudo leer el archivo GLB'); }
});

// crea la entidad (personaje o prop) a partir de un asset GLB ya registrado
function instantiateGlb(assetId, kind, data, select) {
  const asset = R.assets[assetId];
  const finish = (model, missing) => {
    const wrap = new THREE.Group();
    wrap.add(model);
    if (!missing) {
      let bb = new THREE.Box3().setFromObject(model);
      const size = bb.getSize(new THREE.Vector3());
      const maxD = Math.max(size.x, size.y, size.z) || 1;
      if (maxD > 12 || maxD < 0.2) {
        model.scale.setScalar(1.75 / (size.y || maxD));
        if (select) toast('Modelo reescalado automáticamente a tamaño humano');
      }
      bb = new THREE.Box3().setFromObject(model);
      const c = bb.getCenter(new THREE.Vector3());
      model.position.x -= c.x; model.position.z -= c.z; model.position.y -= bb.min.y;
    }
    model.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    const id = data.id || uid(kind === 'character' ? 'char' : 'prop');
    let ent;
    const entPath = data.path ? JSON.parse(JSON.stringify(data.path)) : { interpolation: 'catmullrom', keyframes: [] };
    if (kind === 'character') {
      const rig = missing ? null : buildRig(model, wrap);
      ent = { kind: 'character', charKind: 'glb', id, assetId, name: data.name || 'Personaje GLB',
        role: data.role || '', emotion: data.emotion || '', notes: data.notes || '',
        colorHex: data.color || null, root: wrap, joints: null, rig,
        tintOnly: !!data.tintOnly, curPose: { j: {}, hipsOffset: 0 }, poseName: rig ? 'De pie' : null, ringScale: 1,
        path: entPath, pathViz: null };
      const bb = new THREE.Box3().setFromObject(model);
      ent.labelY = missing ? 1.0 : (rig ? rig.height : Math.max(bb.max.y + 0.12, 0.6));
      if (rig) applyPose(ent, data.pose || getPose('De pie'), data.poseName || 'De pie');
      tintModel(wrap, data.color || null, ent.tintOnly);
    } else {
      ent = { kind: 'prop', id, type: 'glb', assetId, name: data.name || 'Prop GLB',
        colorHex: '#8a8f98', root: wrap, ringScale: 1.2, path: entPath, pathViz: null };
    }
    wrap.position.set(...(data.pos || [0, 0, 0]));
    if (data.rot) wrap.rotation.set(DEG(data.rot[0]), DEG(data.rot[1]), DEG(data.rot[2]));
    if (data.scale) wrap.scale.set(...data.scale);
    tagEnt(wrap, id);
    scene.add(wrap);
    (kind === 'character' ? R.characters : R.props).push(ent);
    updatePathViz(ent);
    renderCharList(); renderPropList();
    if (select) setSelected(ent);
  };
  if (!asset) {
    const ph = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.6), new THREE.MeshStandardMaterial({ color: 0x9aa0a8 }));
    ph.position.y = 0.3; ph.castShadow = true;
    const phg = new THREE.Group(); phg.add(ph);
    toast('Asset GLB no disponible: se muestra un marcador');
    finish(phg, true);
    return;
  }
  new GLTFLoader().parse(b64ToBuf(asset.b64), '', g => finish(g.scene, false),
    err => { console.error(err); toast('Error al procesar el GLB'); });
}

/* ============================================================
   ENTIDADES - selección, listas, inspector de propiedades
   ============================================================ */
const SHOT_TYPES = ['Plano general','Plano medio','Primer plano','Plano detalle','Contrapicado','Picado',
                    'Toma lateral','Over the shoulder','Cámara subjetiva','Cámara de seguimiento','Cámara fija'];

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

// ---------- modales ----------
function openModal(title, html) {
  $('modalTitle').textContent = title;
  $('modalBody').innerHTML = html;
  $('modalBack').classList.remove('hidden');
}
function closeModal() { $('modalBack').classList.add('hidden'); $('modalBody').innerHTML = ''; }
$('modalX').onclick = closeModal;
$('modalBack').addEventListener('pointerdown', e => { if (e.target === $('modalBack')) closeModal(); });
function copyText(t) {
  const fallback = () => {
    const ta = document.createElement('textarea');
    ta.value = t; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); toast('Copiado al portapapeles'); } catch { toast('No se pudo copiar'); }
    ta.remove();
  };
  if (navigator.clipboard && navigator.clipboard.writeText)
    navigator.clipboard.writeText(t).then(() => toast('Copiado al portapapeles')).catch(fallback);
  else fallback();
}

// ---------- selección ----------
function setSelected(ent) {
  selected = ent;
  if (tc.object) tc.detach();
  if (ent) { tc.attach(ent.root); renderInspector(); }
  else $('rightPanel').classList.add('hidden');
  renderCharList(); renderPropList(); renderPersp();
}

// ---------- listas del panel izquierdo ----------
function renderCharList() {
  const el = $('charList'); el.innerHTML = '';
  for (const c of R.characters) {
    const d = document.createElement('div');
    d.className = 'item' + (selected === c ? ' active' : '');
    d.innerHTML = `<span class="dot" style="background:${c.colorHex || '#8a8f98'}"></span><span class="nm">${escapeHtml(c.name)}</span><button class="x" title="${t('Eliminar')}">x</button>`;
    d.onclick = () => setSelected(c);
    d.querySelector('.x').onclick = e => { e.stopPropagation(); deleteEnt(c); };
    el.appendChild(d);
  }
}
function renderPropList() {
  const el = $('propList'); el.innerHTML = '';
  for (const p of R.props) {
    const d = document.createElement('div');
    d.className = 'item' + (selected === p ? ' active' : '');
    d.innerHTML = `<i class="ph ${propIcon(p.type)}"></i><span class="nm">${escapeHtml(p.name)}</span><button class="x" title="${t('Eliminar')}">x</button>`;
    d.onclick = () => setSelected(p);
    d.querySelector('.x').onclick = e => { e.stopPropagation(); deleteEnt(p); };
    el.appendChild(d);
  }
}

// ---------- inspector ----------
function transformBlockHTML(ent) {
  const p = ent.root.position, r = eDeg(ent.root.rotation), s = ent.root.scale;
  const showScale = ent.kind !== 'camera';
  return `
  <div class="lbl">${t('Posición')}</div>
  <div class="grid3">
    <input type="number" step="0.1" id="tPx" value="${p.x.toFixed(2)}">
    <input type="number" step="0.1" id="tPy" value="${p.y.toFixed(2)}">
    <input type="number" step="0.1" id="tPz" value="${p.z.toFixed(2)}">
  </div>
  <div class="lbl">${t('Rotación (°)')}</div>
  <div class="grid3">
    <input type="number" step="5" id="tRx" value="${r[0]}">
    <input type="number" step="5" id="tRy" value="${r[1]}">
    <input type="number" step="5" id="tRz" value="${r[2]}">
  </div>
  ${showScale ? `<div class="lbl">${t('Escala')}</div><input type="number" step="0.05" min="0.05" id="tS" value="${s.x.toFixed(2)}">` : ''}`;
}
function bindTransformInputs(ent) {
  const apply = () => {
    pushUndo();
    ent.root.position.set(+$('tPx').value || 0, +$('tPy').value || 0, +$('tPz').value || 0);
    ent.root.rotation.set(DEG(+$('tRx').value || 0), DEG(+$('tRy').value || 0), DEG(+$('tRz').value || 0));
    if ($('tS')) ent.root.scale.setScalar(Math.max(0.05, +$('tS').value || 1));
  };
  ['tPx','tPy','tPz','tRx','tRy','tRz','tS'].forEach(id => { const el = $(id); if (el) el.addEventListener('change', apply); });
}
function syncInspectorFromSel() {
  if (!selected || $('rightPanel').classList.contains('hidden')) return;
  const p = selected.root.position, r = eDeg(selected.root.rotation);
  const set = (id, v) => { const el = $(id); if (el && document.activeElement !== el) el.value = v; };
  set('tPx', p.x.toFixed(2)); set('tPy', p.y.toFixed(2)); set('tPz', p.z.toFixed(2));
  set('tRx', r[0]); set('tRy', r[1]); set('tRz', r[2]);
  set('tS', selected.root.scale.x.toFixed(2));
  if (selected.kind === 'character') {
    const ft = $('inspFacingTxt');
    if (ft) ft.textContent = characterFacingInfo(selected, viewCam).text;
  }
}

function availableJointKeys(ent) {
  const keys = Object.keys(JOINT_LABELS);
  if (ent.joints) return keys.filter(k => ent.joints[k]);
  if (ent.rig) return keys.filter(k => ent.rig.map[k]);
  return keys;
}
function poseBlockHTML(ent) {
  const opts = allPoseNames().map(n =>
    `<option value="${escapeHtml(n)}" ${n === ent.poseName ? 'selected' : ''}>${escapeHtml(t(n))}</option>`).join('');
  const jopts = availableJointKeys(ent).map(k => `<option value="${k}">${t(JOINT_LABELS[k])}</option>`).join('');
  return `
  <div class="lbl">${t('Pose')}</div>
  <select id="poseSel">${ent.poseName && !getPose(ent.poseName) ? `<option value="${escapeHtml(ent.poseName)}" selected>${escapeHtml(t(ent.poseName))}</option>` : ''}${opts}</select>
  <button id="btnSavePose" class="btn outline w100" style="margin-top:6px">${t('Guardar pose actual como preset...')}</button>
  <div class="lbl">${t('Ajuste manual de articulación')}</div>
  <select id="jointSel">${jopts}</select>
  <div class="row"><label style="width:12px">X</label><input type="range" id="jsX" min="-180" max="180" step="1"><span id="jsXv" class="hint" style="margin:0;width:36px;text-align:right"></span></div>
  <div class="row"><label style="width:12px">Y</label><input type="range" id="jsY" min="-180" max="180" step="1"><span id="jsYv" class="hint" style="margin:0;width:36px;text-align:right"></span></div>
  <div class="row"><label style="width:12px">Z</label><input type="range" id="jsZ" min="-180" max="180" step="1"><span id="jsZv" class="hint" style="margin:0;width:36px;text-align:right"></span></div>`;
}
function bindPoseBlock(ent) {
  const getRot = j => ent.joints
    ? (ent.joints[j] ? ['x', 'y', 'z'].map(a => Math.round(RAD(ent.joints[j].rotation[a]))) : [0, 0, 0])
    : ((ent.curPose && ent.curPose.j[j]) || [0, 0, 0]).map(Math.round);
  const setRot = (j, i, deg) => {
    if (ent.joints && ent.joints[j]) {
      ent.joints[j].rotation['xyz'[i]] = DEG(deg);
      ent.poseName = 'Personalizada';
    } else if (ent.rig) {
      if (!ent.curPose) ent.curPose = { j: {}, hipsOffset: 0 };
      if (!ent.curPose.j[j]) ent.curPose.j[j] = [0, 0, 0];
      ent.curPose.j[j][i] = deg;
      applyPoseToRig(ent, ent.curPose, 'Personalizada');
    }
  };
  const refreshSliders = () => {
    const r = getRot($('jointSel').value);
    [['jsX','jsXv',0],['jsY','jsYv',1],['jsZ','jsZv',2]].forEach(([sid, vid, i]) => {
      $(sid).value = r[i]; $(vid).textContent = r[i] + '°';
    });
  };
  $('poseSel').addEventListener('change', e => {
    pushUndo(); applyPoseByName(ent, e.target.value); refreshSliders();
  });
  $('jointSel').addEventListener('change', refreshSliders);
  [['jsX','jsXv',0],['jsY','jsYv',1],['jsZ','jsZv',2]].forEach(([sid, vid, i]) => {
    $(sid).addEventListener('pointerdown', () => pushUndo());
    $(sid).addEventListener('input', e => {
      setRot($('jointSel').value, i, +e.target.value);
      $(vid).textContent = e.target.value + '°';
      if (document.activeElement !== $('poseSel')) $('poseSel').selectedIndex = -1;
    });
  });
  $('btnSavePose').onclick = () => {
    openModal(t('Guardar pose'), `
      <div class="mrow"><label>${t('Nombre del preset')}</label><input type="text" id="mPoseName" value="Pose ${Object.keys(customPoses).length + 1}"></div>
      <div class="mrow"><button class="btn primary w100" id="mPoseOk">${t('Guardar pose')}</button></div>`);
    $('mPoseOk').onclick = () => {
      const n = $('mPoseName').value.trim() || t('Pose personalizada');
      saveCustomPose(n, currentPoseOf(ent));
      ent.poseName = n;
      closeModal(); renderInspector();
      toast(t('Pose "{n}" guardada en la biblioteca', { n }));
    };
  };
  refreshSliders();
}

function renderInspector() {
  const ent = selected;
  if (!ent) { $('rightPanel').classList.add('hidden'); return; }
  $('rightPanel').classList.remove('hidden');
  $('inspTitle').textContent = { character: t('Personaje'), prop: t('Prop'), camera: t('Cámara') }[ent.kind];
  let html = `<div class="lbl">${t('Nombre')}</div><input type="text" id="inspName" value="${escapeHtml(ent.name)}">`;

  if (ent.kind === 'character') {
    html += `
    <div class="lbl">${t('Rol narrativo')}</div><input type="text" id="inspRole" value="${escapeHtml(ent.role)}" placeholder="${t('Protagonista, antagonista...')}">
    <div class="lbl">${t('Emoción / expresión')}</div><input type="text" id="inspEmotion" value="${escapeHtml(ent.emotion)}" placeholder="${t('Tenso, alegre, sorprendido...')}">
    <div class="lbl">${t('Notas narrativas')}</div><textarea id="inspNotes" rows="2" placeholder="${t('Qué hace en la escena...')}">${escapeHtml(ent.notes)}</textarea>`;
    // dirección del personaje (hacia dónde mira / se orienta)
    const faceTargets = [
      ...R.cameras.map(c => `<option value="${c.id}">${t('Cámara')}: ${escapeHtml(c.name)}</option>`),
      ...R.characters.filter(c => c !== ent).map(c => `<option value="${c.id}">${t('Personaje')}: ${escapeHtml(c.name)}</option>`),
      ...R.props.filter(p => p.type !== 'luz').map(p => `<option value="${p.id}">${t('Prop')}: ${escapeHtml(p.name)}</option>`)
    ].join('');
    html += `
    <div class="lbl">${t('Dirección')}</div>
    <div class="row" style="margin-top:2px">
      <select id="inspFaceTarget" style="flex:1">${faceTargets || `<option value="">${t('— sin objetivos —')}</option>`}</select>
      <button class="btn outline" id="btnFace" title="${t('Girar el personaje hacia el objetivo')}">${t('Mirar')}</button>
    </div>
    <div class="hint" id="inspFacingTxt">${escapeHtml(characterFacingInfo(ent, viewCam).text)}</div>`;
    html += `<div class="lbl">${t('Color')}${ent.charKind === 'glb' ? ' ' + t('(tinte)') : ''}</div><div class="swatches">${
      (ent.charKind === 'glb' ? ['', ...CHAR_COLORS] : CHAR_COLORS).map(c => c === ''
        ? `<span class="sw ${!ent.colorHex ? 'active' : ''}" data-c="" title="${t('Colores originales del modelo')}" style="background:linear-gradient(135deg,#fff 44%,#c0392b 44%,#c0392b 56%,#fff 56%)"></span>`
        : `<span class="sw ${c === ent.colorHex ? 'active' : ''}" data-c="${c}" style="background:${c}"></span>`).join('')}</div>`;
    if (ent.charKind === 'glb') html += `
    <label class="ck tint-only-row"><input type="checkbox" id="inspTintOnly" ${ent.tintOnly ? 'checked' : ''}> ${t('Solo tinte, sin textura')}</label>
    <div class="hint">${t('Oculta los mapas del material del GLB y deja visible solo el color/tinte seleccionado.')}</div>`;
    if (ent.joints || ent.rig) html += poseBlockHTML(ent);
    else html += `<div class="hint">${t('Este GLB no tiene esqueleto compatible: puedes moverlo, rotarlo y escalarlo, pero sin poses.')}</div>`;
  }

  if (ent.kind === 'prop') {
    if (ent.type !== 'glb') html += `<div class="row"><label>${t('Color')}</label><input type="color" id="inspColor" value="${ent.colorHex}"></div>`;
    if (ent.light) {
      const lp = ent.lightParams;
      html += `
      <div class="lbl">${t('Luz puntual')}</div>
      <div class="row"><label style="width:64px">${t('Color')}</label><input type="color" id="lpColor" value="${lp.color}"></div>
      <div class="row"><label style="width:64px">${t('Intensidad')}</label><input type="range" id="lpInt" min="0" max="200" step="1" value="${lp.intensity}"></div>
      <div class="row"><label style="width:64px">${t('Alcance')}</label><input type="range" id="lpDist" min="0" max="30" step="0.5" value="${lp.distance}"></div>
      <div class="hint">${t('Alcance 0 = infinito.')}</div>`;
    }
  }

  if (ent.kind === 'camera') {
    html += `
    <div class="row"><label>FOV</label><input type="range" id="inspFov" min="15" max="110" step="1" value="${ent.cam.fov}"><span id="inspFovV" class="hint" style="margin:0;width:34px;text-align:right">${Math.round(ent.cam.fov)}°</span></div>
    <div class="lbl">${t('Tipo de plano')}</div>
    <select id="inspShotType">${SHOT_TYPES.map(st => `<option value="${escapeHtml(st)}" ${st === ent.shotType ? 'selected' : ''}>${escapeHtml(t(st))}</option>`).join('')}</select>
    <div class="grid2">
      <button class="btn outline" id="btnCamView">${t('Ver por cámara')}</button>
      <button class="btn outline" id="btnCamFree">${t('Vista libre')}</button>
      <button class="btn outline" id="btnCamCap">${t('Capturar')}</button>
      <button class="btn outline" id="btnCamPath">${t('Trayectoria')}</button>
    </div>`;
  }

  html += transformBlockHTML(ent);
  if (ent.kind !== 'camera') {
    const nk = ent.path ? ent.path.keyframes.length : 0;
    html += `<button class="btn outline w100" id="btnEntPath" style="margin-top:12px"><i class="ph ph-path"></i> ${t('Trayectoria')}${nk ? ` · ${nk} kf` : ''}</button>`;
  }
  html += `<div class="grid2" style="margin-top:12px">
    <button class="btn outline" id="btnDup">${t('Duplicar')}</button>
    <button class="btn outline danger" id="btnDel">${t('Eliminar')}</button>
  </div>`;
  $('inspector').innerHTML = html;

  // enlaces comunes
  $('inspName').addEventListener('change', e => {
    ent.name = e.target.value || ent.name;
    renderCharList(); renderPropList(); renderPersp(); refreshTlCams(); refreshPipSelect();
  });
  bindTransformInputs(ent);
  $('btnDup').onclick = () => duplicateEnt(ent);
  $('btnDel').onclick = () => deleteEnt(ent);
  const bp = $('btnEntPath');
  if (bp) bp.onclick = () => openTimeline(ent);

  if (ent.kind === 'character') {
    $('inspRole').addEventListener('change', e => ent.role = e.target.value);
    $('inspEmotion').addEventListener('change', e => ent.emotion = e.target.value);
    $('inspNotes').addEventListener('change', e => ent.notes = e.target.value);
    $('btnFace').onclick = () => {
      const target = findEnt($('inspFaceTarget').value);
      if (!target) return;
      pushUndo();
      const tp = target.kind === 'camera' ? target.cam.position : target.root.position;
      const d = tp.clone().sub(ent.root.position);
      ent.root.rotation.set(0, Math.atan2(d.x, d.z), 0);
      syncInspectorFromSel();
      const ft = $('inspFacingTxt');
      if (ft) ft.textContent = characterFacingInfo(ent, viewCam).text;
      toast(t('{a} ahora mira hacia {b}', { a: ent.name, b: target.name }));
    };
    document.querySelectorAll('#inspector .sw').forEach(sw => sw.onclick = () => {
      pushUndo();
      const c = sw.dataset.c || null;
      ent.colorHex = c;
      if (ent.charKind === 'mannequin') { if (c) ent.mat.color.set(c); }
      else tintModel(ent.root, c, ent.tintOnly);
      document.querySelectorAll('#inspector .sw').forEach(s => s.classList.toggle('active', s === sw));
      renderCharList();
    });
    const tintOnly = $('inspTintOnly');
    if (tintOnly) tintOnly.addEventListener('change', e => {
      pushUndo();
      ent.tintOnly = e.target.checked;
      tintModel(ent.root, ent.colorHex, ent.tintOnly);
      toast(ent.tintOnly ? 'Textura oculta: solo tinte' : 'Textura restaurada');
    });
    if (ent.joints || ent.rig) bindPoseBlock(ent);
  }
  if (ent.kind === 'prop') {
    const ic = $('inspColor');
    if (ic) ic.addEventListener('change', e => {
      pushUndo(); ent.colorHex = e.target.value;
      ent.root.traverse(o => { if (o.isMesh && o.material && o.material.color && !o.userData.keepColor) o.material.color.set(e.target.value); });
    });
    if (ent.light) {
      $('lpColor').addEventListener('change', e => {
        pushUndo(); ent.lightParams.color = e.target.value;
        ent.light.color.set(e.target.value);
        if (ent.marker) { ent.marker.material.color.set(e.target.value); ent.marker.material.emissive.set(e.target.value); }
      });
      $('lpInt').addEventListener('pointerdown', () => pushUndo());
      $('lpInt').addEventListener('input', e => { ent.lightParams.intensity = +e.target.value; ent.light.intensity = +e.target.value; });
      $('lpDist').addEventListener('pointerdown', () => pushUndo());
      $('lpDist').addEventListener('input', e => { ent.lightParams.distance = +e.target.value; ent.light.distance = +e.target.value; });
    }
  }
  if (ent.kind === 'camera') {
    $('inspFov').addEventListener('pointerdown', () => pushUndo());
    $('inspFov').addEventListener('input', e => {
      ent.cam.fov = +e.target.value; ent.cam.updateProjectionMatrix();
      updateFrustumViz(ent);
      $('inspFovV').textContent = e.target.value + '°';
    });
    $('inspShotType').addEventListener('change', e => { pushUndo(); ent.shotType = e.target.value; });
    $('btnCamView').onclick = () => setViewCamera(ent);
    $('btnCamFree').onclick = () => setViewCamera(null);
    $('btnCamCap').onclick = () => captureFrame(ent);
    $('btnCamPath').onclick = () => openTimeline(ent);
  }
}

// ---------- eliminar / duplicar ----------
function disposeObject(o) {
  o.traverse(n => {
    if (n.geometry) n.geometry.dispose();
    if (n.material) Array.isArray(n.material) ? n.material.forEach(m => m.dispose()) : n.material.dispose();
  });
}
function deleteEnt(ent, noUndo) {
  if (!noUndo) pushUndo();
  if (selected === ent) { tc.detach(); selected = null; $('rightPanel').classList.add('hidden'); }
  if (ent.kind === 'camera') removeCameraEnt(ent);
  else {
    scene.remove(ent.root); disposeObject(ent.root);
    if (ent.pathViz) { scene.remove(ent.pathViz); disposeObject(ent.pathViz); ent.pathViz = null; }
    const arr = ent.kind === 'character' ? R.characters : R.props;
    const i = arr.indexOf(ent); if (i >= 0) arr.splice(i, 1);
    if (tlEnt === ent) { tlEnt = null; refreshKfs(); }
  }
  renderCharList(); renderPropList(); renderPersp(); refreshTlCams(); refreshPipSelect();
}
function duplicateEnt(ent) {
  pushUndo();
  const off = new THREE.Vector3(0.7, 0, 0);
  // copia de la trayectoria con el mismo desplazamiento lateral que la entidad
  const pathCopy = () => {
    if (!ent.path || !ent.path.keyframes.length) return undefined;
    const p = JSON.parse(JSON.stringify(ent.path));
    for (const k of p.keyframes) k.pos[0] += off.x;
    return p;
  };
  if (ent.kind === 'character') {
    if (ent.charKind === 'mannequin') {
      const n = addMannequin({ noUndo: true, color: ent.colorHex, name: ent.name + ' ' + t('copia'), role: ent.role,
        emotion: ent.emotion, notes: ent.notes, pos: ent.root.position.clone().add(off), path: pathCopy() });
      n.root.rotation.copy(ent.root.rotation); n.root.scale.copy(ent.root.scale);
      applyPose(n, currentPoseOf(ent), ent.poseName);
      renderInspector();
    } else {
      instantiateGlb(ent.assetId, 'character', { name: ent.name + ' ' + t('copia'), role: ent.role, notes: ent.notes,
        emotion: ent.emotion, color: ent.colorHex, tintOnly: ent.tintOnly,
        pose: currentPoseOf(ent), poseName: ent.poseName, path: pathCopy(),
        pos: v3(ent.root.position.clone().add(off)), rot: eDeg(ent.root.rotation), scale: v3(ent.root.scale) }, true);
    }
  } else if (ent.kind === 'prop') {
    if (ent.type === 'glb') {
      instantiateGlb(ent.assetId, 'prop', { name: ent.name + ' ' + t('copia'), path: pathCopy(),
        pos: v3(ent.root.position.clone().add(off)), rot: eDeg(ent.root.rotation), scale: v3(ent.root.scale) }, true);
    } else {
      const n = addProp(ent.type, { noUndo: true, color: ent.colorHex, name: ent.name + ' ' + t('copia'),
        pos: ent.root.position.clone().add(off), path: pathCopy(),
        lightParams: ent.lightParams ? { ...ent.lightParams } : undefined });
      n.root.rotation.copy(ent.root.rotation); n.root.scale.copy(ent.root.scale);
    }
  } else if (ent.kind === 'camera') {
    duplicateCamera(ent);
  }
  toast('Duplicado');
}

/* ============================================================
   CAMARAS - creación, frustum, perspectivas y preview final
   ============================================================ */
let camCounter = 0;
let pipEnt = null;

const pipRenderer = new THREE.WebGLRenderer({ canvas: $('pip'), antialias: true });
pipRenderer.setSize(728, 410, false);
pipRenderer.outputColorSpace = THREE.SRGBColorSpace;
pipRenderer.toneMapping = THREE.ACESFilmicToneMapping;
pipRenderer.toneMappingExposure = 1.05;
pipRenderer.shadowMap.enabled = true;
pipRenderer.shadowMap.type = THREE.PCFSoftShadowMap;

function frustumLinesGeo(fov, aspect, d) {
  const h = Math.tan(DEG(fov) / 2) * d, w = h * aspect;
  const pts = [];
  const corners = [[w, h, -d], [-w, h, -d], [-w, -h, -d], [w, -h, -d]];
  for (const c of corners) pts.push(0, 0, 0, ...c);
  for (let i = 0; i < 4; i++) { pts.push(...corners[i], ...corners[(i + 1) % 4]); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  return g;
}
function updateFrustumViz(ent) {
  const old = ent.frustum;
  const line = new THREE.LineSegments(
    frustumLinesGeo(ent.cam.fov, 16 / 9, 2.4),
    new THREE.LineDashedMaterial({ color: 0x3a6df0, dashSize: 0.1, gapSize: 0.07, transparent: true, opacity: 0.85 })
  );
  line.computeLineDistances();
  line.userData.noPick = true;
  if (old) { ent.viz.remove(old); old.geometry.dispose(); old.material.dispose(); }
  ent.viz.add(line);
  ent.frustum = line;
}

// ---------- modelo 3D de la cámara (Slate/camera.glb, tinte negro sin textura) ----------
let cameraTemplate = null;         // THREE.Group ya tintado y normalizado, listo para clonar
const CAMERA_MODEL_YAW = Math.PI;  // giro para que el objetivo del modelo apunte a -Z (dirección de vista)
async function loadCameraModel() {
  let buf;
  try {
    const resp = await fetch('Slate/camera.glb');
    if (!resp.ok) return;
    buf = await resp.arrayBuffer();
  } catch { return; }
  await new Promise(res => {
    new GLTFLoader().parse(buf, '', g => {
      const model = g.scene;
      // material negro mate único: cumple "tinte negro sin textura"
      const blackMat = new THREE.MeshStandardMaterial({ color: 0x111318, roughness: 0.55, metalness: 0.35 });
      model.traverse(o => { if (o.isMesh) { o.material = blackMat; o.castShadow = false; o.receiveShadow = false; } });
      // normaliza a un tamaño parecido al gizmo anterior y centra en el origen de la cámara
      const wrap = new THREE.Group();
      wrap.add(model);
      let bb = new THREE.Box3().setFromObject(model);
      const size = bb.getSize(new THREE.Vector3());
      const maxD = Math.max(size.x, size.y, size.z) || 1;
      model.scale.setScalar(0.55 / maxD);
      bb = new THREE.Box3().setFromObject(model);
      model.position.sub(bb.getCenter(new THREE.Vector3()));
      wrap.rotation.y = CAMERA_MODEL_YAW;
      cameraTemplate = wrap;
      res();
    }, err => { console.error(err); res(); });
  });
}
// construye la representación visible de una cámara: el modelo GLB si está cargado,
// o el gizmo de caja+cono como respaldo (p. ej. si el GLB no se pudo leer)
function buildCameraViz() {
  const viz = new THREE.Group();
  if (cameraTemplate) {
    viz.add(cameraTemplate.clone(true));
  } else {
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x2a2c33, roughness: 0.5, metalness: 0.2 });
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.18, 0.3), bodyMat);
    const lens = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.16, 20, 1, true), bodyMat);
    lens.rotation.x = -Math.PI / 2; lens.position.z = -0.22;
    viz.add(box, lens);
  }
  return viz;
}

function addCamera(opts = {}) {
  if (!opts.noUndo) pushUndo();
  const cam = new THREE.PerspectiveCamera(opts.fov || 40, 16 / 9, 0.1, 600);
  const id = opts.id || uid('cam');
  const viz = buildCameraViz();
  cam.add(viz);
  scene.add(cam);
  const ent = {
    kind: 'camera', id, cam, viz, frustum: null,
    name: opts.name || `${t('Cámara')} ${++camCounter}`,
    shotType: opts.shotType || 'Plano general',
    path: opts.path || { interpolation: 'catmullrom', keyframes: [] },
    pathViz: null, ringScale: 0.7, root: cam
  };
  updateFrustumViz(ent);

  if (opts.pos) cam.position.set(...opts.pos);
  else { cam.position.copy(freeCam.position); cam.quaternion.copy(freeCam.quaternion); }
  if (opts.rot) cam.rotation.set(DEG(opts.rot[0]), DEG(opts.rot[1]), DEG(opts.rot[2]));
  if (opts.lookAt) cam.lookAt(...opts.lookAt);

  tagEnt(cam, id);
  if (ent.frustum) ent.frustum.userData.noPick = true;
  R.cameras.push(ent);
  updatePathViz(ent);
  renderPersp(); refreshPipSelect(); refreshTlCams();
  if (!pipEnt) setPipEnt(ent);
  if (!opts.noSelect) setSelected(ent);
  return ent;
}
function duplicateCamera(ent) {
  const n = addCamera({ noUndo: true, name: ent.name + ' ' + t('copia'), fov: ent.cam.fov, shotType: ent.shotType,
    pos: v3(ent.cam.position), rot: eDeg(ent.cam.rotation),
    path: JSON.parse(JSON.stringify(ent.path)) });
  updatePathViz(n);
  return n;
}
function removeCameraEnt(ent) {
  if (viewCam === ent.cam) setViewCamera(null);
  if (pipEnt === ent) { pipEnt = null; }
  scene.remove(ent.cam);
  if (ent.pathViz) { scene.remove(ent.pathViz); disposeObject(ent.pathViz); }
  disposeObject(ent.viz);
  const i = R.cameras.indexOf(ent); if (i >= 0) R.cameras.splice(i, 1);
  if (!pipEnt && R.cameras.length) setPipEnt(R.cameras[0]);
  refreshPipSelect();
  if (tlEnt === ent) { tlEnt = R.cameras[0] || null; refreshTlCams(); refreshKfs(); }
}

// ---------- cambiar la vista principal ----------
function setViewCamera(ent) {
  if (ent) {
    if (viewCam === freeCam) freeTargetSaved.copy(controls.target);
    viewCam = ent.cam; activeCamEnt = ent;
    controls.object = ent.cam;
    const dir = new THREE.Vector3();
    ent.cam.getWorldDirection(dir);
    controls.target.copy(ent.cam.position).add(dir.multiplyScalar(4));
  } else {
    viewCam = freeCam; activeCamEnt = null;
    controls.object = freeCam;
    controls.target.copy(freeTargetSaved);
  }
  tc.camera = viewCam;
  controls.update();
  renderPersp();
}

// ---------- panel de perspectivas ----------
function renderPersp() {
  const el = $('perspList'); el.innerHTML = '';
  const free = document.createElement('div');
  free.className = 'item' + (viewCam === freeCam ? ' active' : '');
  free.innerHTML = `<i class="ph ph-globe-simple"></i><span class="nm">${t('Vista libre (Director)')}</span>`;
  free.onclick = () => setViewCamera(null);
  el.appendChild(free);
  for (const c of R.cameras) {
    const d = document.createElement('div');
    d.className = 'item' + (viewCam === c.cam ? ' active' : (selected === c ? ' active' : ''));
    d.innerHTML = `<i class="ph ph-video-camera"></i><span class="nm">${escapeHtml(c.name)}</span><button class="x" title="${t('Eliminar cámara')}">x</button>`;
    d.onclick = () => { setViewCamera(c); setSelected(c); };
    d.querySelector('.x').onclick = e => { e.stopPropagation(); deleteEnt(c); };
    el.appendChild(d);
  }
}
$('btnAddCam').onclick = () => {
  const ent = addCamera({});
  toast(t('"{n}" creada desde la vista actual', { n: ent.name }));
};

// ---------- preview final (PiP) ----------
function setPipEnt(ent) { pipEnt = ent; refreshPipSelect(); }
function refreshPipSelect() {
  const sel = $('pipSelect');
  sel.innerHTML = R.cameras.map(c => `<option value="${c.id}" ${pipEnt === c ? 'selected' : ''}>${escapeHtml(c.name)}</option>`).join('');
  if (!R.cameras.length) sel.innerHTML = `<option value="">${t('-- sin camaras --')}</option>`;
}
$('pipSelect').addEventListener('change', e => {
  pipEnt = R.cameras.find(c => c.id === e.target.value) || null;
});
function renderPip() {
  if (!pipEnt) {
    pipRenderer.clear();
    return;
  }
  cleanRender(pipRenderer, pipEnt.cam, 16, 9);
}

/* ============================================================
   TRAYECTORIAS - keyframes, interpolación, timeline
   ============================================================ */
const INTERPS = [
  ['linear', 'Lineal'], ['ease', 'Ease In-Out'], ['easein', 'Ease In'],
  ['easeout', 'Ease Out'], ['catmullrom', 'Suave (Catmull-Rom)']
];
let tlEnt = null;
const PB = { playing: false, t: 0 };

function easing(mode, u) {
  switch (mode) {
    case 'ease': return u * u * (3 - 2 * u);
    case 'easein': return u * u;
    case 'easeout': return 1 - (1 - u) * (1 - u);
    default: return u;
  }
}
function crSpline(t, p0, p1, p2, p3) {
  const v0 = (p2 - p0) * 0.5, v1 = (p3 - p1) * 0.5, t2 = t * t, t3 = t * t2;
  return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;
}
function kfQuat(kf) {
  return new THREE.Quaternion().setFromEuler(new THREE.Euler(DEG(kf.rot[0]), DEG(kf.rot[1]), DEG(kf.rot[2])));
}
function pathDuration(ent) {
  const k = ent.path.keyframes;
  return k.length ? k[k.length - 1].time : 0;
}
function samplePath(ent, t) {
  const kfs = ent.path.keyframes;
  if (!kfs.length) return null;
  const stateOf = kf => ({ pos: new THREE.Vector3(...kf.pos), quat: kfQuat(kf), fov: kf.fov ?? 40 });
  if (t <= kfs[0].time) return stateOf(kfs[0]);
  if (t >= kfs[kfs.length - 1].time) return stateOf(kfs[kfs.length - 1]);
  let i = 0;
  while (i < kfs.length - 2 && t >= kfs[i + 1].time) i++;
  const k0 = kfs[i], k1 = kfs[i + 1];
  const u = (t - k0.time) / ((k1.time - k0.time) || 1);
  const mode = ent.path.interpolation;
  const ue = mode === 'catmullrom' ? u : easing(mode, u);
  let pos;
  if (mode === 'catmullrom' && kfs.length > 2) {
    const pA = kfs[Math.max(i - 1, 0)], pB = kfs[Math.min(i + 2, kfs.length - 1)];
    pos = new THREE.Vector3(
      crSpline(u, pA.pos[0], k0.pos[0], k1.pos[0], pB.pos[0]),
      crSpline(u, pA.pos[1], k0.pos[1], k1.pos[1], pB.pos[1]),
      crSpline(u, pA.pos[2], k0.pos[2], k1.pos[2], pB.pos[2]));
  } else {
    pos = new THREE.Vector3(...k0.pos).lerp(new THREE.Vector3(...k1.pos), ue);
  }
  const quat = kfQuat(k0).slerp(kfQuat(k1), ue);
  const fov = (k0.fov ?? 40) + ((k1.fov ?? 40) - (k0.fov ?? 40)) * ue;
  return { pos, quat, fov };
}
function applyPathAt(ent, time) {
  const s = samplePath(ent, time);
  if (!s) return;
  if (ent.kind === 'camera') {
    ent.cam.position.copy(s.pos);
    ent.cam.quaternion.copy(s.quat);
    if (Math.abs(ent.cam.fov - s.fov) > 0.05) {
      ent.cam.fov = s.fov; ent.cam.updateProjectionMatrix(); updateFrustumViz(ent);
    }
  } else {
    ent.root.position.copy(s.pos);
    ent.root.quaternion.copy(s.quat);
  }
}
// todas las entidades animables (cámaras, personajes y props con ≥2 keyframes)
function animEnts() {
  return [...R.cameras, ...R.characters, ...R.props].filter(e => e.path && e.path.keyframes.length >= 2);
}
function globalDuration() {
  return animEnts().reduce((m, e) => Math.max(m, pathDuration(e)), 0);
}
function applyAllPaths(time) { for (const e of animEnts()) applyPathAt(e, time); }

// línea punteada de la trayectoria en la escena (azul cámaras, ámbar objetos)
function updatePathViz(ent) {
  if (ent.pathViz) { scene.remove(ent.pathViz); disposeObject(ent.pathViz); ent.pathViz = null; }
  if (!ent.path) return;
  const kfs = ent.path.keyframes;
  if (kfs.length < 2) return;
  const color = ent.kind === 'camera' ? 0x3a6df0 : 0xdd8422;
  const g = new THREE.Group();
  const pts = kfs.map(k => new THREE.Vector3(...k.pos));
  const linePts = (ent.path.interpolation === 'catmullrom' && pts.length > 2)
    ? new THREE.CatmullRomCurve3(pts).getPoints(140) : pts;
  const line = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(linePts),
    new THREE.LineDashedMaterial({ color, dashSize: 0.15, gapSize: 0.1, transparent: true, opacity: 0.9 })
  );
  line.computeLineDistances();
  g.add(line);
  const sphGeo = new THREE.SphereGeometry(0.055, 10, 8);
  const sphMat = new THREE.MeshBasicMaterial({ color });
  for (const p of pts) { const s = new THREE.Mesh(sphGeo, sphMat); s.position.copy(p); g.add(s); }
  g.traverse(o => o.userData.noPick = true);
  scene.add(g);
  ent.pathViz = g;
}

// ---------- interfaz del timeline ----------
function buildInterpOptions() {
  const cur = $('tlInterp').value;
  $('tlInterp').innerHTML = INTERPS.map(([v, l]) => `<option value="${v}">${t(l)}</option>`).join('');
  if (cur) $('tlInterp').value = cur;
}
buildInterpOptions();

function openTimeline(ent) {
  tlEnt = ent || (selected || null) || activeCamEnt || R.cameras[0] || null;
  $('timelinePanel').classList.remove('hidden');
  refreshTlCams(); refreshKfs();
  if (!tlEnt) toast('Crea primero una cámara, personaje o prop para animarlo');
}
function refreshTlCams() {
  if (!tlEnt) tlEnt = R.cameras[0] || null;
  const groups = [
    [t('Cámaras'), R.cameras], [t('Personajes'), R.characters], [t('Props'), R.props]
  ];
  let html = '';
  for (const [label, arr] of groups) {
    if (!arr.length) continue;
    html += `<optgroup label="${escapeHtml(label)}">` + arr.map(e =>
      `<option value="${e.id}" ${tlEnt === e ? 'selected' : ''}>${escapeHtml(e.name)}</option>`).join('') + '</optgroup>';
  }
  $('tlCam').innerHTML = html || `<option value="">${t('-- sin camaras --')}</option>`;
}
function updateScrubMax() { $('tlScrub').max = Math.max(globalDuration(), 1); }
function tlTimeLabel() {
  $('tlTime').textContent = `${PB.t.toFixed(1)} / ${globalDuration().toFixed(1)} s`;
}
function refreshKfs() {
  const el = $('tlKfs'); el.innerHTML = '';
  if (!tlEnt) { el.innerHTML = `<span class="hint" style="margin:0">${t('Sin entidad seleccionada.')}</span>`; updateScrubMax(); tlTimeLabel(); return; }
  if (!tlEnt.path) tlEnt.path = { interpolation: 'catmullrom', keyframes: [] };
  $('tlInterp').value = tlEnt.path.interpolation;
  $('tlKfHint').textContent = tlEnt.kind === 'camera'
    ? t('Cada keyframe guarda posición, rotación y FOV de la cámara.')
    : t('Cada keyframe guarda posición y rotación del objeto.');
  if (!tlEnt.path.keyframes.length)
    el.innerHTML = `<span class="hint" style="margin:0">${t('Sin keyframes: mueve la entidad seleccionada y pulsa + Keyframe aquí.')}</span>`;
  tlEnt.path.keyframes.forEach((kf, idx) => {
    const chip = document.createElement('span');
    chip.className = 'kfchip';
    chip.innerHTML = `${kf.time.toFixed(1)}s <button class="x" title="${t('Eliminar keyframe')}">x</button>`;
    chip.title = t('Ir a este keyframe');
    chip.onclick = () => { PB.t = kf.time; applyAllPaths(kf.time); $('tlScrub').value = kf.time; tlTimeLabel(); };
    chip.querySelector('.x').onclick = e => {
      e.stopPropagation(); pushUndo();
      tlEnt.path.keyframes.splice(idx, 1);
      refreshKfs(); updatePathViz(tlEnt);
    };
    el.appendChild(chip);
  });
  updateScrubMax(); tlTimeLabel();
}
$('btnTimeline').onclick = () => {
  if ($('timelinePanel').classList.contains('hidden')) openTimeline();
  else { stopPB(); $('timelinePanel').classList.add('hidden'); }
};
$('tlClose').onclick = () => { stopPB(); $('timelinePanel').classList.add('hidden'); };
$('tlCam').addEventListener('change', e => {
  stopPB();
  tlEnt = findEnt(e.target.value);
  PB.t = 0; $('tlScrub').value = 0;
  refreshKfs();
});
$('tlInterp').addEventListener('change', e => {
  if (!tlEnt) return;
  pushUndo();
  tlEnt.path.interpolation = e.target.value;
  updatePathViz(tlEnt);
});
$('tlAddKf').onclick = () => {
  if (!tlEnt) { toast('Selecciona una entidad en el timeline'); return; }
  pushUndo();
  if (!tlEnt.path) tlEnt.path = { interpolation: 'catmullrom', keyframes: [] };
  const tk = Math.max(0, +$('tlKfTime').value || 0);
  const src = tlEnt.kind === 'camera' ? tlEnt.cam : tlEnt.root;
  const kf = { time: tk, pos: v3(src.position), rot: eDeg(src.rotation) };
  if (tlEnt.kind === 'camera') kf.fov = +tlEnt.cam.fov.toFixed(1);
  const kfs = tlEnt.path.keyframes;
  const existing = kfs.findIndex(k => Math.abs(k.time - tk) < 0.01);
  if (existing >= 0) kfs[existing] = kf; else { kfs.push(kf); kfs.sort((a, b) => a.time - b.time); }
  $('tlKfTime').value = (tk + 2).toFixed(1);
  refreshKfs(); updatePathViz(tlEnt);
  toast(t(existing >= 0 ? 'Keyframe en t={t}s actualizado' : 'Keyframe en t={t}s añadido', { t: tk.toFixed(1) }));
};
$('tlScrub').addEventListener('input', e => {
  stopPB();
  PB.t = +e.target.value;
  applyAllPaths(PB.t);
  tlTimeLabel();
});
function stopPB() {
  PB.playing = false;
  $('tlPlay').innerHTML = '<i class="ph ph-play"></i>';
  controls.enabled = true;
}
$('tlPlay').onclick = () => {
  if (PB.playing) { stopPB(); return; }
  if (!animEnts().length) { toast('Necesitas al menos 2 keyframes para reproducir'); return; }
  if (PB.t >= globalDuration() - 0.01) PB.t = 0;
  PB.playing = true;
  $('tlPlay').innerHTML = '<i class="ph ph-pause"></i>';
  if (tlEnt && tlEnt.kind === 'camera') {
    setPipEnt(tlEnt);
    if (viewCam === tlEnt.cam) controls.enabled = false;
  }
};
$('tlStop').onclick = () => {
  stopPB(); PB.t = 0; $('tlScrub').value = 0;
  applyAllPaths(0);
  tlTimeLabel();
};
$('tlCap').onclick = () => { captureFrame(tlEnt && tlEnt.kind === 'camera' ? tlEnt : activeCamEnt); };
$('tlVideo').onclick = () => exportVideo();

function tickPlayback(dt) {
  if (!PB.playing) return;
  PB.t += dt;
  const dur = globalDuration();
  if (PB.t >= dur) {
    if ($('tlLoop').checked) PB.t = dur > 0 ? PB.t % dur : 0;
    else { PB.t = dur; stopPB(); }
  }
  applyAllPaths(PB.t);
  $('tlScrub').value = PB.t;
  tlTimeLabel();
}

/* ---------- exportación de video (WebM) ---------- */
let vidState = null;
function exportVideo() {
  if (vidState) return;
  const camEnt = (tlEnt && tlEnt.kind === 'camera') ? tlEnt : (pipEnt || R.cameras[0]);
  if (!camEnt) { toast('Crea una camara primero'); return; }
  const dur = globalDuration();
  if (dur < 0.1) { toast('Necesitas al menos 2 keyframes para reproducir'); return; }
  if (typeof MediaRecorder === 'undefined' || !capCanvas.captureStream) {
    toast('Tu navegador no soporta la grabación de video (MediaRecorder)'); return;
  }
  stopPB();
  const mime = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm']
    .find(m => MediaRecorder.isTypeSupported(m)) || '';
  const stream = capCanvas.captureStream(60);
  const rec = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: 14000000 } : undefined);
  const chunks = [];
  rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
  // estado previo de todo lo animado, para restaurarlo al terminar
  const saved = [];
  for (const e of new Set([...animEnts(), camEnt])) {
    const o = e.kind === 'camera' ? e.cam : e.root;
    saved.push({ e, o, pos: o.position.clone(), quat: o.quaternion.clone(), fov: e.kind === 'camera' ? e.cam.fov : null });
  }
  const restore = () => {
    for (const s of saved) {
      s.o.position.copy(s.pos); s.o.quaternion.copy(s.quat);
      if (s.fov !== null && Math.abs(s.e.cam.fov - s.fov) > 0.01) {
        s.e.cam.fov = s.fov; s.e.cam.updateProjectionMatrix(); updateFrustumViz(s.e);
      }
    }
  };
  $('vidOverlay').classList.remove('hidden');
  $('vidFill').style.width = '0%';
  $('vidInfo').textContent = `${camEnt.name} · 0.0 / ${dur.toFixed(1)} s`;
  vidState = { cancel: false };
  rec.onstop = () => {
    $('vidOverlay').classList.add('hidden');
    restore();
    const cancelled = vidState && vidState.cancel;
    vidState = null;
    if (cancelled) { toast('Exportación de video cancelada'); return; }
    const blob = new Blob(chunks, { type: mime || 'video/webm' });
    const url = URL.createObjectURL(blob);
    download(`${sanitize(sceneName)}_${sanitize(camEnt.name)}.webm`, url);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    toast(t('Video exportado ({s} s, 1600x900 WebM)', { s: dur.toFixed(1) }));
  };
  rec.start(200);
  const t0 = performance.now();
  const frame = () => {
    if (!vidState) return;
    const tt = (performance.now() - t0) / 1000;
    if (vidState.cancel || tt >= dur) {
      applyAllPaths(dur);
      cleanRender(capRenderer, camEnt.cam, 16, 9);
      rec.stop();
      return;
    }
    applyAllPaths(tt);
    cleanRender(capRenderer, camEnt.cam, 16, 9);
    $('vidFill').style.width = (tt / dur * 100).toFixed(1) + '%';
    $('vidInfo').textContent = `${camEnt.name} · ${tt.toFixed(1)} / ${dur.toFixed(1)} s`;
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
$('vidCancel').onclick = () => { if (vidState) vidState.cancel = true; };

/* ============================================================
   CAPTURAS Y TOMAS - fotogramas, galería, prompts para IA
   ============================================================ */
let capCounter = 0;
const capCanvas = document.createElement('canvas');
capCanvas.width = 1600; capCanvas.height = 900;
const capRenderer = new THREE.WebGLRenderer({ canvas: capCanvas, antialias: true, preserveDrawingBuffer: true });
capRenderer.setSize(1600, 900, false);
capRenderer.outputColorSpace = THREE.SRGBColorSpace;
capRenderer.toneMapping = THREE.ACESFilmicToneMapping;
capRenderer.toneMappingExposure = 1.05;
capRenderer.shadowMap.enabled = true;
capRenderer.shadowMap.type = THREE.PCFSoftShadowMap;

function renderToCapCanvas(camEnt) {
  const cam = camEnt ? camEnt.cam : viewCam;
  cleanRender(capRenderer, cam, 16, 9);
  return cam;
}
function camDisplayName(camEnt) {
  return camEnt ? camEnt.name : (activeCamEnt ? activeCamEnt.name : t('Vista libre'));
}
function captureFrame(camEnt) {
  renderToCapCanvas(camEnt);
  const url = capCanvas.toDataURL('image/jpeg', 0.92);
  R.captures.unshift({
    id: uid('cap'), name: `${t('Captura')} ${String(++capCounter).padStart(2, '0')}`,
    cam: camDisplayName(camEnt), url, date: new Date().toISOString()
  });
  renderCaps();
  toast(t('{n} - captura guardada', { n: camDisplayName(camEnt) }));
}
$('btnCapture').onclick = () => captureFrame(activeCamEnt);

function renderCaps() {
  const el = $('capList'); el.innerHTML = '';
  R.captures.forEach((cap, idx) => {
    const d = document.createElement('div');
    d.className = 'capItem';
    d.innerHTML = `
      <img src="${cap.url}" alt="">
      <div class="acts">
        <button class="mini" data-a="dl" title="${t('Descargar JPG')}">DL</button>
        <button class="mini" data-a="del" title="${t('Eliminar')}">x</button>
      </div>
      <div class="cap-nm">${escapeHtml(cap.name)} · ${escapeHtml(cap.cam)}</div>`;
    d.querySelector('img').onclick = () => {
      openModal(cap.name + ' - ' + cap.cam, `
        <img src="${cap.url}" style="width:100%;border-radius:10px">
        <div class="grid2" style="margin-top:10px">
          <button class="btn primary" id="mCapDl">${t('Descargar JPG')}</button>
          <button class="btn outline" id="mCapClose">${t('Cerrar')}</button>
        </div>`);
      $('mCapDl').onclick = () => download(`${sanitize(sceneName)}_${sanitize(cap.cam)}_${idx + 1}.jpg`, cap.url);
      $('mCapClose').onclick = closeModal;
    };
    d.querySelector('[data-a="dl"]').onclick = e => {
      e.stopPropagation();
      download(`${sanitize(sceneName)}_${sanitize(cap.cam)}_${idx + 1}.jpg`, cap.url);
    };
    d.querySelector('[data-a="del"]').onclick = e => {
      e.stopPropagation();
      R.captures.splice(idx, 1); renderCaps();
    };
    el.appendChild(d);
  });
}

// ---------- generador de prompts ----------
const {
  characterFacingInfo,
  captureShotState,
  shotDirectionInputsHTML,
  collectShotDirectionInputs,
  generatePrompt
} = createPromptTools({
  THREE,
  R,
  env,
  t,
  SKY_PRESETS,
  FLOORS,
  JOINT_LABELS,
  v3,
  eDeg,
  currentPoseOf,
  camDisplayName,
  escapeHtml,
  getViewCam: () => viewCam,
  getSceneName: () => sceneName,
  getSceneDesc: () => sceneDesc
});

// ---------- tomas ----------
function renderShots() {
  const el = $('shotList'); el.innerHTML = '';
  for (const sh of R.shots) {
    const d = document.createElement('div');
    d.className = 'shotItem';
    d.innerHTML = `
      ${sh.thumb ? `<img src="${sh.thumb}" alt="">` : ''}
      <div class="sh-bd">
        <div class="sh-nm">${escapeHtml(sh.name)}</div>
        <div class="sh-meta">${escapeHtml(t(sh.shotType))} · ${escapeHtml(sh.cameraName)}</div>
        <div class="sh-acts">
          <button class="mini" data-a="apply">${t('Aplicar')}</button>
          <button class="mini" data-a="prompt">Prompt</button>
          <button class="mini" data-a="del">x</button>
        </div>
      </div>`;
    d.querySelector('[data-a="apply"]').onclick = () => applyShot(sh);
    d.querySelector('[data-a="prompt"]').onclick = () => showShotPrompt(sh);
    d.querySelector('[data-a="del"]').onclick = () => {
      pushUndo();
      R.shots.splice(R.shots.indexOf(sh), 1);
      renderShots();
    };
    el.appendChild(d);
  }
}
function applyShot(sh) {
  const ent = R.cameras.find(c => c.id === sh.cameraId) || null;
  const s = sh.camState;
  if (ent) {
    ent.cam.position.set(...s.pos);
    ent.cam.rotation.set(DEG(s.rot[0]), DEG(s.rot[1]), DEG(s.rot[2]));
    ent.cam.fov = s.fov; ent.cam.updateProjectionMatrix(); updateFrustumViz(ent);
    setViewCamera(ent); setSelected(ent); setPipEnt(ent);
  } else {
    setViewCamera(null);
    freeCam.position.set(...s.pos);
    freeCam.rotation.set(DEG(s.rot[0]), DEG(s.rot[1]), DEG(s.rot[2]));
    const dir = new THREE.Vector3(); freeCam.getWorldDirection(dir);
    controls.target.copy(freeCam.position).add(dir.multiplyScalar(4));
    controls.update();
  }
  toast(t('Toma "{n}" aplicada', { n: sh.name }));
}
function showShotPrompt(sh) {
  openModal('Prompt - ' + sh.name, `
    ${sh.thumb ? `<img src="${sh.thumb}" style="width:100%;border-radius:10px;margin-bottom:10px">` : ''}
    <textarea id="mPromptTxt" rows="12" readonly style="font-size:12px;line-height:1.5">${escapeHtml(sh.prompt)}</textarea>
    <div class="grid2" style="margin-top:10px">
      <button class="btn primary" id="mPromptCopy">${t('Copiar prompt')}</button>
      <button class="btn outline" id="mPromptRegen">${t('Regenerar con estado actual')}</button>
    </div>
    ${sh.notes ? `<div class="hint">${t('Notas')}: ${escapeHtml(sh.notes)}</div>` : ''}`);
  $('mPromptCopy').onclick = () => copyText(sh.prompt);
  $('mPromptRegen').onclick = () => {
    const ent = R.cameras.find(c => c.id === sh.cameraId) || null;
    const directions = {};
    for (const c of sh.characterStates || [])
      if (c.direction && c.direction.defined) directions[c.id] = c.direction.defined;
    const shotState = captureShotState(ent, directions);
    sh.characterStates = shotState.characterStates;
    sh.propStates = shotState.propStates;
    sh.prompt = generatePrompt(ent, sh.shotType, sh.notes, shotState);
    showShotPrompt(sh);
    toast('Prompt regenerado');
  };
}
$('btnShot').onclick = () => {
  const camOpts = [
    ...(viewCam === freeCam ? [`<option value="">${t('Vista libre actual')}</option>`] : []),
    ...R.cameras.map(c => `<option value="${c.id}" ${activeCamEnt === c ? 'selected' : ''}>${escapeHtml(c.name)}</option>`)
  ].join('');
  if (!camOpts) { toast('Crea una camara primero'); return; }
  openModal(t('Guardar toma'), `
    <div class="mrow"><label>${t('Nombre')}</label><input type="text" id="mShotName" value="${t('Toma')} ${String(R.shots.length + 1).padStart(2, '0')}"></div>
    <div class="mrow"><label>${t('Cámara')}</label><select id="mShotCam">${camOpts}</select></div>
    <div class="mrow"><label>${t('Tipo de plano')}</label><select id="mShotType">${SHOT_TYPES.map(st => `<option value="${escapeHtml(st)}">${escapeHtml(t(st))}</option>`).join('')}</select></div>
    <div class="mrow">
      <label>${t('Direccion de personajes visibles')}</label>
      <div id="mShotCharDirs"></div>
      <div class="hint">${t('Escribe hacia donde mira, avanza o dirige su atencion cada personaje. Si lo dejas vacio, se usara la orientacion inferida por rotacion.')}</div>
    </div>
    <div class="mrow"><label>${t('Notas de direccion')}</label><textarea id="mShotNotes" rows="3" placeholder="${t('Intencion de la toma, movimiento, atmosfera...')}"></textarea></div>
    <div class="mrow"><button class="btn primary w100" id="mShotOk">${t('Guardar toma')}</button></div>`);
  const camSel = $('mShotCam');
  const directionDrafts = {};
  const selectedShotCamEnt = () => R.cameras.find(c => c.id === camSel.value) || null;
  const syncDirectionInputs = () => {
    collectShotDirectionInputs(directionDrafts);
    $('mShotCharDirs').innerHTML = shotDirectionInputsHTML(selectedShotCamEnt(), directionDrafts);
    document.querySelectorAll('#mShotCharDirs [data-shot-dir]').forEach(inp => {
      inp.addEventListener('input', () => collectShotDirectionInputs(directionDrafts));
    });
  };
  const syncType = () => {
    const ent = selectedShotCamEnt();
    if (ent) $('mShotType').value = ent.shotType;
  };
  camSel.addEventListener('change', () => { syncType(); syncDirectionInputs(); });
  syncType(); syncDirectionInputs();
  $('mShotOk').onclick = () => {
    pushUndo();
    const ent = selectedShotCamEnt();
    const cam = ent ? ent.cam : freeCam;
    renderToCapCanvas(ent);
    const tCan = document.createElement('canvas');
    tCan.width = 480; tCan.height = 270;
    tCan.getContext('2d').drawImage(capCanvas, 0, 0, 480, 270);
    const shotType = $('mShotType').value, notes = $('mShotNotes').value.trim();
    const directions = collectShotDirectionInputs(directionDrafts);
    const shotState = captureShotState(ent, directions);
    R.shots.push({
      id: uid('shot'), name: $('mShotName').value.trim() || t('Toma'),
      cameraId: ent ? ent.id : null, cameraName: camDisplayName(ent),
      camState: { pos: v3(cam.position), rot: eDeg(cam.rotation), fov: +cam.fov.toFixed(1) },
      shotType, notes,
      characterStates: shotState.characterStates,
      propStates: shotState.propStates,
      prompt: generatePrompt(ent, shotType, notes, shotState),
      thumb: tCan.toDataURL('image/jpeg', 0.82)
    });
    closeModal(); renderShots();
    toast('Toma guardada con prompt generado');
  };
};

/* ============================================================
   PERSISTENCIA - serializar, undo/redo, guardar/cargar, inicio
   ============================================================ */
const DEFAULT_ENV = JSON.parse(JSON.stringify(env));

function serializeScene(opts = {}) {
  return {
    app: 'BlockoutDirector', version: 1, projectName: 'Blockout Director',
    sceneName, description: sceneDesc, savedAt: new Date().toISOString(),
    environment: { ...env },
    freeCamera: { pos: v3(freeCam.position), rot: eDeg(freeCam.rotation),
      target: v3(viewCam === freeCam ? controls.target : freeTargetSaved) },
    characters: R.characters.map(c => ({
      id: c.id, name: c.name, role: c.role, emotion: c.emotion, notes: c.notes,
      charKind: c.charKind, color: c.colorHex, tintOnly: !!c.tintOnly, assetId: c.assetId || null,
      position: v3(c.root.position), rotation: eDeg(c.root.rotation), scale: v3(c.root.scale),
      poseName: c.poseName, pose: (c.joints || c.rig) ? currentPoseOf(c) : null,
      path: c.path && c.path.keyframes.length ? JSON.parse(JSON.stringify(c.path)) : null
    })),
    props: R.props.map(p => ({
      id: p.id, name: p.name, type: p.type, color: p.colorHex, assetId: p.assetId || null,
      position: v3(p.root.position), rotation: eDeg(p.root.rotation), scale: v3(p.root.scale),
      light: p.lightParams ? { ...p.lightParams } : null,
      path: p.path && p.path.keyframes.length ? JSON.parse(JSON.stringify(p.path)) : null
    })),
    cameras: R.cameras.map(c => ({
      id: c.id, name: c.name, fov: +c.cam.fov.toFixed(1), shotType: c.shotType,
      position: v3(c.cam.position), rotation: eDeg(c.cam.rotation),
      path: JSON.parse(JSON.stringify(c.path))
    })),
    shots: JSON.parse(JSON.stringify(R.shots)),
    captures: opts.captures ? JSON.parse(JSON.stringify(R.captures)) : [],
    assets: opts.assets ? usedAssets() : {}
  };
}
// solo los assets referenciados por entidades de la escena actual
function usedAssets() {
  const out = {};
  for (const e of [...R.characters, ...R.props])
    if (e.assetId && R.assets[e.assetId]) out[e.assetId] = R.assets[e.assetId];
  return out;
}

function clearScene(opts = {}) {
  stopPB();
  setViewCamera(null);
  tc.detach(); selected = null; $('rightPanel').classList.add('hidden');
  for (const c of R.characters) {
    scene.remove(c.root); disposeObject(c.root);
    if (c.pathViz) { scene.remove(c.pathViz); disposeObject(c.pathViz); }
  }
  for (const p of R.props) {
    scene.remove(p.root); disposeObject(p.root);
    if (p.pathViz) { scene.remove(p.pathViz); disposeObject(p.pathViz); }
  }
  for (const c of R.cameras) {
    scene.remove(c.cam);
    if (c.pathViz) { scene.remove(c.pathViz); disposeObject(c.pathViz); }
    disposeObject(c.viz);
  }
  R.characters.length = 0; R.props.length = 0; R.cameras.length = 0; R.shots.length = 0;
  if (!opts.keepCaptures) R.captures.length = 0;
  // los assets (GLB en base64) se conservan siempre: las entidades de escenas
  // cargadas o restauradas por undo los referencian por id
  pipEnt = null; tlEnt = null; PB.t = 0; PB.playing = false;
  camCounter = 0; colorIdx = 0;
}

function applySceneData(data, opts = {}) {
  clearScene(opts);
  booting = true;
  try {
    sceneName = data.sceneName || 'Escena';
    sceneDesc = data.description || '';
    Object.assign(env, DEFAULT_ENV, data.environment || {});
    if (data.assets) Object.assign(R.assets, data.assets);
    ensureDefaultAsset();
    for (const c of data.characters || []) {
      if (c.charKind === 'glb') {
        instantiateGlb(c.assetId, 'character', { id: c.id, name: c.name, role: c.role, emotion: c.emotion,
          notes: c.notes, color: c.color, tintOnly: !!c.tintOnly, pose: c.pose, poseName: c.poseName,
          pos: c.position, rot: c.rotation, scale: c.scale, path: c.path || null }, false);
      } else {
        const ent = addMannequin({ noUndo: true, noSelect: true, id: c.id, name: c.name, role: c.role,
          emotion: c.emotion, notes: c.notes, color: c.color, pos: c.position, path: c.path || undefined });
        ent.root.rotation.set(DEG(c.rotation[0]), DEG(c.rotation[1]), DEG(c.rotation[2]));
        ent.root.scale.set(...(c.scale || [1, 1, 1]));
        if (c.pose) applyPose(ent, c.pose, c.poseName);
      }
    }
    colorIdx = R.characters.length;
    for (const p of data.props || []) {
      if (p.type === 'glb') {
        instantiateGlb(p.assetId, 'prop', { id: p.id, name: p.name, pos: p.position, rot: p.rotation,
          scale: p.scale, path: p.path || null }, false);
      } else {
        const ent = addProp(p.type, { noUndo: true, noSelect: true, id: p.id, name: p.name, color: p.color,
          pos: p.position, lightParams: p.light || undefined, path: p.path || undefined });
        ent.root.rotation.set(DEG(p.rotation[0]), DEG(p.rotation[1]), DEG(p.rotation[2]));
        ent.root.scale.set(...(p.scale || [1, 1, 1]));
      }
    }
    for (const c of data.cameras || []) {
      addCamera({ noUndo: true, noSelect: true, id: c.id, name: c.name, fov: c.fov, shotType: c.shotType,
        pos: c.position, rot: c.rotation, path: c.path || { interpolation: 'catmullrom', keyframes: [] } });
    }
    camCounter = R.cameras.length;
    R.shots.push(...(data.shots || []));
    if (!opts.keepCaptures && data.captures && data.captures.length) {
      R.captures.push(...data.captures);
      capCounter = R.captures.length;
    }
    if (data.freeCamera) {
      freeCam.position.set(...data.freeCamera.pos);
      if (data.freeCamera.target) {
        controls.target.set(...data.freeCamera.target);
        freeTargetSaved.set(...data.freeCamera.target);
      }
      controls.update();
    }
  } finally { booting = false; }
  applyEnv(); syncEnvUI();
  $('inpSceneName').value = sceneName; $('inpSceneDesc').value = sceneDesc;
  renderCharList(); renderPropList(); renderPersp(); renderShots(); renderCaps();
  refreshPipSelect(); refreshTlCams(); refreshKfs();
  if (R.cameras.length && !pipEnt) setPipEnt(R.cameras[0]);
}
// ---------- deshacer / rehacer ----------
const undoStack = [], redoStack = [];
function snapshot() { return JSON.stringify(serializeScene({})); }
function pushUndo() {
  if (booting) return;
  undoStack.push(snapshot());
  if (undoStack.length > 40) undoStack.shift();
  redoStack.length = 0;
}
function doUndo() {
  if (!undoStack.length) { toast('Nada que deshacer'); return; }
  redoStack.push(snapshot());
  applySceneData(JSON.parse(undoStack.pop()), { keepCaptures: true, keepAssets: true });
}
function doRedo() {
  if (!redoStack.length) { toast('Nada que rehacer'); return; }
  undoStack.push(snapshot());
  applySceneData(JSON.parse(redoStack.pop()), { keepCaptures: true, keepAssets: true });
}

// ---------- guardar / abrir (localStorage) ----------
const LSKEY = 'bd_scenes_v1';
function savedScenes() { try { return JSON.parse(localStorage.getItem(LSKEY) || '{}'); } catch { return {}; } }
function persistScenes(all) { localStorage.setItem(LSKEY, JSON.stringify(all)); }
// miniatura de la vista actual para el lanzador de proyectos
function makeSceneThumb() {
  try {
    renderToCapCanvas(activeCamEnt);
    const c = document.createElement('canvas');
    c.width = 480; c.height = 270;
    c.getContext('2d').drawImage(capCanvas, 0, 0, 480, 270);
    return c.toDataURL('image/jpeg', 0.72);
  } catch { return null; }
}
function saveSceneLocal(name, silent) {
  const all = savedScenes();
  const thumb = makeSceneThumb();
  try { const d = serializeScene({ assets: true }); d.thumb = thumb; all[name] = d; persistScenes(all); }
  catch (e1) {
    try {
      const d = serializeScene({}); d.thumb = thumb; all[name] = d;
      persistScenes(all);
      if (!silent) toast('Guardada sin los modelos GLB (superan el límite del navegador). Usa «Exportar» para conservarlos.');
      return true;
    } catch (e2) { if (!silent) toast('Almacenamiento del navegador lleno: usa «Exportar» para guardar como archivo.'); return false; }
  }
  if (!silent) toast(t('Escena "{n}" guardada en el navegador', { n: name }));
  return true;
}
function fmtDate(iso) { try { return new Date(iso).toLocaleString(getLang(), { dateStyle: 'short', timeStyle: 'short' }); } catch { return ''; } }

$('btnSave').onclick = () => {
  openModal(t('Guardar escena'), `
    <div class="mrow"><label>${t('Nombre')}</label><input type="text" id="mSaveName" value="${escapeHtml(sceneName)}"></div>
    <div class="hint">${t('Se guarda en este navegador. Las capturas no se incluyen aqui: usa Exportar para generar un archivo completo con capturas y modelos GLB.')}</div>
    <div class="mrow"><button class="btn primary w100" id="mSaveOk">${t('Guardar')}</button></div>`);
  $('mSaveOk').onclick = () => {
    const n = $('mSaveName').value.trim() || sceneName;
    sceneName = n; $('inpSceneName').value = n;
    if (saveSceneLocal(n)) closeModal();
  };
};
$('btnOpen').onclick = () => {
  const all = savedScenes();
  const names = Object.keys(all).sort();
  if (!names.length) {
    openModal(t('Abrir escena'), `<div class="hint">${t('No hay escenas guardadas en este navegador. Usa Guardar o Importar primero.')}</div>`);
    return;
  }
  openModal(t('Abrir escena'), names.map((n, i) => `
    <div class="item" data-i="${i}" style="cursor:default">
      <span>${t('Escena')}</span>
      <span class="nm">${escapeHtml(n)}<br><span class="hint" style="margin:0">${fmtDate(all[n].savedAt)}</span></span>
      <button class="mini" data-a="load">${t('Cargar')}</button>
      <button class="mini" data-a="dup" title="${t('Duplicar')}">Dup</button>
      <button class="mini" data-a="del" title="${t('Eliminar')}">x</button>
    </div>`).join(''));
  document.querySelectorAll('#modalBody .item').forEach(row => {
    const n = names[+row.dataset.i];
    row.querySelector('[data-a="load"]').onclick = () => {
      pushUndo(); applySceneData(all[n], {}); closeModal();
      toast(t('Escena "{n}" cargada', { n }));
    };
    row.querySelector('[data-a="dup"]').onclick = () => {
      const copy = n + ' ' + t('copia');
      all[copy] = JSON.parse(JSON.stringify(all[n]));
      try { persistScenes(all); } catch { toast('Sin espacio para duplicar'); return; }
      $('btnOpen').onclick();
    };
    row.querySelector('[data-a="del"]').onclick = () => {
      delete all[n];
      try { persistScenes(all); } catch {}
      $('btnOpen').onclick();
    };
  });
};

// ---------- exportar / importar / nueva ----------
$('btnExport').onclick = () => {
  const blob = new Blob([JSON.stringify(serializeScene({ assets: true, captures: true }))], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  download(sanitize(sceneName) + '.blockout.json', url);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  toast('Escena exportada como archivo JSON (incluye GLB y capturas)');
};
$('btnImport').onclick = () => $('fileImport').click();
$('fileImport').addEventListener('change', e => {
  const f = e.target.files[0];
  if (!f) return;
  e.target.value = '';
  f.text().then(txt => {
    const data = JSON.parse(txt);
    if (data.app !== 'BlockoutDirector') { toast('Este archivo no es una escena de Blockout Director'); return; }
    pushUndo();
    applySceneData(data, {});
    closeLauncher();
    toast(t('Escena "{n}" importada', { n: data.sceneName }));
  }).catch(err => { console.error(err); toast('No se pudo leer el archivo JSON'); });
});
$('btnNew').onclick = () => {
  openModal(t('Nueva escena'), `
    <div class="hint">${t('Se creara una escena vacia. La actual se puede recuperar con Deshacer (Ctrl+Z), o desde Abrir si la guardaste.')}</div>
    <div class="mrow"><label>${t('Nombre')}</label><input type="text" id="mNewName" value="${t('Escena')}_${String(Object.keys(savedScenes()).length + 1).padStart(3, '0')}"></div>
    <div class="mrow"><button class="btn primary w100" id="mNewOk">${t('Crear escena vacia')}</button></div>`);
  $('mNewOk').onclick = () => {
    pushUndo();
    applySceneData({
      app: 'BlockoutDirector', sceneName: $('mNewName').value.trim() || t('Escena'), description: '',
      environment: { ...DEFAULT_ENV, sky: 'dia', floor: 'concreto', sun: 3.2, sunColor: '#fff7e8', amb: 0.95, ambColor: '#cfe2f3' }
    }, {});
    closeModal();
    closeLauncher();
    toast('Escena nueva creada');
  };
};

// ---------- guia ----------
$('btnGuide').onclick = () => openModal(t('Guia rapida'), `
  <p style="margin-top:0">${t('<b>Blockout Director</b> es tu set virtual: monta la escena, dirige las camaras y captura fotogramas de referencia para mantener consistencia en herramientas de IA generativa.')}</p>
  <div class="lbl">${t('Flujo de trabajo')}</div>
  <ol style="margin:4px 0;padding-left:18px;line-height:1.7">
    <li>${t('Configura <b>Entorno</b> (skybox, suelo, iluminacion).')}</li>
    <li>${t('Anade <b>Personajes</b> (maniquies o GLB) y asignales rol, emocion y pose.')}</li>
    <li>${t('Coloca <b>Props</b> y luces puntuales.')}</li>
    <li>${t('Navega hasta un buen encuadre y pulsa <b>+</b> en Perspectivas para crear una camara ahi.')}</li>
    <li>${t('Anima camaras, personajes y props con <b>Trayectorias</b>: selecciona la entidad en el timeline, muevela y anade keyframes. Al reproducir, todo lo que tenga keyframes se anima a la vez.')}</li>
    <li>${t('<b>Capturar</b> genera un JPG limpio 1600x900; <b>Guardar toma</b> ademas guarda encuadre, notas y un prompt listo para IA; el boton de video exporta la trayectoria como WebM.')}</li>
    <li>${t('<b>Guardar</b> en el navegador o <b>Exportar</b> como archivo .json (incluye GLB y capturas). En <b>Proyectos</b> encuentras todo lo guardado.')}</li>
  </ol>
  <div class="lbl">${t('Controles')}</div>
  <ul style="margin:4px 0;padding-left:18px;line-height:1.7">
    <li>${t('Clic izquierdo + arrastrar: orbitar. Rueda: zoom. Clic derecho: paneo.')}</li>
    <li>${t('Clic sobre un objeto: seleccionar. <b>W/E/R</b>: mover / rotar / escalar.')}</li>
    <li>${t('<b>F</b>: centrar vista en la seleccion. <b>Supr</b>: eliminar. <b>Ctrl+D</b>: duplicar. <b>Ctrl+Z / Ctrl+Y</b>: deshacer / rehacer.')}</li>
    <li>${t('En Perspectivas puedes mirar por cualquier camara y reencuadrarla navegando.')}</li>
  </ul>
  <div class="hint">${t('Consejo: entra a la vista de una camara, encuadra navegando y anade keyframes en distintos momentos para crear un travelling suave.')}</div>`);

// ---------- construcción de UI estática ----------
function buildStaticUI() {
  $('skyChips').innerHTML = Object.entries(SKY_PRESETS).map(([k, p]) =>
    `<button class="chip" data-sky="${k}">${t(p.label)}</button>`).join('');
  document.querySelectorAll('#skyChips .chip').forEach(c => c.onclick = () => {
    pushUndo();
    const p = SKY_PRESETS[c.dataset.sky];
    env.sky = c.dataset.sky;
    env.sun = p.sun; env.sunColor = p.sunColor; env.amb = p.amb; env.ambColor = p.ambColor;
    applyEnv(); syncEnvUI();
  });
  $('selFloor').innerHTML = Object.entries(FLOORS).map(([k, f]) => `<option value="${k}">${t(f.label)}</option>`).join('');
  $('propBtns').innerHTML = Object.entries(PROP_DEFS).map(([k, d]) =>
    `<button class="btn outline" data-p="${k}"><i class="ph ${d.icon}"></i>${t(d.label)}</button>`).join('');
  document.querySelectorAll('#propBtns .btn').forEach(b => b.onclick = () => addProp(b.dataset.p));
  $('btnAddChar').onclick = () => addCharacterAuto({});
  $('btnAddMan').onclick = () => addMannequin({});
  updateCharModelHint();
}

// ---------- escena de ejemplo ----------
function buildSampleScene() {
  booting = true;
  sceneName = t('Reunión en la galería');
  sceneDesc = t('Cuatro personajes conversan alrededor de una mesa de madera en una sala interior; un quinto se dirige a la puerta.');
  Object.assign(env, { sky: 'interior', floor: 'madera', sun: 2.4, sunColor: '#fff2df', amb: 0.85, ambColor: '#cdd3da' });

  addProp('mesa', { noUndo: true, noSelect: true, pos: [0, 0, 0] });
  addProp('silla', { noUndo: true, noSelect: true, pos: [-1.25, 0, -0.3], rotY: 90 });
  addProp('silla', { noUndo: true, noSelect: true, pos: [1.25, 0, -0.3], rotY: -90 });
  addProp('silla', { noUndo: true, noSelect: true, pos: [-1.25, 0, 0.55], rotY: 90 });
  addProp('pared', { noUndo: true, noSelect: true, pos: [-1.55, 0, -3.6] });
  addProp('pared', { noUndo: true, noSelect: true, pos: [1.55, 0, -3.6] });
  addProp('puerta', { noUndo: true, noSelect: true, pos: [3.9, 0, -1.8], rotY: -70 });

  addCharacterAuto({ noUndo: true, noSelect: true, name: t('Hombre de tweed'), role: t('Secundario'), color: '#e6c84f',
    pos: [-1.25, 0, -0.3], rotY: 90, pose: 'Sentado hablando', emotion: t('Interesado') });
  addCharacterAuto({ noUndo: true, noSelect: true, name: t('Hombre de traje oscuro'), role: t('Protagonista'), color: '#63b56a',
    pos: [1.25, 0, -0.3], rotY: -90, pose: 'Sentado', emotion: t('Serio') });
  addCharacterAuto({ noUndo: true, noSelect: true, name: t('Hombre de traje rojo'), role: t('Secundario'), color: '#d94f6e',
    pos: [-1.25, 0, 0.55], rotY: 90, pose: 'Sentado' });
  addCharacterAuto({ noUndo: true, noSelect: true, name: t('Mujer de vestido gris'), role: t('Testigo'), color: '#e8896a',
    pos: [-2.1, 0, -1.35], rotY: 57, pose: 'Hablando', emotion: t('Inquieta') });
  addCharacterAuto({ noUndo: true, noSelect: true, name: t('Hombre de abrigo marrón'), role: t('Antagonista'), color: '#2fa8a8',
    pos: [2.7, 0, -1.3], rotY: 112, pose: 'Caminando', notes: t('Se dirige a la puerta') });
  colorIdx = 5;

  addCamera({ noUndo: true, noSelect: true, name: 'Main Shot', fov: 38, shotType: 'Plano general',
    pos: [4.6, 1.9, 3.8], lookAt: [0, 1, 0] });
  addCamera({ noUndo: true, noSelect: true, name: 'Cámara 2', fov: 45, shotType: 'Plano medio',
    pos: [-2.9, 1.5, 2.3], lookAt: [-1.1, 1, -0.3] });
  camCounter = 2;
  setPipEnt(R.cameras[0]);
  booting = false;
}

/* ============================================================
   LANZADOR DE PROYECTOS - menú previo a la escena
   ============================================================ */
const AUTOSAVE_KEY = '_Autoguardado';

function openLauncher() { renderLauncher(); $('launcher').classList.remove('hidden'); }
function closeLauncher() { $('launcher').classList.add('hidden'); }

function renderLauncher() {
  const all = savedScenes();
  const names = Object.keys(all).sort((a, b) => (all[b].savedAt || '').localeCompare(all[a].savedAt || ''));
  const el = $('lcGrid'); el.innerHTML = '';
  for (const n of names) {
    const d = all[n];
    const isAuto = n === AUTOSAVE_KEY;
    const card = document.createElement('div');
    card.className = 'lc-item';
    card.innerHTML = `
      <div class="lc-thumb">${d.thumb ? `<img src="${d.thumb}" alt="">` : '<i class="ph ph-film-slate"></i>'}
        ${isAuto ? `<span class="lc-badge">${t('Autoguardado')}</span>` : ''}
        <div class="lc-acts">
          ${isAuto ? '' : `<button class="mini" data-a="dup" title="${t('Duplicar')}"><i class="ph ph-copy"></i></button>`}
          <button class="mini" data-a="del" title="${t('Eliminar')}"><i class="ph ph-trash"></i></button>
        </div>
      </div>
      <div class="lc-bd">
        <div class="lc-nm">${escapeHtml(isAuto ? (d.sceneName || n) : n)}</div>
        <div class="lc-date">${fmtDate(d.savedAt)}</div>
      </div>`;
    card.onclick = () => {
      pushUndo(); applySceneData(d, {}); closeLauncher();
      toast(t('Escena "{n}" cargada', { n: isAuto ? (d.sceneName || n) : n }));
    };
    const dup = card.querySelector('[data-a="dup"]');
    if (dup) dup.onclick = e => {
      e.stopPropagation();
      const allNow = savedScenes();
      allNow[n + ' ' + t('copia')] = JSON.parse(JSON.stringify(allNow[n]));
      try { persistScenes(allNow); } catch { toast('Sin espacio para duplicar'); return; }
      renderLauncher();
    };
    card.querySelector('[data-a="del"]').onclick = e => {
      e.stopPropagation();
      const allNow = savedScenes();
      delete allNow[n];
      try { persistScenes(allNow); } catch {}
      renderLauncher();
    };
    el.appendChild(card);
  }
}
$('btnProjects').onclick = openLauncher;
$('lcContinue').onclick = closeLauncher;
$('lcNew').onclick = () => $('btnNew').onclick();
$('lcImport').onclick = () => $('fileImport').click();
$('lcSample').onclick = () => {
  pushUndo();
  clearScene({});
  buildSampleScene();
  postLoadRefresh();
  closeLauncher();
  toast('Escena de ejemplo cargada');
};

/* ============================================================
   IDIOMA - conmutador ES/EN
   ============================================================ */
function refreshLanguage() {
  document.documentElement.lang = getLang();
  document.title = t('Blockout Director - Consola de dirección 3D');
  applyStaticI18n();
  const next = getLang() === 'es' ? 'EN' : 'ES';
  $('langLabel').textContent = next;
  $('lcLangLabel').textContent = next;
  $('btnLang').title = $('lcLang').title = t('Cambiar idioma (ES/EN)');
  buildStaticUI();
  buildInterpOptions();
  if (tlEnt && tlEnt.path) $('tlInterp').value = tlEnt.path.interpolation;
  syncEnvUI();
  renderCharList(); renderPropList(); renderPersp(); renderShots(); renderCaps();
  refreshPipSelect(); refreshTlCams(); refreshKfs();
  if (selected) renderInspector();
  if (!$('launcher').classList.contains('hidden')) renderLauncher();
}
function toggleLang() { setLang(getLang() === 'es' ? 'en' : 'es'); refreshLanguage(); }
$('btnLang').onclick = toggleLang;
$('lcLang').onclick = toggleLang;

// ---------- arranque ----------
function postLoadRefresh() {
  applyEnv(); syncEnvUI();
  $('inpSceneName').value = sceneName;
  $('inpSceneDesc').value = sceneDesc;
  renderCharList(); renderPropList(); renderPersp(); renderShots(); renderCaps();
  refreshPipSelect(); refreshTlCams(); refreshKfs();
}
buildStaticUI();
await tryLoadDefaultChar();
await loadCameraModel();
buildSampleScene();
postLoadRefresh();
refreshLanguage();
setInterval(() => { try { saveSceneLocal(AUTOSAVE_KEY, true); } catch {} }, 90000);
animate();
openLauncher();
toast('Bienvenido a Blockout Director - pulsa Guía para empezar', 5200);

// acceso de depuración desde la consola del navegador
window.BD = { R, scene, THREE, freeCam, controls, applyPoseByName, captureFrame, generatePrompt, characterFacingInfo,
  openLauncher, exportVideo, setLang: l => { setLang(l); refreshLanguage(); } };
