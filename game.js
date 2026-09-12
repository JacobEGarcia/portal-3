// PORTAL 3 - The Revolution Below (fan game). Engine v2: data-driven chambers.
import * as THREE from './three.module.js';
import { LEVELS } from './levels.js';

const Q = new URLSearchParams(location.search);
const DEBUG = Q.has('debug');
const SHOT = Q.get('shot');
const SIM = Q.get('sim');
const NOCLIP = Q.has('noclip');

// ---------- renderer ----------
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0e12);
scene.fog = new THREE.Fog(0x0b0e12, 40, 110);

const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.05, 250);
scene.add(camera);
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

// ---------- lights ----------
const hemi = new THREE.HemisphereLight(0xdfeaff, 0x3a3e46, 1.15);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffffff, 1.2);
sun.position.set(6, 16, 4); scene.add(sun);
const pitLight = new THREE.PointLight(0x8899bb, 40, 40);
pitLight.position.set(0, -7, -3); scene.add(pitLight);

// ---------- materials ----------
const M = {
  panel:  new THREE.MeshStandardMaterial({ color: 0xe6eaee, roughness: 0.55, metalness: 0.05 }),
  metal:  new THREE.MeshStandardMaterial({ color: 0x394049, roughness: 0.8,  metalness: 0.05 }),
  floor:  new THREE.MeshStandardMaterial({ color: 0x3b4048, roughness: 0.9 }),
  accent: new THREE.MeshStandardMaterial({ color: 0xf7941e, roughness: 0.5, emissive: 0x552f00 }),
  cube:   new THREE.MeshStandardMaterial({ color: 0xcfd6dd, roughness: 0.4, metalness: 0.05 }),
  door:   new THREE.MeshStandardMaterial({ color: 0x9aa4ae, roughness: 0.6, metalness: 0.05 }),
  laserBeam: new THREE.MeshBasicMaterial({ color: 0xff3322 }),
  bridgeDeck: new THREE.MeshBasicMaterial({ color: 0x77bbff, transparent: true, opacity: 0.5 }),
  bridgeRail: new THREE.MeshBasicMaterial({ color: 0xbfe0ff }),
  device: new THREE.MeshStandardMaterial({ color: 0x2a2f36, roughness: 0.7 }),
  recvOff: new THREE.MeshStandardMaterial({ color: 0x661111, emissive: 0x220000 }),
  recvOn:  new THREE.MeshStandardMaterial({ color: 0x22cc44, emissive: 0x115522 }),
  concrete: new THREE.MeshStandardMaterial({ color: 0x6b6560, roughness: 0.95 }),
  rust:    new THREE.MeshStandardMaterial({ color: 0x5a3d2b, roughness: 0.9 }),
  olive:   new THREE.MeshStandardMaterial({ color: 0x5c5a3c, roughness: 0.8 }),
  wood:    new THREE.MeshStandardMaterial({ color: 0x6b4a2f, roughness: 0.85 }),
  gelBlue: new THREE.MeshStandardMaterial({ color: 0x2255ee, roughness: 0.25, emissive: 0x0a2a88, emissiveIntensity: 0.9 }),
  gelOrange: new THREE.MeshStandardMaterial({ color: 0xff7722, roughness: 0.25, emissive: 0x883300, emissiveIntensity: 0.9 }),
  turret: new THREE.MeshStandardMaterial({ color: 0xe8ebee, roughness: 0.35, metalness: 0.2 }),
  rock:   new THREE.MeshStandardMaterial({ color: 0x3a2f26, roughness: 1.0 }),
  woodDark: new THREE.MeshStandardMaterial({ color: 0x4a3623, roughness: 0.85 }),
  brass:  new THREE.MeshStandardMaterial({ color: 0x8a6a2a, roughness: 0.4, metalness: 0.6 }),
  saltWhite: new THREE.MeshStandardMaterial({ color: 0xcfc8b8, roughness: 0.7 }),
  sky:    new THREE.MeshStandardMaterial({ color: 0x87b5d6, roughness: 1.0 }),
  sand:   new THREE.MeshStandardMaterial({ color: 0xd8c690, roughness: 1.0 }),
  sea:    new THREE.MeshStandardMaterial({ color: 0x2a5a8a, roughness: 0.25, metalness: 0.1 }),
  wheat:  new THREE.MeshStandardMaterial({ color: 0xc9a44a, roughness: 1.0 }),
};

// ---------- world ----------
const colliders = [];
const portalables = [];
const world = new THREE.Group(); scene.add(world);

function addBox(cx, cy, cz, w, h, d, mat, opts = {}) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  mesh.position.set(cx, cy, cz);
  world.add(mesh);
  const box = { min: new THREE.Vector3(cx - w/2, cy - h/2, cz - d/2),
                max: new THREE.Vector3(cx + w/2, cy + h/2, cz + d/2), mesh, disabled: false, vanish: !!opts.vanish };
  if (opts.appear) { mesh.visible = false; box.disabled = true; box.appear = true; }
  if (!opts.noCollide) colliders.push(box);
  if (opts.portalable) { mesh.userData.portalable = true; portalables.push(mesh); }
  return box;
}

// ---------- portals ----------
const FLIP = new THREE.Matrix4().makeRotationY(Math.PI);
const PORTAL_RX = 0.62, PORTAL_RY = 1.05;

function makePortal(color) {
  const obj = new THREE.Object3D();
  const surf = new THREE.Mesh(new THREE.CircleGeometry(1, 48),
    new THREE.ShaderMaterial({
      uniforms: { map: { value: null } },
      vertexShader: `varying vec4 vC; void main(){ vC = projectionMatrix*modelViewMatrix*vec4(position,1.0); gl_Position = vC; }`,
      fragmentShader: `uniform sampler2D map; varying vec4 vC; void main(){ vec2 uv = clamp(vC.xy/vC.w*0.5+0.5,0.0,1.0); vec4 c = texture2D(map,uv); gl_FragColor = vec4(pow(c.rgb, vec3(0.4545)), c.a); }`,
    }));
  surf.scale.set(PORTAL_RX, PORTAL_RY, 1);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1, 0.045, 10, 60),
    new THREE.MeshBasicMaterial({ color }));
  ring.scale.set(PORTAL_RX, PORTAL_RY, 1); ring.position.z = 0.055;
  obj.add(surf); obj.add(ring);
  obj.visible = false; scene.add(obj);
  return { obj, surf, ring, active: false, color, box: null,
    rt: new THREE.WebGLRenderTarget(Math.floor(innerWidth/2), Math.floor(innerHeight/2)) };
}
const pBlue = makePortal(0x3388ff), pOrange = makePortal(0xff8822);

const _inv = new THREE.Matrix4();
function portalMatrix(a, b, src, dst) { // dst = B * FLIP * inv(A) * src
  dst.copy(b.obj.matrixWorld).multiply(FLIP).multiply(_inv.copy(a.obj.matrixWorld).invert()).multiply(src);
  return dst;
}
function portalDeltaQuat(a, b, q) {
  q.copy(b.obj.quaternion)
   .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI))
   .multiply(a.obj.quaternion.clone().invert());
  return q;
}
function findBoxNear(point, normal) {
  let best = null, bd = 1e9;
  for (const c of colliders) {
    const q = point.clone().addScaledVector(normal, -0.26);
    if (q.x >= c.min.x - 0.01 && q.x <= c.max.x + 0.01 &&
        q.y >= c.min.y - 0.01 && q.y <= c.max.y + 0.01 &&
        q.z >= c.min.z - 0.01 && q.z <= c.max.z + 0.01) {
      const d = q.distanceToSquared(point);
      if (d < bd) { bd = d; best = c; }
    }
  }
  return best;
}
// edge-nudge: clamp the portal center so the ellipse (rx 0.62, ry 1.05) fits the face; fail if the face is too small
function fitPortalOnFace(point, normal) {
  const box = findBoxNear(point, normal);
  if (!box) return null;
  const RX = 0.68, RY = 1.12, q = point.clone();
  const ax = Math.abs(normal.x) > 0.9 ? 'x' : Math.abs(normal.y) > 0.9 ? 'y' : 'z';
  const cl = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  if (ax === 'y') { // floor/ceiling face: spans x,z
    if (box.max.x - box.min.x < RX * 2 || box.max.z - box.min.z < RX * 2) return null;
    q.x = cl(q.x, box.min.x + RX, box.max.x - RX); q.z = cl(q.z, box.min.z + RX, box.max.z - RX);
    q.y = normal.y > 0 ? box.max.y : box.min.y;
  } else if (ax === 'x') {
    if (box.max.y - box.min.y < RY * 2 || box.max.z - box.min.z < RX * 2) return null;
    q.y = cl(q.y, box.min.y + RY, box.max.y - RY); q.z = cl(q.z, box.min.z + RX, box.max.z - RX);
    q.x = normal.x > 0 ? box.max.x : box.min.x;
  } else {
    if (box.max.y - box.min.y < RY * 2 || box.max.x - box.min.x < RX * 2) return null;
    q.y = cl(q.y, box.min.y + RY, box.max.y - RY); q.x = cl(q.x, box.min.x + RX, box.max.x - RX);
    q.z = normal.z > 0 ? box.max.z : box.min.z;
  }
  return q;
}
function placePortal(p, point, normal) {
  const fitted = fitPortalOnFace(point, normal);
  if (!fitted) return false;
  point = fitted;
  const z = normal.clone().normalize();
  let x = Math.abs(z.y) > 0.99 ? new THREE.Vector3(1, 0, 0)
    : new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), z).normalize();
  const y = new THREE.Vector3().crossVectors(z, x).normalize();
  p.obj.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
  p.obj.position.copy(point).addScaledVector(z, 0.03);
  p.obj.updateMatrixWorld();
  p.obj.visible = true; p.active = true;
  p.box = findBoxNear(point, z);
  return true;
}

// ---------- player ----------
const player = {
  pos: new THREE.Vector3(0, 0.9, 6), vel: new THREE.Vector3(),
  yaw: 0, pitch: 0, onGround: false,
  half: new THREE.Vector3(0.3, 0.9, 0.3), eye: 1.62,
};
const keys = {};
addEventListener('keydown', e => keys[e.code] = true);
addEventListener('keyup',   e => keys[e.code] = false);

const overlay = document.getElementById('overlay');
const pausedEl = document.getElementById('paused');
const pchamberEl = document.getElementById('pchamber');
let locked = false, started = false;
if (!DEBUG) {
  overlay.addEventListener('click', () => { initAudio(); canvas.requestPointerLock() });
  pausedEl.addEventListener('click', () => { initAudio(); canvas.requestPointerLock() });
  document.addEventListener('pointerlockchange', () => {
    locked = document.pointerLockElement === canvas;
    if (locked) { started = true; overlay.style.display = 'none'; pausedEl.style.display = 'none'; }
    else if (started && !gameDone) {
      pchamberEl.textContent = levelDef ? levelDef.title : '';
      pausedEl.style.display = 'flex'; overlay.style.display = 'none';
    } else { overlay.style.display = 'flex'; pausedEl.style.display = 'none'; }
  });
} else { overlay.style.display = 'none'; locked = true; }

// R: restart the current chamber (puzzle safety net); M: mute (below, with audio)
addEventListener('keydown', e => {
  if (e.code === 'KeyR' && (started || DEBUG) && !gameDone && !transitioning && levelDef) {
    loadLevel(levelIdx);
    tone(300, 520, 'sine', 0.15, 0.1);
  }
});

addEventListener('mousemove', e => {
  if (!locked || DEBUG) return;
  player.yaw   -= e.movementX * 0.0022;
  player.pitch  = Math.max(-1.45, Math.min(1.45, player.pitch - e.movementY * 0.0022));
});
addEventListener('contextmenu', e => e.preventDefault());
addEventListener('mousedown', e => {
  if (!locked || DEBUG) return;
  if (e.button === 0) shootPortal(pBlue);
  if (e.button === 2) shootPortal(pOrange);
});
addEventListener('keydown', e => { if (e.code === 'KeyE' && locked && !DEBUG) toggleCarry(); });
function tryInteract() {
  if (!interactDef || finaleActive || gameDone) return;
  if (Math.hypot(player.pos.x - interactDef.pos[0], player.pos.z - interactDef.pos[2]) > (interactDef.radius || 1.8)) return;
  finaleActive = true; finaleT0 = clock.elapsedTime; transitioning = true;
  sayQueue.length = 0; subTimer = 0; subEl.style.display = 'none'; // finale dialogue starts clean
  sfxPower();
  const hintEl = document.getElementById('hint'); if (hintEl) hintEl.style.display = 'none';
}
addEventListener('keydown', e => { if (e.code === 'KeyE') tryInteract(); });


// ---------- portal device viewmodel (separate scene, rendered over main view) ----------
const vmScene = new THREE.Scene();
vmScene.add(new THREE.HemisphereLight(0xcfd8e8, 0x2a2620, 1.5));
const vmKey = new THREE.DirectionalLight(0xffffff, 1.6); vmKey.position.set(0.6, 1.2, 0.4); vmScene.add(vmKey);
const vmRig = new THREE.Group(); vmRig.matrixAutoUpdate = false; // local matrix fed from camera each frame
vmScene.add(vmRig);
const vmGun = new THREE.Group(); vmGun.scale.setScalar(0.85); vmRig.add(vmGun);
const VM_BLUE = 0x2f9dff, VM_ORANGE = 0xff9a2f;
const vmCoreMat = new THREE.MeshStandardMaterial({ color: 0x101418, emissive: VM_BLUE, emissiveIntensity: 2.2, roughness: 0.3 });
{
  const white = new THREE.MeshStandardMaterial({ color: 0xe8ecef, roughness: 0.45, metalness: 0.08 });
  const dark  = new THREE.MeshStandardMaterial({ color: 0x23272e, roughness: 0.6, metalness: 0.3 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.068, 0.4, 14), white);
  body.rotation.x = Math.PI / 2; vmGun.add(body);
  const rear = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.14, 0.2), dark);
  rear.position.set(0, -0.045, 0.16); vmGun.add(rear);
  const grip = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.14, 0.09), dark);
  grip.position.set(0, -0.145, 0.2); grip.rotation.x = 0.25; vmGun.add(grip);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.056, 0.009, 8, 20), dark);
  ring.position.z = -0.12; vmGun.add(ring);
  const _ta = new THREE.Vector3();
  for (let i = 0; i < 3; i++) {
    const a = i * Math.PI * 2 / 3 + Math.PI / 6;
    const claw = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.05, 0.18), white);
    claw.position.set(Math.cos(a) * 0.062, Math.sin(a) * 0.062, -0.26);
    _ta.set(-Math.sin(a), Math.cos(a), 0);
    claw.quaternion.setFromAxisAngle(_ta, -0.16); // prongs flare outward at the tip
    vmGun.add(claw);
  }
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.034, 12, 10), vmCoreMat);
  core.position.set(0, 0.005, -0.22); vmGun.add(core);
  const rearGlow = new THREE.Mesh(new THREE.SphereGeometry(0.02, 10, 8), vmCoreMat);
  rearGlow.position.set(0, 0.01, 0.1); vmGun.add(rearGlow);
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.012, 0.3), vmCoreMat);
  stripe.position.set(0, 0.058, -0.02); vmGun.add(stripe);
}
const vmFlash = new THREE.PointLight(VM_BLUE, 0, 2.5); vmFlash.position.set(0, 0, -0.9); vmRig.add(vmFlash);
let vmRecoil = 0, vmBob = 0;
window.__vmFire = w => vmFire(w);
window.__vm = () => ({ rig: vmRig.matrixWorld.elements.slice(12, 15), cam: camera.position.toArray(), vis: vmGun.visible, rec: vmRecoil });
function vmFire(which) {
  vmRecoil = 1;
  const c = which === 'blue' ? VM_BLUE : VM_ORANGE;
  vmCoreMat.emissive.setHex(c); vmFlash.color.setHex(c); vmFlash.intensity = 6;
}
function vmUpdate(dt) {
  const show = (started || DEBUG) && !gameDone && !finaleActive;
  vmGun.visible = show;
  if (!show) return;
  vmRig.matrix.copy(camera.matrixWorld); vmRig.matrixWorldNeedsUpdate = true; // vmScene sits at identity: local == world
  const sp = Math.hypot(player.vel.x, player.vel.z);
  if (player.onGround && sp > 0.5) vmBob += dt * Math.min(sp, 10) * 1.6;
  vmRecoil = Math.max(0, vmRecoil - dt * 6);
  vmFlash.intensity = Math.max(0, vmFlash.intensity - dt * 40);
  const bobA = Math.min(1, sp / 6) * (player.onGround ? 1 : 0.2);
  vmGun.position.set(
    0.37 + Math.cos(vmBob) * 0.011 * bobA,
    -0.34 + Math.abs(Math.sin(vmBob)) * 0.013 * bobA + vmRecoil * 0.03 + Math.sin(clock.elapsedTime * 1.3) * 0.0025,
    -0.72 + vmRecoil * 0.08
  );
  vmGun.rotation.set(-0.02 + vmRecoil * 0.3, -0.11 + Math.cos(vmBob) * 0.01 * bobA, 0);
  vmCoreMat.emissiveIntensity = 2.2 + Math.sin(clock.elapsedTime * 2.1) * 0.5 + vmRecoil * 3;
}

const ray = new THREE.Raycaster();
function shootPortal(p) {
  ray.setFromCamera(new THREE.Vector2(0, 0), camera);
  const hits = ray.intersectObjects(portalables, false);
  if (!hits.length) { sfxFail(); return; }
  const h = hits[0];
  const n = h.face.normal.clone().transformDirection(h.object.matrixWorld);
  const ok = placePortal(p, h.point.clone(), n);
  if (ok === false) { sfxFail(); return; }
  sfxShoot(p === pBlue ? 'blue' : 'orange');
  vmFire(p === pBlue ? 'blue' : 'orange');
}

function toggleCarry() {
  const all = cubes.concat(cores);
  const carried = all.find(c => c.carried);
  if (carried) { carried.carried = false; sfxThud(); return; }
  ray.setFromCamera(new THREE.Vector2(0, 0), camera);
  const hits = ray.intersectObjects(all.map(c => c.mesh), true);
  if (hits.length && hits[0].distance < 3.2) {
    let o = hits[0].object;
    while (o && !o.userData.cube) o = o.parent;
    if (o) {
      o.userData.cube.carried = true;
      const core = o.userData.cube;
      if (core.isCore && !core.saidPickup) { core.saidPickup = true; for (const l of (levelDef.oracleLines && levelDef.oracleLines.pickup) || []) say(...l); }
    }
  }
}

// ---------- lucky cat cameo (Aperture test subject #0048: the waving cat) ----------
function buildLuckyCat() {
  const g = new THREE.Group();
  const fur = new THREE.MeshStandardMaterial({ color: 0xf5efe2, roughness: 0.6 });
  const red = new THREE.MeshStandardMaterial({ color: 0xc23b3b, roughness: 0.7 });
  const cushion = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.1, 0.42), red);
  cushion.position.y = 0.05; g.add(cushion);
  const trim = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.03, 0.44), M.brass);
  trim.position.y = 0.015; g.add(trim);
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.17, 18, 14), fur);
  body.scale.set(1, 1.25, 0.9); body.position.y = 0.28; g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 18, 14), fur);
  head.position.y = 0.52; g.add(head);
  for (const sx of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.09, 4), fur);
    ear.position.set(sx * 0.07, 0.63, 0); g.add(ear);
  }
  const pawPivot = new THREE.Group();
  pawPivot.position.set(-0.13, 0.42, 0); g.add(pawPivot);
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.17, 0.05), fur);
  arm.position.set(-0.03, 0.06, 0); pawPivot.add(arm);
  const paw = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), fur);
  paw.position.set(-0.07, 0.15, 0); pawPivot.add(paw);
  pawPivot.rotation.z = 0.5; g.userData.pawPivot = pawPivot;
  const shrine = new THREE.PointLight(0xffb765, 3.5, 3.2, 1.6);
  shrine.position.set(0, 0.75, 0.35); g.add(shrine);
  g.scale.setScalar(1.3);
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.018, 8, 18), red);
  collar.position.y = 0.44; collar.rotation.x = Math.PI / 2; g.add(collar);
  const bell = new THREE.Mesh(new THREE.SphereGeometry(0.028, 10, 8), M.brass);
  bell.position.set(0, 0.4, 0.1); g.add(bell);
  const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.015, 16), M.brass);
  coin.rotation.x = Math.PI / 2; coin.position.set(0.02, 0.3, 0.16); g.add(coin);
  return g;
}

// ---------- physics ----------
const GRAV = 20;
const _pl = new THREE.Vector3();
function inPortalMouth(box, pos) {
  for (const p of [pBlue, pOrange]) {
    if (!p.active || p.box !== box) continue;
    _pl.copy(pos); p.obj.worldToLocal(_pl);
    if (Math.abs(_pl.x) < PORTAL_RX - 0.05 && Math.abs(_pl.y) < PORTAL_RY - 0.05 &&
        _pl.z > -0.7 && _pl.z < 1.05) return true; // front margin must exceed half extents (0.9) so fallers never collide mid-mouth
  }
  return false;
}
function collideAABB(pos, vel, half) {
  let onGround = false;
  for (const c of colliders) {
    if (c.disabled) continue;
    if (inPortalMouth(c, pos)) continue;
    if (pos.x + half.x <= c.min.x || pos.x - half.x >= c.max.x) continue;
    if (pos.y + half.y <= c.min.y || pos.y - half.y >= c.max.y) continue;
    if (pos.z + half.z <= c.min.z || pos.z - half.z >= c.max.z) continue;
    const px = Math.min(pos.x + half.x - c.min.x, c.max.x - (pos.x - half.x));
    const py = Math.min(pos.y + half.y - c.min.y, c.max.y - (pos.y - half.y));
    const pz = Math.min(pos.z + half.z - c.min.z, c.max.z - (pos.z - half.z));
    if (px < py && px < pz) {
      pos.x += (pos.x < (c.min.x + c.max.x) / 2 ? -1 : 1) * px; vel.x = 0;
    } else if (py < pz) {
      const dir = pos.y < (c.min.y + c.max.y) / 2 ? -1 : 1;
      pos.y += dir * py;
      if (dir > 0) onGround = true;
      vel.y = 0;
    } else {
      pos.z += (pos.z < (c.min.z + c.max.z) / 2 ? -1 : 1) * pz; vel.z = 0;
    }
  }
  return onGround;
}

const _rel = new THREE.Vector3(), _prel = new THREE.Vector3();
function tryTeleport(p, other, pos, prevPos, vel, yawPitch) {
  if (!p.active || !other.active) return false;
  _rel.copy(pos); p.obj.worldToLocal(_rel);
  _prel.copy(prevPos); p.obj.worldToLocal(_prel);
  if (window.__traceTp && yawPitch) window.__traceTp.push({ f: frames, id: p === pBlue ? 'B' : 'O', pz: +_prel.z.toFixed(3), cz: +_rel.z.toFixed(3), px: +_prel.x.toFixed(2), py: +_prel.y.toFixed(2) });
  if (_prel.z <= 0 || _rel.z > 0) return false;                    // front -> back crossing only
  const t = _prel.z / (_prel.z - _rel.z);
  const cx = _prel.x + (_rel.x - _prel.x) * t;
  const cy = _prel.y + (_rel.y - _prel.y) * t;
  if (Math.abs(cx) > PORTAL_RX || Math.abs(cy) > PORTAL_RY) return false;
  const dq = new THREE.Quaternion(); portalDeltaQuat(p, other, dq);
  const crossW = p.obj.localToWorld(new THREE.Vector3(cx, cy, 0));
  const m = new THREE.Matrix4();
  portalMatrix(p, other, new THREE.Matrix4().makeTranslation(crossW.x, crossW.y, crossW.z), m);
  pos.setFromMatrixPosition(m);
  vel.applyQuaternion(dq);
  const n = new THREE.Vector3(0, 0, 1).applyQuaternion(other.obj.quaternion);
  pos.addScaledVector(n, Math.min(-_rel.z, 1.0) + 0.06);
  if (yawPitch) {
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(yawPitch.pitch, yawPitch.yaw, 0, 'YXZ'));
    q.premultiply(dq);
    const e = new THREE.Euler().setFromQuaternion(q, 'YXZ');
    yawPitch.yaw = e.y; yawPitch.pitch = Math.max(-1.45, Math.min(1.45, e.x));
  }
  return true;
}

// ---------- subtitles ----------
const subEl = document.getElementById('sub');
const subWho = subEl.querySelector('.who'), subLine = subEl.querySelector('.line');
let subTimer = 0; const sayQueue = [];
function say(who, text, dur = 4) {
  sayQueue.push([who, text, dur]);
  const bl = { GLaDOS: 480, CAVE: 150, BETTY: 990, ORACLE: 720, WHEATLEY: 840 }[who.split(' ')[0]] || 400;
  tone(bl, bl, who.startsWith('CAVE') ? 'square' : 'sine', 0.08, 0.05);
}

// ---------- ambience (WebAudio, procedural, starts on first click) ----------
let AC = null, masterGain = null, audioMuted = false;
let ambLP = null, ambOscs = [], ambNG = null, noiseBuf = null, ambProfile = 'modern';
const AMB_PROFILES = {
  modern: { lp: 300, oscs: [55, 55.7, 110.4], ng: 0.010 },
  decay:  { lp: 180, oscs: [47, 47.6, 94.3],  ng: 0.018 },
  salt:   { lp: 130, oscs: [41, 41.5, 82.4],  ng: 0.022 },
  beach:  { lp: 650, oscs: [60, 60.4, 90.2],  ng: 0.05 },
  wheat:  { lp: 900, oscs: [50, 50.3, 75.0],  ng: 0.045 },
};
function setAmbience(name) {
  ambProfile = AMB_PROFILES[name] ? name : 'modern';
  if (!AC) return;
  const p = AMB_PROFILES[ambProfile];
  ambLP.frequency.value = p.lp;
  ambOscs.forEach((o, i) => { o.frequency.value = p.oscs[i % p.oscs.length]; });
  ambNG.gain.value = p.ng;
}
function tone(f0, f1, type, dur, vol) {
  if (!AC || audioMuted) return;
  const t = AC.currentTime, o = AC.createOscillator(), gg = AC.createGain();
  o.type = type; o.frequency.setValueAtTime(Math.max(20, f0), t);
  if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
  gg.gain.setValueAtTime(0, t); gg.gain.linearRampToValueAtTime(vol, t + 0.012);
  gg.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(gg); gg.connect(masterGain); o.start(t); o.stop(t + dur + 0.05);
}
function nz(dur, vol, ftype, ffreq, q) {
  if (!AC || audioMuted || !noiseBuf) return;
  const t = AC.currentTime, s = AC.createBufferSource();
  s.buffer = noiseBuf; s.loop = true;
  const f = AC.createBiquadFilter(); f.type = ftype; f.frequency.value = ffreq; f.Q.value = q || 0.7;
  const gg = AC.createGain();
  gg.gain.setValueAtTime(0, t); gg.gain.linearRampToValueAtTime(vol, t + 0.01);
  gg.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f); f.connect(gg); gg.connect(masterGain); s.start(t); s.stop(t + dur + 0.05);
}
const speedvigEl = document.getElementById('speedvig');
const tpflashEl = document.getElementById('tpflash');
let tpFlashT = 0;
function tpFlash(color) {
  tpFlashT = 0.6;
  tpflashEl.style.background = 'radial-gradient(ellipse at center,' + color + '33 0%,' + color + '18 45%,transparent 75%)';
}
const sfxShoot = w => { nz(0.12, 0.22, 'highpass', 1600); tone(w === 'blue' ? 740 : 520, w === 'blue' ? 1180 : 760, 'sine', 0.16, 0.12); };
const sfxFail = () => tone(140, 90, 'sine', 0.12, 0.14);
const sfxTeleport = () => { nz(0.4, 0.26, 'bandpass', 900, 1.2); tone(300, 900, 'sine', 0.35, 0.07); };
const sfxClick = () => tone(1900, 1900, 'square', 0.05, 0.09);
const sfxThud = () => { tone(95, 55, 'sine', 0.16, 0.2); nz(0.08, 0.1, 'lowpass', 300); };
const sfxDoor = () => { tone(200, 90, 'sawtooth', 0.5, 0.06); nz(0.4, 0.05, 'bandpass', 500); };
const sfxChime = () => { tone(660, 660, 'sine', 0.25, 0.11); setTimeout(() => tone(990, 990, 'sine', 0.3, 0.11), 90); };
const sfxBounce = () => tone(220, 520, 'sine', 0.22, 0.15);
const sfxGel = () => nz(0.5, 0.14, 'bandpass', 600, 1.5);
const sfxZap = () => { tone(1300, 180, 'sawtooth', 0.14, 0.14); nz(0.1, 0.16, 'highpass', 2400); };
const sfxLock = () => { tone(1250, 1250, 'square', 0.06, 0.06); setTimeout(() => tone(1250, 1250, 'square', 0.06, 0.06), 110); };
const sfxSting = () => { tone(196, 196, 'triangle', 1.4, 0.12); tone(247, 247, 'triangle', 1.4, 0.09); tone(294, 294, 'triangle', 1.6, 0.09); };
const sfxPower = () => { tone(400, 36, 'sawtooth', 1.3, 0.16); nz(0.9, 0.1, 'lowpass', 220); };
function initAudio() {
  if (AC) { AC.resume(); return; }
  AC = new (window.AudioContext || window.webkitAudioContext)();
  masterGain = AC.createGain(); masterGain.gain.value = 0.5; masterGain.connect(AC.destination);
  ambLP = AC.createBiquadFilter(); ambLP.type = 'lowpass'; ambLP.frequency.value = 200;
  const dg = AC.createGain(); dg.gain.value = 0.045; ambLP.connect(dg); dg.connect(masterGain);
  ambOscs = [55, 55.7, 110.4].map((f, i) => { const o = AC.createOscillator(); o.type = i < 2 ? 'sawtooth' : 'sine'; o.frequency.value = f; o.connect(ambLP); o.start(); return o; });
  noiseBuf = AC.createBuffer(1, AC.sampleRate * 2, AC.sampleRate);
  const nd = noiseBuf.getChannelData(0);
  for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
  const ns = AC.createBufferSource(); ns.buffer = noiseBuf; ns.loop = true;
  const bp = AC.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 750; bp.Q.value = 0.5;
  ambNG = AC.createGain(); ambNG.gain.value = 0.010;
  ns.connect(bp); bp.connect(ambNG); ambNG.connect(masterGain); ns.start();
  setAmbience(ambProfile);
  setInterval(() => {
    if (!AC || audioMuted || Math.random() > 0.45) return;
    if (ambProfile === 'salt' && Math.random() > 0.5) { tone(900 + Math.random() * 700, 500, 'sine', 0.35, 0.035); return; } // cave drip
    tone(500 + Math.random() * 1900, 500 + Math.random() * 1900, 'square', 0.28, 0.018); // PA blip
  }, 3600);
}
addEventListener('keydown', e => {
  if (e.code === 'KeyM' && AC) { audioMuted = !audioMuted; masterGain.gain.value = audioMuted ? 0 : 0.5; }
});

// ---------- Betty (hovering guidance bot, primitive-built) ----------
let bettyBot = null;
function makeBetty() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.34, 20, 16),
    new THREE.MeshStandardMaterial({ color: 0xf2f4f6, roughness: 0.35, metalness: 0.25 }));
  g.add(body);
  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 12),
    new THREE.MeshStandardMaterial({ color: 0x181818, emissive: 0xff8800, emissiveIntensity: 1.7, roughness: 0.2 }));
  eye.position.set(0, 0.05, 0.27); g.add(eye);
  const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.4, 6), M.metal);
  ant.position.set(0, 0.52, 0); g.add(ant);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0xff8800, emissive: 0xff8800, emissiveIntensity: 2.2 }));
  tip.position.set(0, 0.74, 0); g.add(tip);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.022, 8, 36),
    new THREE.MeshStandardMaterial({ color: 0x2a7fd4, emissive: 0x2266cc, emissiveIntensity: 0.9 }));
  ring.rotation.x = Math.PI / 2; ring.position.y = -0.32; g.add(ring);
  return g;
}
function updateSubs(dt) {
  if (subTimer > 0) { subTimer -= dt; if (subTimer <= 0) subEl.style.display = 'none'; return; }
  if (sayQueue.length) {
    const [w, t, d] = sayQueue.shift();
    subWho.textContent = w; subLine.textContent = t;
    subEl.style.display = 'block'; subTimer = d;
  }
}

// ---------- oblique near plane + portal view ----------
function oblique(cam, from) {
  const n = new THREE.Vector3(0, 0, 1).applyQuaternion(from.obj.quaternion);
  const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(n, from.obj.position);
  plane.applyMatrix4(cam.matrixWorldInverse);
  const clip = new THREE.Vector4(plane.normal.x, plane.normal.y, plane.normal.z, plane.constant);
  const proj = cam.projectionMatrix;
  const q = new THREE.Vector4(
    (Math.sign(clip.x) + proj.elements[8]) / proj.elements[0],
    (Math.sign(clip.y) + proj.elements[9]) / proj.elements[5],
    -1.0,
    (1.0 + proj.elements[10]) / proj.elements[14]);
  clip.multiplyScalar(2.0 / clip.dot(q));
  proj.elements[2] = clip.x; proj.elements[6] = clip.y;
  proj.elements[10] = clip.z + 1.0; proj.elements[14] = clip.w;
}
const virtCam = new THREE.PerspectiveCamera(75, camera.aspect, 0.05, 250);
virtCam.matrixAutoUpdate = false; virtCam.matrixWorldAutoUpdate = false;
const _vm = new THREE.Matrix4();
function renderPortalView(see, from) {
  portalMatrix(see, from, camera.matrixWorld, _vm);
  virtCam.matrixWorld.copy(_vm);
  virtCam.matrixWorldInverse.copy(_vm).invert();
  virtCam.fov = camera.fov; virtCam.aspect = camera.aspect;
  virtCam.updateProjectionMatrix();
  if (!NOCLIP) oblique(virtCam, from);
  see.surf.visible = false;
  const oldRT = renderer.getRenderTarget();
  renderer.setRenderTarget(see.rt);
  renderer.render(scene, virtCam);
  renderer.setRenderTarget(oldRT);
  see.surf.visible = true;
  see.surf.material.uniforms.map.value = see.rt.texture;
}

// ---------- beam / bridge tracing (shared: portals conduct both) ----------
const _tq = new THREE.Quaternion(), _tv = new THREE.Vector3(), _tm = new THREE.Matrix4();
function portalCross(origin, dir) { // nearest active portal plane crossing; returns {p, point} or null
  let best = null, bt = 1e9;
  for (const p of [pBlue, pOrange]) {
    if (!p.active || !pOrange.active || !pBlue.active) continue;
    const n = _tv.set(0, 0, 1).applyQuaternion(p.obj.quaternion);
    const denom = dir.dot(n);
    if (denom >= -1e-6) continue;                       // must enter the front face
    const tt = _pl.copy(p.obj.position).sub(origin).dot(n) / denom;
    if (tt <= 0.05 || tt >= bt) continue;
    const hit = origin.clone().addScaledVector(dir, tt);
    const local = p.obj.worldToLocal(hit.clone());
    if (Math.abs(local.x) < PORTAL_RX && Math.abs(local.y) < PORTAL_RY) { best = { p, point: hit }; bt = tt; }
  }
  return best;
}
function tracePath(origin, dir, maxLen, maxBounce = 2) {
  // returns segments: [{a, b}] in world space, portal-conducted; 'hitRecv' set by caller scan
  const segs = [];
  let o = origin.clone(), d = dir.clone().normalize(), remaining = maxLen;
  for (let bounce = 0; bounce <= maxBounce && remaining > 0.1; bounce++) {
    ray.set(o, d); ray.far = remaining;
    const meshes = colliders.filter(c => !c.disabled && c.mesh).map(c => c.mesh);
    const hits = ray.intersectObjects(meshes, false);
    const wallT = hits.length ? hits[0].distance : remaining;
    const cross = portalCross(o, d);
    if (cross && (hits.length === 0 || cross.point.distanceTo(o) < wallT - 0.02)) {
      segs.push({ a: o.clone(), b: cross.point.clone() });
      const other = cross.p === pBlue ? pOrange : pBlue;
      portalDeltaQuat(cross.p, other, _tq);
      const m = new THREE.Matrix4();
      portalMatrix(cross.p, other, new THREE.Matrix4().makeTranslation(cross.point.x, cross.point.y, cross.point.z), m);
      const exit = new THREE.Vector3().setFromMatrixPosition(m);
      d = d.clone().applyQuaternion(_tq);
      remaining -= cross.point.distanceTo(o);
      o = exit.addScaledVector(d, 0.08);
      continue;
    }
    segs.push({ a: o.clone(), b: o.clone().addScaledVector(d, wallT) });
    return { segs, end: o.clone().addScaledVector(d, wallT), open: !hits.length };
  }
  return { segs, end: segs.length ? segs[segs.length-1].b.clone() : origin.clone(), open: false };
}
function segBeam(mesh, a, b, r) { // orient a unit cylinder mesh between points
  const len = a.distanceTo(b);
  mesh.visible = len > 0.05;
  if (!mesh.visible) return;
  mesh.scale.set(r, len, r);
  mesh.position.copy(a).add(b).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), _tv.copy(b).sub(a).normalize());
}

// ---------- level state ----------
let levelIdx = 0, levelDef = null;
let cubes = [], buttons = [], doors = {}, triggers = [], exitDef = null, gels = [], cores = [], socketDef = null, turrets = [], movers = [], levelLights = [];
const PAR = { ch01: 30, ch02: 40, ch03: 55, ch04: 60, ch05: 55, ch06: 70, ch07: 75, ch08: 75, ch09: 90, ch10: 90, ch11: 95, ch12: 85, ch13: 95, ch14: 100 };
let levelT0 = 0;
const fmtT = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
let lasers = [], receivers = [], bridges = [];
let interactDef = null, finaleActive = false, finaleT0 = 0, firedSteps = new Set(), seaMeshes = [], appearMeshes = [], appearLights = [], posterMeshes = [];
const texLoader = new THREE.TextureLoader(); const texCache = {};
function getTex(url) { if (!texCache[url]) { texCache[url] = texLoader.load(url); texCache[url].colorSpace = THREE.SRGBColorSpace; } return texCache[url]; }
const actEl = document.getElementById('actcard');
const actTitle = document.getElementById('acttitle'), actSub = document.getElementById('actsub');
let actTO = null;
function showActCard(ac) {
  if (!actEl) return;
  actEl.style.backgroundImage = 'url(' + ac.img + ')';
  actTitle.textContent = ac.title; actSub.textContent = ac.sub || '';
  actEl.style.display = 'flex'; requestAnimationFrame(() => { actEl.style.opacity = '1'; });
  if (actTO) clearTimeout(actTO);
  actTO = setTimeout(() => { actEl.style.opacity = '0'; setTimeout(() => { actEl.style.display = 'none'; }, 700); }, 3400);
  sfxSting();
}
let transitioning = false, gameDone = false, flickerT = 0, rescueCooldown = 0, rescueT = 0;

const winEl = document.getElementById('win');
const winH2 = winEl.querySelector('h2');
const winLine = document.getElementById('winline');
const titleEl = document.getElementById('title');

const DEFAULT_ENV = { bg: 0x0b0e12, fog: 0x0b0e12, fogNear: 40, fogFar: 110, hemiSky: 0xdfeaff, hemiGround: 0x484e58, hemiInt: 1.3, sunInt: 1.2 };
function applyEnv(env) {
  const e = { ...DEFAULT_ENV, ...(env || {}) };
  scene.background.set(e.bg); scene.fog.color.set(e.fog);
  scene.fog.near = e.fogNear; scene.fog.far = e.fogFar;
  hemi.color.set(e.hemiSky); hemi.groundColor.set(e.hemiGround);
  hemi.userData.baseInt = e.hemiInt; sun.userData.baseInt = e.sunInt;
  hemi.intensity = e.hemiInt; sun.intensity = e.sunInt;
}

function loadLevel(idx) {
  levelT0 = performance.now();
  levelDef = LEVELS[idx]; levelIdx = idx;
  applyEnv(levelDef.env);
  while (world.children.length) world.remove(world.children[0]);
  colliders.length = 0; portalables.length = 0;
  for (const p of [pBlue, pOrange]) { p.active = false; p.obj.visible = false; p.box = null; }
  cubes = []; buttons = []; doors = {}; gels = []; cores = []; exitDef = levelDef.exit || null;
  triggers = (levelDef.triggers || []).map(t => ({ ...t, fired: false }));
  transitioning = false;

  for (const b of levelDef.boxes) addBox(b[0], b[1], b[2], b[3], b[4], b[5], M[b[6]], b[7] || {});
  for (const f of (levelDef.doorFrames || [])) { // 4-bar hollow frame (solid slab occludes portal views)
    const [fx, fy, fz] = f;
    addBox(fx, fy + 1.62, fz - 0.1, 2.6, 0.35, 0.3, M.metal, { noCollide: true });
    addBox(fx, fy - 1.62, fz - 0.1, 2.6, 0.35, 0.3, M.metal, { noCollide: true });
    addBox(fx - 1.12, fy, fz - 0.1, 0.35, 3.6, 0.3, M.metal, { noCollide: true });
    addBox(fx + 1.12, fy, fz - 0.1, 0.35, 3.6, 0.3, M.metal, { noCollide: true });
  }
  for (const d of (levelDef.doors || [])) {
    const [cx, cy, cz, w, h, dd] = d.box;
    const box = addBox(cx, cy, cz, w, h, dd, M.door);
    doors[d.id] = { box, mesh: box.mesh, baseY: cy, amt: 0, link: null };
  }
  for (const b of (levelDef.buttons || [])) {
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.7, 0.18, 24), M.metal);
    base.position.set(b.x, b.y + 0.09, b.z); world.add(base);
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.12, 24),
      new THREE.MeshStandardMaterial({ color: 0xaa2222, roughness: 0.4, emissive: 0x330000 }));
    top.position.set(b.x, b.y + 0.22, b.z); world.add(top);
    const btn = { x: b.x, y: b.y, z: b.z, opens: b.opens, pressed: false, top };
    buttons.push(btn);
    if (b.opens && doors[b.opens]) doors[b.opens].link = btn;
  }
  lasers = []; receivers = []; bridges = [];
  bettyBot = null;
  if (levelDef.betty) { bettyBot = makeBetty(); bettyBot.position.set(...levelDef.betty); bettyBot.userData.baseY = levelDef.betty[1]; world.add(bettyBot); }
  const beamGeo = new THREE.CylinderGeometry(1, 1, 1, 8);
  for (const l of (levelDef.lasers || [])) {
    const em = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.5), M.device);
    em.position.set(l.x, l.y, l.z); world.add(em);
    const beams = [0, 1, 2].map(() => {
      const b = new THREE.Mesh(beamGeo, M.laserBeam); b.visible = false; world.add(b); return b;
    });
    lasers.push({ pos: new THREE.Vector3(l.x, l.y, l.z), dir: new THREE.Vector3(...l.dir).normalize(), beams });
  }
  for (const r of (levelDef.receivers || [])) {
    const boxm = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), M.device);
    boxm.position.set(r.x, r.y, r.z); world.add(boxm);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 10), M.recvOff.clone());
    dome.position.set(r.x, r.y + 0.38, r.z); world.add(dome);
    const recv = { pos: new THREE.Vector3(r.x, r.y, r.z), pressed: false, dome, opens: r.opens };
    receivers.push(recv);
    if (r.opens && doors[r.opens]) doors[r.opens].link = recv;
  }
  for (const br of (levelDef.bridges || [])) {
    const em = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.5, 0.7), M.device);
    em.position.set(br.x, br.y + 0.05, br.z); world.add(em);
    const emGlow = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.18, 0.5), M.bridgeRail);
    emGlow.position.set(br.x, br.y - 0.02, br.z); world.add(emGlow);
    const segs = [0, 1].map(() => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), M.bridgeDeck);
      mesh.visible = false; world.add(mesh);
      const rails = [0, 1].map(() => { const r = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), M.bridgeRail); r.visible = false; world.add(r); return r; });
      const col = { min: new THREE.Vector3(), max: new THREE.Vector3(), mesh: null, disabled: true };
      colliders.push(col);
      return { mesh, col, rails };
    });
    bridges.push({ pos: new THREE.Vector3(br.x, br.y, br.z), dir: new THREE.Vector3(...br.dir).normalize(),
      maxLen: br.maxLen || 30, segs });
  }
  for (const c of (levelDef.cubes || [])) {
    const opts = c[3] || {};
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.62, 0.62), opts.defective ? M.rust : M.cube);
    mesh.add(new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.64, 0.64),
      new THREE.MeshBasicMaterial({ color: opts.defective ? 0xffcc44 : 0x66ccff, wireframe: true, transparent: true, opacity: 0.35 })));
    const cube = { mesh, pos: new THREE.Vector3(c[0], c[1], c[2]), vel: new THREE.Vector3(), carried: false, half: 0.31, defective: !!opts.defective };
    mesh.userData.cube = cube;
    mesh.position.copy(cube.pos); world.add(mesh);
    cubes.push(cube);
  }
  gels = [];
  for (const gl of (levelDef.gels || [])) {
    const [cx, cy, cz, w, h, d] = gl.box;
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), gl.type === 'repel' ? M.gelBlue : M.gelOrange);
    mesh.position.set(cx, cy, cz); world.add(mesh);
    gels.push({ ...gl, minX: cx - w / 2, maxX: cx + w / 2, minZ: cz - d / 2, maxZ: cz + d / 2, topY: cy + h / 2 });
  }
  cores = [];
  if (levelDef.oracle) {
    const op = levelDef.oracle === 'carry' ? [levelDef.start.pos[0] + 0.9, levelDef.start.pos[1] + 0.4, levelDef.start.pos[2] - 0.9] : levelDef.oracle;
    const mesh = new THREE.Group();
    const bodyM = new THREE.Mesh(new THREE.SphereGeometry(0.32, 20, 16),
      new THREE.MeshStandardMaterial({ color: 0xd8dde2, roughness: 0.4, metalness: 0.3 }));
    mesh.add(bodyM);
    const eyeM = new THREE.Mesh(new THREE.SphereGeometry(0.12, 14, 10),
      new THREE.MeshStandardMaterial({ color: 0x101418, emissive: 0x33cc88, emissiveIntensity: 1.8 }));
    eyeM.position.set(0, 0.04, 0.26); mesh.add(eyeM);
    for (const s of [-1, 1]) {
      const handle = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.3, 0.14), M.metal);
      handle.position.set(s * 0.34, 0, 0); mesh.add(handle);
    }
    const core = { mesh, pos: new THREE.Vector3(...op), vel: new THREE.Vector3(), carried: false, half: 0.31, socketed: false, saidPickup: false, isCore: true };
    mesh.userData.cube = core;
    mesh.position.copy(core.pos); world.add(mesh);
    cores.push(core);
  }
  turrets = [];
  for (const t of (levelDef.turrets || [])) {
    const grp = new THREE.Group();
    const body = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.9, 12), M.turret);
    body.position.y = 0.75; body.rotation.x = Math.PI; grp.add(body);
    const eyeM = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8),
      new THREE.MeshStandardMaterial({ color: 0x220000, emissive: 0xff2222, emissiveIntensity: 0.4 }));
    eyeM.position.set(0, 0.78, 0.3); grp.add(eyeM);
    for (const a of [-0.5, 0.5]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.8, 6), M.metal);
      leg.position.set(a * 0.4, 0.35, -0.1); leg.rotation.z = a; grp.add(leg);
    }
    const laser = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 1, 6),
      new THREE.MeshBasicMaterial({ color: 0xff2a22, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false }));
    laser.rotation.x = Math.PI / 2; laser.position.set(0, 0.78, 0.8); grp.add(laser);
    grp.position.set(t.x, t.y, t.z); grp.rotation.y = t.yaw || 0;
    world.add(grp);
    turrets.push({ pos: new THREE.Vector3(t.x, t.y + 0.78, t.z), yaw: t.yaw || 0, grp, eye: eyeM, laser, lockT: 0, cool: 0 });
  }
  interactDef = levelDef.interact || null; finaleActive = false; firedSteps = new Set(); appearMeshes = []; appearLights = [];
  seaMeshes = [];
  if (levelDef.sea) {
    const sm = new THREE.Mesh(new THREE.BoxGeometry(levelDef.sea[3], 0.12, levelDef.sea[4]), M.sea);
    sm.position.set(levelDef.sea[0], levelDef.sea[1], levelDef.sea[2]); world.add(sm); seaMeshes.push(sm);
  }
  const hintElR = document.getElementById('hint'); if (hintElR) hintElR.style.display = 'none';
  movers = [];
  for (const mv of (levelDef.movers || [])) {
    const b = mv.box;
    const box = addBox(b[0], b[1], b[2], b[3], b[4], b[5], M[b[6]], b[7] || {});
    movers.push({ box, base: new THREE.Vector3(b[0], b[1], b[2]), to: new THREE.Vector3(...(mv.to || [0, 0, 0])),
      period: mv.period || 6, phase: mv.phase || 0, prev: new THREE.Vector3(b[0], b[1], b[2]) });
  }
  for (const L of levelLights) scene.remove(L);
  levelLights = [];
  for (const l of (levelDef.lights || [])) {
    const pl = new THREE.PointLight(l[3] || 0xffc27a, (l[4] != null ? l[4] : 1.2) * 18, l[5] || 18); // r160 physical units: candela
    pl.position.set(l[0], l[1], l[2]); scene.add(pl); levelLights.push(pl);
    if (l[6]) { pl.visible = false; appearLights.push(pl); }
  }
  for (const dc of (levelDef.deco || [])) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(dc.sphere[3], 24, 18), M[dc.sphere[4]] || M.saltWhite);
    m.position.set(dc.sphere[0], dc.sphere[1], dc.sphere[2]); world.add(m);
    if (dc.appear) { m.visible = false; appearMeshes.push(m); }
  }
  luckyCatAnim = null;
  if (levelDef.luckyCat) {
    const lc = buildLuckyCat();
    luckyCatAnim = lc;
    lc.position.set(levelDef.luckyCat.pos[0], levelDef.luckyCat.pos[1], levelDef.luckyCat.pos[2]);
    lc.rotation.y = levelDef.luckyCat.rotY || 0;
    world.add(lc);
  }
  posterMeshes = [];
  for (const po of (levelDef.posters || [])) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(po.w || 3, po.h || 2),
      new THREE.MeshBasicMaterial({ map: getTex(po.img) }));
    m.position.set(po.pos[0], po.pos[1], po.pos[2]); m.rotation.y = po.rotY || 0; world.add(m);
    if (po.vanish) m.userData.vanish = true;
    if (po.appear) { m.visible = false; m.userData.appear = true; }
    posterMeshes.push(m);
  }
  setAmbience(levelDef.audio || 'modern');
  socketDef = levelDef.socket || null;
  if (socketDef) {
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.45, 0.5, 10), M.olive);
    ped.position.set(socketDef.x, socketDef.y + 0.25, socketDef.z); world.add(ped);
    const ringM = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.045, 8, 24),
      new THREE.MeshStandardMaterial({ color: 0x8a6a2a, emissive: 0x442200, emissiveIntensity: 0.6 }));
    ringM.rotation.x = Math.PI / 2; ringM.position.set(socketDef.x, socketDef.y + 0.55, socketDef.z); world.add(ringM);
  }
  world.updateMatrixWorld(true); // frame-1 raycasts (lasers/bridges) need real matrices
  player.pos.set(...levelDef.start.pos); player.vel.set(0, 0, 0);
  player.yaw = levelDef.start.yaw || 0; player.pitch = levelDef.start.pitch || 0;
  if (levelDef.pitLight) pitLight.position.set(...levelDef.pitLight);
  sayQueue.length = 0; subTimer = 0; subEl.style.display = 'none';
  for (const l of (levelDef.intro || [])) say(l[0], l[1], l[2]);
  if (levelDef.actCard) showActCard(levelDef.actCard);
  titleEl.textContent = levelDef.title;
  winEl.style.display = 'none';
  if (!DEBUG) { try { localStorage.setItem('p3level', String(idx)); } catch (e) {} }
}

function stepPhysics(sdt) {
  const prevP = player.pos.clone();
  player.vel.y -= GRAV * sdt;
  if (player.vel.y < -50) player.vel.y = -50;
  player.pos.addScaledVector(player.vel, sdt);
  const impactVy = player.vel.y;
  player.onGround = collideAABB(player.pos, player.vel, player.half);
  if (player.onGround && !player._wasGround && impactVy < -7) sfxThud();
  player._wasGround = player.onGround;
  const tpedA = tryTeleport(pBlue, pOrange, player.pos, prevP, player.vel, player);
  const tpedB = !tpedA && tryTeleport(pOrange, pBlue, player.pos, prevP, player.vel, player);
  const tped = tpedA || tpedB;
  if (tped) tpFlash(tpedA ? '#ff9a3c' : '#3ca9ff'); // flash the EXIT portal's color
  if (tped) { sfxTeleport(); (window.__tplog = window.__tplog || []).push({ f: frames,
    pos: player.pos.toArray().map(v=>+v.toFixed(2)), vel: player.vel.toArray().map(v=>+v.toFixed(2)) }); }
  if (player.pos.y < -40) { if (window.__traceTp) window.__traceTp.push({ f: frames, reset: true, y: +player.pos.y.toFixed(2) }); player.pos.set(...levelDef.start.pos); player.vel.set(0, 0, 0); }

  for (const cube of cubes.concat(cores)) {
    if (cube.carried) {
      const target = new THREE.Vector3(0, 0, -1.6).applyQuaternion(camera.quaternion).add(camera.position);
      target.y -= 0.35;
      cube.pos.lerp(target, 1 - Math.exp(-14 * sdt));
      cube.vel.set(0, 0, 0);
    } else {
      const prevC = cube.pos.clone();
      cube.vel.y -= GRAV * sdt;
      cube.pos.addScaledVector(cube.vel, sdt);
      collideAABB(cube.pos, cube.vel, new THREE.Vector3(cube.half, cube.half, cube.half));
      tryTeleport(pBlue, pOrange, cube.pos, prevC, cube.vel, null) ||
      tryTeleport(pOrange, pBlue, cube.pos, prevC, cube.vel, null);
    }
    cube.mesh.position.copy(cube.pos);
  }
}

function inBox(b, p) { return p.x >= b[0] && p.y >= b[1] && p.z >= b[2] && p.x <= b[3] && p.y <= b[4] && p.z <= b[5]; }

function updateLevel(dt) {
  for (const b of buttons) {
    const was = b.pressed;
    b.pressed = cubes.concat(cores).some(c => !c.carried && !c.defective && Math.abs(c.pos.x - b.x) < 0.75 && Math.abs(c.pos.z - b.z) < 0.75 &&
                                Math.abs(c.pos.y - (b.y + 0.31)) < 0.35) ||
                (player.onGround && Math.abs(player.pos.x - b.x) < 0.75 && Math.abs(player.pos.z - b.z) < 0.75 &&
                 Math.abs((player.pos.y - player.half.y) - b.y) < 0.4);
    if (b.pressed !== was) {
      sfxClick();
      b.top.material.color.set(b.pressed ? 0x22cc44 : 0xaa2222);
      b.top.material.emissive.set(b.pressed ? 0x004411 : 0x330000);
      b.top.position.y = b.y + (b.pressed ? 0.16 : 0.22);
    }
  }
  for (const id in doors) {
    const d = doors[id];
    const wantOpen = d.link ? d.link.pressed
      : player.pos.distanceTo(d.mesh.position) < 4.2;
    if (wantOpen !== d._sndW) { d._sndW = wantOpen; if (wantOpen) sfxDoor(); }
    d.amt = Math.max(0, Math.min(1, d.amt + (wantOpen ? dt * 1.8 : -dt * 1.8)));
    d.mesh.position.y = d.baseY + d.amt * 2.5;
    d.box.disabled = d.amt > 0.4;
  }
  for (const l of lasers) {
    const tr = tracePath(l.pos, l.dir, 40);
    for (let i = 0; i < l.beams.length; i++) {
      if (i < tr.segs.length) segBeam(l.beams[i], tr.segs[i].a, tr.segs[i].b, 0.025);
      else l.beams[i].visible = false;
    }
    for (const r of receivers) {
      if (r.pressed) continue;
      for (const sg of tr.segs) {
        const ab = _tv.copy(sg.b).sub(sg.a);
        const t = Math.max(0, Math.min(1, _pl.copy(r.pos).sub(sg.a).dot(ab) / Math.max(1e-6, ab.lengthSq())));
        if (_pl.copy(sg.a).addScaledVector(ab, t).distanceTo(r.pos) < 0.45) {
          (window.__pressLog = window.__pressLog || []).push({ f: frames, a: sg.a.toArray().map(v=>+v.toFixed(2)), b: sg.b.toArray().map(v=>+v.toFixed(2)) });
          r.pressed = true; r.dome.material.color.set(0x22cc44); r.dome.material.emissive.set(0x115522); sfxChime();
          break;
        }
      }
    }
  }
  for (const br of bridges) {
    _pl.copy(br.pos); _pl.y -= 0.12; const tr = tracePath(_pl, br.dir, br.maxLen, 1);
    for (let i = 0; i < br.segs.length; i++) {
      const sg = br.segs[i];
      if (i >= tr.segs.length) { sg.mesh.visible = false; sg.col.disabled = true; for (const rm of sg.rails) rm.visible = false; continue; }
      const a = tr.segs[i].a, b = tr.segs[i].b;
      const len = a.distanceTo(b);
      if (len < 0.4) { sg.mesh.visible = false; sg.col.disabled = true; for (const rm of sg.rails) rm.visible = false; continue; }
      // deck: 1.3 wide, 0.25 thick, top at br.pos.y
      const lo = new THREE.Vector3(Math.min(a.x, b.x), 0, Math.min(a.z, b.z));
      const hi = new THREE.Vector3(Math.max(a.x, b.x), 0, Math.max(a.z, b.z));
      const W = 1.3, H = 0.25, topY = br.pos.y;
      sg.col.min.set(lo.x - (Math.abs(br.dir.x) > 0.5 ? 0 : W/2), topY - H, lo.z - (Math.abs(br.dir.z) > 0.5 ? 0 : W/2));
      sg.col.max.set(hi.x + (Math.abs(br.dir.x) > 0.5 ? 0 : W/2), topY, hi.z + (Math.abs(br.dir.z) > 0.5 ? 0 : W/2));
      // portal-bounced segment may travel a different axis than the emitter dir
      const segDir = _tv.copy(b).sub(a).normalize();
      if (Math.abs(segDir.x) > 0.5) { sg.col.min.z = lo.z - W/2; sg.col.max.z = hi.z + W/2; sg.col.min.x = lo.x; sg.col.max.x = hi.x; }
      sg.col.disabled = false;
      sg.mesh.visible = true;
      sg.mesh.position.set((sg.col.min.x + sg.col.max.x)/2, (sg.col.min.y + sg.col.max.y)/2, (sg.col.min.z + sg.col.max.z)/2);
      sg.mesh.scale.set(sg.col.max.x - sg.col.min.x, sg.col.max.y - sg.col.min.y, sg.col.max.z - sg.col.min.z);
      { // glowing edge rails so the deck reads edge-on from below
        const alongX = Math.abs(segDir.x) > 0.5;
        const len = alongX ? sg.col.max.x - sg.col.min.x : sg.col.max.z - sg.col.min.z;
        const cy = (sg.col.min.y + sg.col.max.y)/2;
        for (let r = 0; r < 2; r++) {
          const rm = sg.rails[r], sgn = r ? 1 : -1;
          rm.visible = true;
          if (alongX) { rm.position.set(sg.mesh.position.x, cy, sg.mesh.position.z + sgn * 0.62); rm.scale.set(len, 0.1, 0.08); }
          else { rm.position.set(sg.mesh.position.x + sgn * 0.62, cy, sg.mesh.position.z); rm.scale.set(0.08, 0.1, len); }
        }
      }
    }
  }
  for (const t of triggers) {
    if (!t.fired && inBox(t.box, player.pos)) {
      t.fired = true;
      for (const l of t.say) say(l[0], l[1], l[2]);
      if (t.fx === 'flicker') flickerT = 2.4;
      if (t.fx === 'beachoff') {
        flickerT = 2.4;
        if (t.env) applyEnv(t.env);
        for (const c of colliders) if (c.vanish) { c.disabled = true; if (c.mesh) c.mesh.visible = false; }
        for (const c of colliders) if (c.appear) { c.disabled = false; if (c.mesh) c.mesh.visible = true; }
        for (const m of appearMeshes) m.visible = true;
        for (const L of appearLights) L.visible = true;
        for (const m of posterMeshes) { if (m.userData.vanish) m.visible = false; if (m.userData.appear) m.visible = true; }
        if (t.audio) setAmbience(t.audio);
        for (const sm of seaMeshes) sm.visible = false;
        for (const p of [pBlue, pOrange]) { p.active = false; p.obj.visible = false; p.box = null; }
      }
    }
  }
  rescueCooldown -= dt;
  if (levelDef.rescueY && player.pos.y < levelDef.rescueY && player.onGround && !transitioning) {
    rescueT += dt;
    if (rescueT > 1.2 && rescueCooldown <= 0) {
      rescueCooldown = 9; rescueT = 0;
      world.updateMatrixWorld(true); // frame-1 raycasts (lasers/bridges) need real matrices
  player.pos.set(...levelDef.start.pos); player.vel.set(0, 0, 0);
      for (const l of (levelDef.rescue || [])) say(l[0], l[1], l[2]);
    }
  } else rescueT = 0;
  // turrets: track, lock, fire (hit resets the player to chamber start)
  for (const t of turrets) {
    if (t.cool > 0) t.cool -= dt;
    const head = t.pos, chest = _tv2.set(player.pos.x, player.pos.y + 0.3, player.pos.z);
    const toP = _tv3.copy(chest).sub(head);
    const dist = toP.length();
    let sees = dist < 14;
    if (sees) {
      const ang = Math.atan2(toP.x, toP.z); // turret eye is on +z: yaw 0 faces +z
      let dyaw = Math.abs(((ang - t.yaw + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
      if (dyaw > 1.1) sees = false;
    }
    if (sees) {
      ray.set(head, toP.normalize()); ray.far = dist;
      const meshes = colliders.filter(c => !c.disabled && c.mesh).map(c => c.mesh);
      const hits = ray.intersectObjects(meshes, false);
      if (hits.length && hits[0].distance < dist - 0.5) sees = false;
    }
    // track the player inside the facing cone; sweep the laser sight
    if (dist < 14) {
      const ang = Math.atan2(toP.x, toP.z);
      const dyaw = ((ang - t.yaw + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
      if (Math.abs(dyaw) < 1.2) {
        const step = Math.max(-2.2 * dt, Math.min(2.2 * dt, dyaw));
        t.yaw += step; t.grp.rotation.y = t.yaw;
      }
    }
    {
      ray.set(head, _tv3.set(Math.sin(t.yaw), 0, Math.cos(t.yaw))); ray.far = 14;
      const meshes = colliders.filter(c => !c.disabled && c.mesh).map(c => c.mesh);
      const hits = ray.intersectObjects(meshes, false);
      const len = hits.length ? hits[0].distance : 14;
      t.laser.scale.set(1, Math.max(0.2, len - 0.5), 1);
      t.laser.position.z = 0.3 + Math.max(0.2, len - 0.5) / 2;
      t.laser.material.opacity = 0.22 + Math.min(1, t.lockT / 1.3) * 0.45;
    }
    if (sees && !gameDone && !transitioning) { if (t.lockT === 0) sfxLock(); t.lockT += dt; } else t.lockT = Math.max(0, t.lockT - dt * 2);
    t.eye.material.emissiveIntensity = 0.4 + Math.min(1, t.lockT / 1.3) * 2.2;
    if (t.lockT > 1.3 && t.cool <= 0) {
      t.cool = 1.6; t.lockT = 0; sfxZap(); tpFlash('#ff3b30');
      player.pos.set(...levelDef.start.pos); player.vel.set(0, 0, 0);
      if (!turretHitT || turretHitT <= 0) { for (const l of (levelDef.turretHit || [])) say(...l); turretHitT = 6; }
    }
  }
  if (turretHitT > 0) turretHitT -= dt;
  // era-shift movers: oscillate, update collider, carry the player when standing on top
  for (const mv of movers) {
    const k = 0.5 - 0.5 * Math.cos((clock.elapsedTime / mv.period + mv.phase) * Math.PI * 2);
    const p = _tv2.copy(mv.base).addScaledVector(mv.to, k);
    const dx = p.x - mv.prev.x, dy = p.y - mv.prev.y, dz = p.z - mv.prev.z;
    if (dx || dy || dz) {
      mv.box.mesh.position.set(p.x, p.y, p.z);
      mv.box.mesh.updateMatrixWorld(true);
      const hw = mv.box.max.x - mv.box.min.x, hh = mv.box.max.y - mv.box.min.y, hd = mv.box.max.z - mv.box.min.z;
      mv.box.min.set(p.x - hw / 2, p.y - hh / 2, p.z - hd / 2);
      mv.box.max.set(p.x + hw / 2, p.y + hh / 2, p.z + hd / 2);
      const feet = player.pos.y - player.half.y;
      if (player.onGround &&
          player.pos.x > mv.box.min.x - 0.2 && player.pos.x < mv.box.max.x + 0.2 &&
          player.pos.z > mv.box.min.z - 0.2 && player.pos.z < mv.box.max.z + 0.2 &&
          Math.abs(feet - (p.y + hh / 2 - dy)) < 0.35) {
        player.pos.x += dx; player.pos.y += dy; player.pos.z += dz;
      }
    }
    mv.prev.copy(p);
  }
  // gels: repel bounces, propel accelerates along dir
  const feetY = player.pos.y - player.half.y;
  for (const gl of gels) {
    if (player.pos.x < gl.minX - 0.1 || player.pos.x > gl.maxX + 0.1) continue;
    if (player.pos.z < gl.minZ - 0.1 || player.pos.z > gl.maxZ + 0.1) continue;
    if (Math.abs(feetY - gl.topY) > 0.45) continue;
    if (gl.type === 'repel') {
      if (player.vel.y <= 0.5) { sfxBounce(); player.vel.y = Math.max(14, -player.vel.y * 0.95); }
    } else if (gl.dir) {
      const d = new THREE.Vector3(...gl.dir).normalize();
      const sp = 17;
      if (player.gelBoostT <= 0) sfxGel();
      player.gelBoostT = 0.15; // suppress ground drag while gelled (drag 8/s would cap gel at ~7 m/s)
      player.vel.x += (d.x * sp - player.vel.x) * Math.min(1, 6 * dt);
      player.vel.z += (d.z * sp - player.vel.z) * Math.min(1, 6 * dt);
    }
  }
  // analog socket: an uncarried core near it snaps in and holds its door open
  if (socketDef) {
    for (const core of cores) {
      if (core.socketed || core.carried) continue;
      if (Math.hypot(core.pos.x - socketDef.x, core.pos.z - socketDef.z) < 1.0 && Math.abs(core.pos.y - (socketDef.y + 0.85)) < 0.7) {
        core.socketed = true; core.pos.set(socketDef.x, socketDef.y + 0.85, socketDef.z); core.vel.set(0, 0, 0);
        core.mesh.position.copy(core.pos);
        if (socketDef.opens && doors[socketDef.opens]) doors[socketDef.opens].link = { pressed: true };
        for (const l of (levelDef.oracleLines && levelDef.oracleLines.socketed) || []) say(...l);
      }
    }
  }
  if (interactDef && !finaleActive && !gameDone) {
    const near = Math.hypot(player.pos.x - interactDef.pos[0], player.pos.z - interactDef.pos[2]) < (interactDef.radius || 1.8) &&
      Math.abs(player.pos.y - interactDef.pos[1]) < 2.2;
    const hintEl = document.getElementById('hint');
    if (hintEl) { hintEl.style.display = near ? 'block' : 'none'; if (near) hintEl.textContent = interactDef.prompt || 'E'; }
  }
  if (finaleActive) {
    const ft = clock.elapsedTime - finaleT0;
    for (let i = 0; i < interactDef.steps.length; i++) {
      const st = interactDef.steps[i];
      if (firedSteps.has(i) || ft < st.t) continue;
      firedSteps.add(i);
      if (st.say) for (const l of st.say) say(l[0], l[1], l[2]);
      if (st.env) applyEnv(st.env);
      if (st.fx === 'flicker') flickerT = 2.4;
      if (st.teleport) { player.pos.set(...st.teleport); player.vel.set(0, 0, 0); if (st.yaw != null) { player.yaw = st.yaw; player.pitch = 0; } }
      if (st.card) {
        winH2.textContent = st.card[0]; winLine.textContent = st.card[1] || '';
        winEl.style.backgroundImage = st.card[2] ? 'url(' + st.card[2] + ')' : '';
        winEl.style.display = 'flex';
        if (document.pointerLockElement) document.exitPointerLock();
        sfxSting();
      }
      if (st.audio) setAmbience(st.audio);
      if (st.done) gameDone = true;
    }
  }
  if (!transitioning && !gameDone && exitDef && inBox(exitDef.box, player.pos)) {
    const needDoor = exitDef.door || (levelDef.doors && levelDef.doors[0] && levelDef.doors[0].id);
    if (!needDoor || (doors[needDoor] && doors[needDoor].amt > 0.8)) {
      transitioning = true;
      for (const l of (levelDef.win || [])) say(l[0], l[1], l[2]);
      if (typeof exitDef.next === 'string') {
        gameDone = true;
        winH2.textContent = exitDef.endTitle || 'ACT COMPLETE';
        winLine.textContent = exitDef.endLine || '';
        winEl.style.backgroundImage = '';
        winEl.style.display = 'flex'; sfxChime();
        if (document.pointerLockElement) document.exitPointerLock();
      } else {
        const t = (performance.now() - levelT0) / 1000;
        const par = PAR[levelDef.id] || 90;
        let best = Infinity;
        try {
          best = +(localStorage.getItem('p3best_' + levelDef.id) || Infinity);
          if (t < best) { best = t; localStorage.setItem('p3best_' + levelDef.id, String(Math.round(t))); }
        } catch (e) {}
        winH2.textContent = 'TEST CHAMBER COMPLETE';
        winLine.innerHTML = levelDef.title + '<br><span class="wintime">time ' + fmtT(t) + ' \u00B7 par ' + fmtT(par) + ' \u00B7 best ' + fmtT(best) + '</span>';
        winEl.style.display = 'flex';
        sfxChime();
        if (t <= par) say('GLaDOS', t < par * 0.7 ? 'Under par. I have updated the par. There was no par.' : 'Par time achieved. The Enrichment Center is legally required to be impressed.', 4);
        else if (t > par * 2) say('GLaDOS', 'The par time was ' + fmtT(par) + '. You took ' + fmtT(t) + '. I am not angry. I am just taking notes.', 4.5);
        setTimeout(() => loadLevel(exitDef.next), 3200);
      }
    }
  }
}

// ---------- debug ----------
const simLog = [];
function debugSetup() {
  if (levelIdx !== 0) return; // presets assume ch01 geometry
  if (SHOT === '1') {
    placePortal(pOrange, new THREE.Vector3(0, -11.97, -3), new THREE.Vector3(0, 1, 0));
    placePortal(pBlue, new THREE.Vector3(0, 7, 7.97), new THREE.Vector3(0, 0, -1));
    player.pos.set(0, 1.4, 7.0); player.yaw = 0; player.pitch = -0.25;
  } else if (SHOT === '2') {
    placePortal(pOrange, new THREE.Vector3(0, -11.97, -3), new THREE.Vector3(0, 1, 0));
    placePortal(pBlue, new THREE.Vector3(0, 2.2, 7.97), new THREE.Vector3(0, 0, -1));
    player.pos.set(0, 0.9, 4.5); player.yaw = Math.PI; player.pitch = 0.05;
  } else if (SHOT === '5' || SHOT === '6') {
    placePortal(pOrange, new THREE.Vector3(2.2, 2.2, -12.97), new THREE.Vector3(0, 0, 1));
    placePortal(pBlue, new THREE.Vector3(0, 2.0, 7.97), new THREE.Vector3(0, 0, -1));
    player.pos.set(0, 0.9, 5.2); player.yaw = Math.PI; player.pitch = 0.02;
  } else if (SIM === 'fling') {
    placePortal(pOrange, new THREE.Vector3(0, -11.97, -3), new THREE.Vector3(0, 1, 0));
    placePortal(pBlue, new THREE.Vector3(0, 7, 7.97), new THREE.Vector3(0, 0, -1));
    player.pos.set(0, 0.9, -3); player.vel.set(0, 0, 0);
  }
}

// ---------- dust motes (atmosphere; scene-persistent, follows player) ----------
const MOTE_N = 260;
const moteGeo = new THREE.BufferGeometry();
const motePos = new Float32Array(MOTE_N * 3);
const moteVel = new Float32Array(MOTE_N * 3);
for (let i = 0; i < MOTE_N; i++) {
  motePos[i*3]   = (Math.random() - 0.5) * 30;
  motePos[i*3+1] = Math.random() * 12 - 5;
  motePos[i*3+2] = (Math.random() - 0.5) * 30;
  moteVel[i*3]   = (Math.random() - 0.5) * 0.08;
  moteVel[i*3+1] = -(0.04 + Math.random() * 0.12);
  moteVel[i*3+2] = (Math.random() - 0.5) * 0.08;
}
moteGeo.setAttribute('position', new THREE.BufferAttribute(motePos, 3));
const motes = new THREE.Points(moteGeo, new THREE.PointsMaterial({
  color: 0xd8cfc0, size: 0.035, transparent: true, opacity: 0.5,
  blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
}));
motes.frustumCulled = false;
scene.add(motes);
let luckyCatAnim = null;
function updateMotes(dt) {
  const px = player.pos.x, py = player.pos.y, pz = player.pos.z;
  for (let i = 0; i < MOTE_N; i++) {
    let x = motePos[i*3] + moteVel[i*3] * dt, y = motePos[i*3+1] + moteVel[i*3+1] * dt, z = motePos[i*3+2] + moteVel[i*3+2] * dt;
    // wrap into a 30x12x30 box around the player
    if (x < px - 15) x += 30; else if (x > px + 15) x -= 30;
    if (z < pz - 15) z += 30; else if (z > pz + 15) z -= 30;
    if (y < py - 5) y += 12; else if (y > py + 7) y -= 12;
    motePos[i*3] = x; motePos[i*3+1] = y; motePos[i*3+2] = z;
  }
  moteGeo.attributes.position.needsUpdate = true;
}

// ---------- main loop ----------
const clock = new THREE.Clock();
const _dir = new THREE.Vector3(), _right = new THREE.Vector3(), _tv2 = new THREE.Vector3(), _tv3 = new THREE.Vector3(), _v2zero = new THREE.Vector2(0, 0);
let turretHitT = 0;
let frames = 0;
function tick() {
  requestAnimationFrame(tick);
  const dt = Math.min(clock.getDelta(), 0.05);
  frames++;

  if (locked && !transitioning && !gameDone) {
    const f = (keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0);
    const s = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0);
    _dir.set(-Math.sin(player.yaw), 0, -Math.cos(player.yaw));
    _right.set(-_dir.z, 0, _dir.x);
    const acc = player.onGround ? 40 : 8;
    player.vel.addScaledVector(_dir, f * acc * dt);
    player.vel.addScaledVector(_right, s * acc * dt);
    if (player.gelBoostT > 0) player.gelBoostT -= dt;
    const drag = (player.onGround && !(player.gelBoostT > 0)) ? Math.exp(-8 * dt) : Math.exp(-0.4 * dt);
    player.vel.x *= drag; player.vel.z *= drag;
    if (keys.Space && player.onGround) { player.vel.y = 7.2; tone(240, 320, 'sine', 0.12, 0.05); }
    const spXZ = Math.hypot(player.vel.x, player.vel.z);
    if (player.onGround && spXZ > 2) {
      player._stepT = (player._stepT || 0) - dt * spXZ;
      if (player._stepT <= 0) { player._stepT = 2.4; nz(0.05, 0.045, 'lowpass', 480); }
    }
  }

  const paused = started && !locked && !DEBUG && !gameDone;
  if (!paused) {
  const psteps = Math.max(1, Math.ceil(dt / 0.0167));
  const sdt = dt / psteps;
  for (let i = 0; i < psteps; i++) stepPhysics(sdt);

  if (flickerT > 0) {
    flickerT -= dt;
    hemi.intensity = 1.15 * (flickerT > 0 ? (0.45 + 0.55 * Math.random()) : 1);
    sun.intensity = 1.2 * (flickerT > 0 ? (0.4 + 0.6 * Math.random()) : 1);
  }

  updateLevel(dt);
  if (bettyBot) {
    bettyBot.position.y = bettyBot.userData.baseY + Math.sin(clock.elapsedTime * 1.7) * 0.09;
    bettyBot.rotation.y = Math.atan2(player.pos.x - bettyBot.position.x, player.pos.z - bettyBot.position.z);
  }

  } // end !paused
  camera.position.set(player.pos.x, player.pos.y + (player.eye - player.half.y), player.pos.z);
  camera.quaternion.setFromEuler(new THREE.Euler(player.pitch, player.yaw, 0, 'YXZ'));
  const targetFov = 75 + Math.min(22, player.vel.length() * 0.55); // fling speed kick
  camera.fov += (targetFov - camera.fov) * Math.min(1, 5 * dt);
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();
  const sp = player.vel.length();
  speedvigEl.style.opacity = Math.max(0, Math.min(0.55, (sp - 6.5) * 0.055)).toFixed(3);
  if (tpFlashT > 0) { tpFlashT = Math.max(0, tpFlashT - dt * 2.4); }
  tpflashEl.style.opacity = tpFlashT.toFixed(3);
  vmUpdate(dt);

  if (pBlue.active && pOrange.active) {
    renderPortalView(pBlue, pOrange);
    renderPortalView(pOrange, pBlue);
  }

  if (!paused) updateSubs(dt);
  // crosshair: brighten + ring when the center shot would hold a portal
  if ((frames & 3) === 0) {
    ray.setFromCamera(_v2zero, camera); ray.far = 60;
    const hits = ray.intersectObjects(portalables, false);
    const ok = !!(hits.length && hits[0].distance < 60 && fitPortalOnFace(hits[0].point, hits[0].face.normal.clone().transformDirection(hits[0].object.matrixWorld)));
    const xh = document.getElementById('cross');
    if (xh) xh.className = ok ? 'ok' : '';
  }
  document.getElementById('pb').className = 'pdot' + (pBlue.active ? ' blue' : '');
  document.getElementById('po').className = 'pdot' + (pOrange.active ? ' orange' : '');
  if (window.__virtOn) {
    portalMatrix(pBlue, pOrange, camera.matrixWorld, _vm);
    virtCam.matrixWorld.copy(_vm); virtCam.matrixWorldInverse.copy(_vm).invert();
    virtCam.fov = camera.fov; virtCam.aspect = camera.aspect; virtCam.updateProjectionMatrix();
    oblique(virtCam, pOrange);
    pBlue.surf.visible = false;
    renderer.render(scene, virtCam);
    pBlue.surf.visible = true;
  } else if (window.__rtSticky && window.__rtQuad) {
    renderer.render(window.__rtQuad.parent, new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1));
  updateMotes(dt);
  if (luckyCatAnim) luckyCatAnim.userData.pawPivot.rotation.z = 0.55 + Math.sin(performance.now() * 0.0042) * 0.42;
  } else { renderer.render(scene, camera); if (vmGun.visible) { const _ac = renderer.autoClear; renderer.autoClear = false; renderer.clearDepth(); renderer.render(vmScene, camera); renderer.autoClear = _ac; } }
  if (frames === 5) window.__p3ready = true;
}

// ---------- debug hooks ----------
window.__rt2screen = () => {
  const qscene = new THREE.Scene();
  const qcam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2),
    new THREE.MeshBasicMaterial({ map: pBlue.rt.texture }));
  qscene.add(quad);
  window.__rtQuad = quad;
  renderer.setRenderTarget(null);
  renderer.render(qscene, qcam);
};
window.__rtSticky = false;
window.__probePortal = () => {
  renderPortalView(pBlue, pOrange);
  const buf = new Uint8Array(4 * 4);
  renderer.readRenderTargetPixels(pBlue.rt, Math.floor(pBlue.rt.width/2), Math.floor(pBlue.rt.height/2), 2, 2, buf);
  return { centerPixel: Array.from(buf.slice(0,4)),
    bluePos: pBlue.obj.position.toArray(), orangePos: pOrange.obj.position.toArray() };
};
window.__setKey = (code, down) => { keys[code] = down; };
window.__setcam = (x, y, z, yaw, pitch) => { player.pos.set(x, y, z); player.vel.set(0,0,0); player.yaw = yaw; player.pitch = pitch; };
window.__teleport = (x, y, z) => { player.pos.set(x, y, z); player.vel.set(0, 0, 0); };
window.__setvel = (x, y, z) => { player.vel.set(x, y, z); };
window.__pressButton = (i = 0) => { // QA: drop cube 0 onto button i
  if (!cubes.length || !buttons[i]) return false;
  cubes[i < cubes.length ? i : 0].pos.set(buttons[i].x, buttons[i].y + 0.45, buttons[i].z);
  cubes[i < cubes.length ? i : 0].vel.set(0, 0, 0);
  return true;
};
window.__placePortal = (which, x, y, z, nx, ny, nz) =>
  placePortal(which === 'blue' ? pBlue : pOrange, new THREE.Vector3(x, y, z), new THREE.Vector3(nx, ny, nz));
window.__level = () => levelIdx;
window.__sayq = () => ({ fired: triggers.map(t => t.fired), cur: subEl.textContent, q: sayQueue.map(s => s[0] + ': ' + s[1].slice(0, 30)) });
window.__p3state = () => ({ f: frames, level: levelIdx, pos: player.pos.toArray().map(v=>+v.toFixed(2)),
  vel: player.vel.toArray().map(v=>+v.toFixed(2)), speed: +player.vel.length().toFixed(1),
  ground: player.onGround, blue: pBlue.active, orange: pOrange.active,
  cubes: cubes.map(c => c.pos.toArray().map(v=>+v.toFixed(2))),
  buttons: buttons.map(b => b.pressed),
  doors: Object.fromEntries(Object.entries(doors).map(([k, d]) => [k, +d.amt.toFixed(2)])),
  transitioning, gameDone,
  tpLog: (window.__tplog||[]).slice(-6) });

window.__doorDebug = () => Object.fromEntries(Object.entries(doors).map(([k, d]) => [k, { amt: +d.amt.toFixed(2), link: d.link ? (d.link.dome ? 'recv' : (d.link.top ? 'btn' : 'other')) : 'prox', pressed: d.link ? !!d.link.pressed : null }]));
window.__laserTrace = () => lasers.map(l => tracePath(l.pos, l.dir, 40).segs.map(sg => [sg.a.toArray().map(v=>+v.toFixed(2)), sg.b.toArray().map(v=>+v.toFixed(2))]));
window.__dropCubeAt = (i, x, y, z) => { const c = cubes[i]; if (c) { c.pos.set(x, y, z); c.vel.set(0, 0, 0); c.carried = false; } };
window.__dropCoreAt = (x, y, z) => { const c = cores[0]; if (c) { c.pos.set(x, y, z); c.vel.set(0, 0, 0); c.carried = false; } };
window.__pressE = () => tryInteract();
window.__initAudio = () => initAudio();
window.__audioState = () => ({ ctx: AC ? AC.state : 'none', profile: ambProfile, muted: audioMuted });
window.__moverDebug = () => movers.map(m => m.box.mesh.position.toArray().map(v => +v.toFixed(2)));
window.__worldDebug = (x, z) => colliders.filter(c => !c.disabled &&
  x >= c.min.x - 0.01 && x <= c.max.x + 0.01 && z >= c.min.z - 0.01 && z <= c.max.z + 0.01)
  .map(c => ({ min: c.min.toArray().map(v => +v.toFixed(2)), max: c.max.toArray().map(v => +v.toFixed(2)) }));
window.__coreState = () => cores.map(c => ({ pos: c.pos.toArray().map(v => +v.toFixed(2)), socketed: c.socketed }));

// ---------- boot ----------
let startIdx = 0;
if (Q.get('level') !== null && Q.get('level') !== undefined && Q.has('level')) startIdx = Math.max(0, Math.min(LEVELS.length - 1, +Q.get('level') || 0));
else if (!DEBUG) { try { startIdx = Math.max(0, Math.min(LEVELS.length - 1, parseInt(localStorage.getItem('p3level') || '0') || 0)); } catch (e) {} }
if (!DEBUG && startIdx > 0) {
  const b = document.getElementById('begin');
  if (b) b.innerHTML = 'Click to continue - Chamber 0' + (startIdx + 1) + ' &nbsp;·&nbsp; press R to restart from Chamber 01';
  addEventListener('keydown', e => {
    if (e.code === 'KeyR' && !locked) {
      try { localStorage.removeItem('p3level'); } catch (err) {}
      const bb = document.getElementById('begin');
      if (bb) bb.textContent = 'Click to begin testing.';
      loadLevel(0);
    }
  });
}
loadLevel(startIdx);
if (DEBUG) debugSetup();
tick();
