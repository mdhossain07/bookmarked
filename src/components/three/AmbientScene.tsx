"use client";

import { useEffect, useRef } from "react";
import {
  AmbientLight,
  BufferAttribute,
  BufferGeometry,
  Color,
  DirectionalLight,
  DoubleSide,
  InstancedMesh,
  MeshLambertMaterial,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  PointsMaterial,
  Scene,
  WebGLRenderer,
} from "three";

const PAGE_COUNT = 60;
const DUST_COUNT = 200;
const MAX_TILT = (3 * Math.PI) / 180;
const STILL_TIME = 8; // seconds into the drift, used for the reduced-motion frame
const TOKENS = ["--brass", "--books", "--movies"] as const;

/** Deterministic pseudo-random in [0, 1), so every load draws the same scene. */
const rand = (i: number, salt: number) => {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

function readTokenColors(): Color[] {
  const style = getComputedStyle(document.documentElement);
  return TOKENS.map(
    (token) =>
      new Color(
        `hsl(${style.getPropertyValue(token).trim().replace(/\s+/g, ", ")})`,
      ),
  );
}

/** Builds the scene and returns its cleanup. Throws if WebGL is unavailable. */
function startScene(host: HTMLElement, onReady: () => void): () => void {
  const renderer = new WebGLRenderer({
    antialias: false,
    alpha: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  const canvas = renderer.domElement;
  canvas.style.cssText = "display:block;width:100%;height:100%";
  host.appendChild(canvas);

  const scene = new Scene();
  const camera = new PerspectiveCamera(50, 1, 0.1, 50);
  camera.position.z = 6;
  const sun = new DirectionalLight(0xffffff, 1.4);
  sun.position.set(2, 3, 4);
  scene.add(new AmbientLight(0xffffff, 1.6), sun);

  const pageGeometry = new PlaneGeometry(0.6, 0.85);
  const pageMaterial = new MeshLambertMaterial({
    transparent: true,
    opacity: 0.35,
    side: DoubleSide,
  });
  const pages = new InstancedMesh(pageGeometry, pageMaterial, PAGE_COUNT);
  const seeds = Array.from({ length: PAGE_COUNT }, (_, i) => ({
    x: (rand(i, 1) - 0.5) * 11,
    y: (rand(i, 2) - 0.5) * 7,
    z: (rand(i, 3) - 0.5) * 4,
    phase: rand(i, 4) * Math.PI * 2,
    // angular speed 2π / (20 to 40 s): one full cycle takes at least 20 seconds
    speed: (Math.PI * 2) / (20 + rand(i, 5) * 20),
    scale: 0.35 + rand(i, 6) * 0.4,
  }));

  const dustGeometry = new BufferGeometry();
  const dustPositions = new Float32Array(DUST_COUNT * 3);
  for (let i = 0; i < DUST_COUNT; i++) {
    dustPositions[i * 3] = (rand(i, 7) - 0.5) * 10;
    dustPositions[i * 3 + 1] = (rand(i, 8) - 0.5) * 6;
    dustPositions[i * 3 + 2] = (rand(i, 9) - 0.5) * 5;
  }
  dustGeometry.setAttribute("position", new BufferAttribute(dustPositions, 3));
  const dustMaterial = new PointsMaterial({
    size: 0.035,
    transparent: true,
    opacity: 0.7,
  });
  const dust = new Points(dustGeometry, dustMaterial);
  scene.add(pages, dust);

  const applyColors = () => {
    const colors = readTokenColors();
    seeds.forEach((_, i) => pages.setColorAt(i, colors[i % colors.length]));
    pages.instanceColor!.needsUpdate = true;
    dustMaterial.color.copy(colors[0]);
  };
  applyColors();

  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const pointer = matchMedia("(hover: hover) and (pointer: fine)");
  const dummy = new Object3D();
  const target = { x: 0, y: 0 };
  let onScreen = true;
  let tabShown = document.visibilityState === "visible";
  let spread = 1; // widens the field for wide, short hosts such as the dashboard band
  let frame = 0;
  let disposed = false;

  const draw = (seconds: number) => {
    seeds.forEach((p, i) => {
      const a = p.phase + seconds * p.speed;
      dummy.position.set(
        p.x * spread + Math.sin(a) * 0.4,
        p.y + Math.cos(a * 0.8) * 0.3,
        p.z,
      );
      dummy.rotation.set(a * 0.7, a, a * 0.4);
      dummy.scale.setScalar(p.scale);
      dummy.updateMatrix();
      pages.setMatrixAt(i, dummy.matrix);
    });
    pages.instanceMatrix.needsUpdate = true;
    dust.rotation.y = seconds * 0.02;
    dust.scale.x = spread;
    renderer.render(scene, camera);
  };

  const tick = (now: number) => {
    frame = 0;
    if (disposed) return;
    if (pointer.matches) {
      camera.rotation.y += (-target.x * MAX_TILT - camera.rotation.y) * 0.04;
      camera.rotation.x += (-target.y * MAX_TILT - camera.rotation.x) * 0.04;
    }
    draw(now / 1000);
    schedule();
  };

  // Animate only while visible and motion is allowed; with reduced motion, draw one still frame instead.
  const schedule = () => {
    if (!frame && !motion.matches && onScreen && tabShown)
      frame = requestAnimationFrame(tick);
  };
  const refresh = () => (motion.matches ? draw(STILL_TIME) : schedule());

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = host;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    spread = Math.min(Math.max(1, camera.aspect / 1.6), 2.5);
    camera.position.z = camera.aspect > 1.5 ? 3.2 : 6;
    camera.updateProjectionMatrix();
    if (motion.matches) draw(STILL_TIME);
  };

  const onPointer = (e: PointerEvent) => {
    target.x = (e.clientX / window.innerWidth - 0.5) * 2;
    target.y = (e.clientY / window.innerHeight - 0.5) * 2;
  };
  const onVisibility = () => {
    tabShown = document.visibilityState === "visible";
    refresh();
  };
  const onTheme = () => {
    applyColors();
    if (motion.matches) draw(STILL_TIME);
  };

  const resizeObserver = new ResizeObserver(resize);
  const visibilityObserver = new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    refresh();
  });
  const themeObserver = new MutationObserver(onTheme);
  resizeObserver.observe(host);
  visibilityObserver.observe(host);
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("pointermove", onPointer, { passive: true });
  motion.addEventListener("change", refresh);

  resize();
  refresh();
  onReady();

  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    resizeObserver.disconnect();
    visibilityObserver.disconnect();
    themeObserver.disconnect();
    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("pointermove", onPointer);
    motion.removeEventListener("change", refresh);
    pageGeometry.dispose();
    pageMaterial.dispose();
    pages.dispose();
    dustGeometry.dispose();
    dustMaterial.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    canvas.remove();
  };
}

/** Fills its positioned parent. Decoration only: hidden from assistive tech and ignores the pointer. */
export default function AmbientScene() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    try {
      return startScene(el, () =>
        el.classList.replace("opacity-0", "opacity-100"),
      );
    } catch {
      return undefined; // no WebGL: the gradient behind stays
    }
  }, []);

  return (
    <div
      ref={host}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300"
    />
  );
}
