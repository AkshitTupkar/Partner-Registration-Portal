// Drifting two-tone pigment ("smoke") rendered with a WebGL fbm shader.
// Rebuilt locally: upstream smoke.js was not available from the connector, so
// this implements the same API that Aura.jsx calls:
//   startSmoke(canvas, { tint, tint2, deep, speed, orb, light })
//     → { stop, setSpeed, setTints, setMouse }
// It pauses while off-screen or in a hidden tab, caps pixel ratio for cheap
// devices, and draws a still frame under prefers-reduced-motion.

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
precision mediump float;
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uA;
uniform vec3 uB;
uniform vec3 uBase;
uniform vec2 uMouse;
uniform float uMouseOn;
uniform float uLight;
uniform float uOrb;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 frag = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  float s = max(min(uRes.x, uRes.y), 1.0);
  vec2 p = frag / s * 1.4;
  vec2 m = uMouse / s * 1.4;
  vec2 d = m - p;
  p += d * 0.25 * uMouseOn * exp(-dot(d, d) * 2.0);

  float t = uTime;
  vec2 q = vec2(fbm(p + vec2(0.0, t * 0.9)), fbm(p + vec2(5.2, 1.3) - t * 0.7));
  vec2 r = vec2(fbm(p + 2.2 * q + vec2(1.7, 9.2) + t * 0.5),
                fbm(p + 2.2 * q + vec2(8.3, 2.8) - t * 0.6));
  float fa = smoothstep(0.30, 0.80, fbm(p + 2.0 * r));
  float fb = smoothstep(0.35, 0.85, r.y);

  // Light: vivid wash with white showing through. Dark: vivid pigment in deep glass.
  float ka = mix(0.95, 0.88, uLight);
  float kb = mix(0.85, 0.72, uLight);
  vec3 col = uBase;
  col = mix(col, uA, fa * ka);
  col = mix(col, uB, fb * kb * (1.0 - fa * 0.5));

  if (uOrb > 0.5) {
    vec2 c = gl_FragCoord.xy / uRes - 0.5;
    float rr = length(c) * 2.0;
    col += vec3(1.0) * smoothstep(0.75, 1.0, rr) * 0.12;
    vec2 hl = c - vec2(-0.18, 0.22);
    col += vec3(1.0) * exp(-dot(hl, hl) * 40.0) * 0.25;
  }
  gl_FragColor = vec4(col, 1.0);
}
`;

function hexToVec(hex) {
  let h = String(hex || "#000000").replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16) || 0;
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function compile(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.warn("[atomberg-ui] smoke shader:", gl.getShaderInfoLog(sh));
    return null;
  }
  return sh;
}

/** CSS fallback when WebGL is unavailable: a static blurred two-tone wash. */
function fallback(canvas, s) {
  const css = (v) => `rgb(${v.map((c) => Math.round(c * 255)).join(",")})`;
  const alpha = s.light ? "66" : "cc";
  const toHex = (v) => "#" + v.map((c) => Math.round(c * 255).toString(16).padStart(2, "0")).join("");
  canvas.style.background =
    `radial-gradient(60% 90% at 25% 30%, ${toHex(s.a)}${alpha}, transparent 70%),` +
    `radial-gradient(55% 85% at 75% 70%, ${toHex(s.b)}${alpha}, transparent 70%), ${css(s.base)}`;
}

const NOOP = { stop() {}, setSpeed() {}, setTints() {}, setMouse() {} };

export function startSmoke(canvas, opts = {}) {
  if (!canvas) return NOOP;
  const s = {
    speed: opts.speed ?? 0.1,
    a: hexToVec(opts.tint),
    b: hexToVec(opts.tint2),
    base: hexToVec(opts.deep),
    light: !!opts.light,
    orb: !!opts.orb,
    mx: 0, my: 0, tx: 0, ty: 0, on: 0, ton: 0,
  };

  const gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" });
  const vs = gl && compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = gl && compile(gl, gl.FRAGMENT_SHADER, FRAG);
  if (!gl || !vs || !fs) {
    fallback(canvas, s);
    return NOOP;
  }

  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "aPos");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const u = {};
  for (const name of ["uRes", "uTime", "uA", "uB", "uBase", "uMouse", "uMouseOn", "uLight", "uOrb"]) {
    u[name] = gl.getUniformLocation(prog, name);
  }

  const reduce = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  let dpr = 1;
  let visible = true;
  let dirty = true;
  let time = Math.random() * 50;
  let last = performance.now();
  let raf = 0;

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      if (!s.tx && !s.ty) { s.tx = s.mx = w / 2; s.ty = s.my = h / 2; }
      dirty = true;
    }
  };

  const draw = () => {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(u.uRes, canvas.width, canvas.height);
    gl.uniform1f(u.uTime, time);
    gl.uniform3fv(u.uA, s.a);
    gl.uniform3fv(u.uB, s.b);
    gl.uniform3fv(u.uBase, s.base);
    gl.uniform2f(u.uMouse, s.mx, s.my);
    gl.uniform1f(u.uMouseOn, s.on);
    gl.uniform1f(u.uLight, s.light ? 1 : 0);
    gl.uniform1f(u.uOrb, s.orb ? 1 : 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  const frame = (now) => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    if (!visible || document.hidden) return;
    if (reduce) {
      if (dirty) { draw(); dirty = false; }
      return;
    }
    time += dt * s.speed * 2.5;
    const k = Math.min(1, dt * 6);
    s.mx += (s.tx - s.mx) * k;
    s.my += (s.ty - s.my) * k;
    s.on += (s.ton - s.on) * k;
    draw();
  };

  const ro = typeof ResizeObserver === "function" ? new ResizeObserver(resize) : null;
  ro && ro.observe(canvas);
  const io = typeof IntersectionObserver === "function"
    ? new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; })
    : null;
  io && io.observe(canvas);
  resize();
  raf = requestAnimationFrame(frame);

  return {
    stop() {
      cancelAnimationFrame(raf);
      ro && ro.disconnect();
      io && io.disconnect();
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    },
    setSpeed(v) { s.speed = v; },
    setTints(a, b) { s.a = hexToVec(a); s.b = hexToVec(b); dirty = true; },
    setMouse(x, y, on) { s.tx = x * dpr; s.ty = y * dpr; s.ton = on ? 1 : 0; },
  };
}
