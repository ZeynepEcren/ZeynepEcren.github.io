import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import type { SkyStyle } from '../../themes/themes'

/**
 * Sayfanın tamamının arkasındaki 3B uzay: derin yıldız alanı, yıldız kümeleri, bulutsular ve takımyıldızlar.
 * Sayfa kaydırıldıkça kamera uzayın içinde ilerler, imleçle hafif paralaks yapar.
 * Bu dosya (ve Three.js) React.lazy ile ayrı bir parça olarak yüklenir; azaltılmış harekette sahne durağan kalır.
 */

/** Kaydırma boyunca kameranın ilerlediği mesafe. */
const DEPTH = 3200
const START_Z = 600

interface Props {
  sky: SkyStyle
  /** Telefonlar için daha az yıldız, daha düşük çözünürlük. */
  lite: boolean
  /** Azaltılmış hareket: animasyon ve kaydırmayla ilerleme kapalı. */
  still: boolean
}

interface SceneApi {
  applySky: (sky: SkyStyle) => void
  dispose: () => void
}

const STAR_COLORS = ['#ffffff', '#cfe0ff', '#9fbcff', '#ffe2b0', '#ffd27a'].map((c) => new THREE.Color(c))
function starColor() {
  const r = Math.random()
  return STAR_COLORS[r < 0.5 ? 0 : r < 0.7 ? 1 : r < 0.82 ? 2 : r < 0.94 ? 3 : 4]
}

interface Star {
  x: number
  y: number
  z: number
  c: THREE.Color
  s: number
}

function createScene(canvas: HTMLCanvasElement, { lite, still }: Omit<Props, 'sky'>): SceneApi {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !lite, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, lite ? 1.25 : 2))
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(60, 1, 1, 6000)
  const fog = new THREE.FogExp2(0x03040a, 0.00045)
  scene.fog = fog
  const density = lite ? 0.4 : 1

  // Yuvarlak, yumuşak kenarlı, parıldayan yıldız. Atlas temasında keskin kenarlı mürekkep noktasına dönüşür.
  const starMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    uniforms: { uTime: { value: 0 }, uPx: { value: renderer.getPixelRatio() }, uInk: { value: 0 } },
    vertexShader: /* glsl */ `
      attribute float size; attribute float phase;
      uniform float uTime; uniform float uPx; uniform float uInk;
      varying vec3 vColor; varying float vTw; varying float vSize;
      void main() {
        vColor = color;
        vSize = size;
        vTw = 0.65 + 0.35 * sin(uTime * (0.8 + phase) + phase * 6.283);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        float k = mix(1.0, 0.42, uInk);
        gl_PointSize = max(1.6 * uPx, k * size * uPx * (900.0 / -mv.z));
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uInk;
      varying vec3 vColor; varying float vTw; varying float vSize;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        if (uInk > 0.5) {
          float dot = 1.0 - smoothstep(0.30, 0.36, d);
          gl_FragColor = vec4(0.11, 0.12, 0.22, dot * (vSize > 8.0 ? 0.85 : 0.32));
          return;
        }
        float core = smoothstep(0.5, 0.0, d);
        gl_FragColor = vec4(vColor, pow(core, 2.2) * vTw);
      }`,
  })

  const disposables: { dispose: () => void }[] = [renderer, starMat]

  function makePoints(list: Star[]) {
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array(list.length * 3)
    const col = new Float32Array(list.length * 3)
    const size = new Float32Array(list.length)
    const phase = new Float32Array(list.length)
    list.forEach((p, i) => {
      pos.set([p.x, p.y, p.z], i * 3)
      col.set([p.c.r, p.c.g, p.c.b], i * 3)
      size[i] = p.s
      phase[i] = Math.random()
    })
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('color', new THREE.BufferAttribute(col, 3))
    g.setAttribute('size', new THREE.BufferAttribute(size, 1))
    g.setAttribute('phase', new THREE.BufferAttribute(phase, 1))
    disposables.push(g)
    return new THREE.Points(g, starMat)
  }

  const world = new THREE.Group()
  scene.add(world)

  // 1) Derin yıldız alanı: kamera yolu boyunca uzanan bir tünel
  const field: Star[] = []
  for (let i = 0; i < 12000 * density; i++) {
    const big = Math.random() < 0.03
    field.push({
      x: (Math.random() - 0.5) * 2600,
      y: (Math.random() - 0.5) * 1800,
      z: START_Z - Math.random() * (DEPTH + 1800),
      c: starColor(),
      s: big ? 9 + Math.random() * 6 : 2 + Math.random() * 4,
    })
  }
  world.add(makePoints(field))

  // 2) Yıldız kümeleri: yol kenarlarında, merkeze doğru yoğunlaşan küresel kümeler
  const clusters = [
    { x: -520, y: 160, z: -500, r: 140, n: 1400, c: '#ffe2b0' },
    { x: 620, y: -220, z: -1250, r: 180, n: 1800, c: '#cfe0ff' },
    { x: -380, y: -300, z: -2050, r: 120, n: 1100, c: '#ffffff' },
    { x: 460, y: 280, z: -2800, r: 200, n: 2000, c: '#ffd27a' },
    { x: 0, y: 40, z: -3900, r: 260, n: 2600, c: '#cfe0ff' },
  ]
  const clusterStars: Star[] = []
  for (const k of clusters) {
    const base = new THREE.Color(k.c)
    for (let i = 0; i < k.n * density; i++) {
      const r = k.r * Math.pow(Math.random(), 1.8)
      const th = Math.random() * Math.PI * 2
      const ph = Math.acos(2 * Math.random() - 1)
      clusterStars.push({
        x: k.x + r * Math.sin(ph) * Math.cos(th),
        y: k.y + r * Math.sin(ph) * Math.sin(th),
        z: k.z + r * Math.cos(ph),
        c: Math.random() < 0.7 ? base : starColor(),
        s: 1.5 + Math.random() * 3.5,
      })
    }
  }
  world.add(makePoints(clusterStars))

  // 3) Bulutsular: büyük, soluk renk sisleri
  const cloudCanvas = document.createElement('canvas')
  cloudCanvas.width = cloudCanvas.height = 256
  const cg = cloudCanvas.getContext('2d')!
  const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5
  for (let i = 0; i < 14; i++) {
    const x = 128 + gauss() * 60
    const y = 128 + gauss() * 60
    const r = 40 + Math.random() * 80
    const gr = cg.createRadialGradient(x, y, 0, x, y, r)
    gr.addColorStop(0, 'rgba(255,255,255,0.22)')
    gr.addColorStop(1, 'rgba(255,255,255,0)')
    cg.fillStyle = gr
    cg.fillRect(0, 0, 256, 256)
  }
  // Kenarları tamamen sönümle: sprite'ın sınırı görünmesin
  const mask = cg.createRadialGradient(128, 128, 0, 128, 128, 128)
  mask.addColorStop(0, 'rgba(0,0,0,1)')
  mask.addColorStop(0.55, 'rgba(0,0,0,0.6)')
  mask.addColorStop(1, 'rgba(0,0,0,0)')
  cg.globalCompositeOperation = 'destination-in'
  cg.fillStyle = mask
  cg.fillRect(0, 0, 256, 256)
  const cloudTex = new THREE.CanvasTexture(cloudCanvas)
  disposables.push(cloudTex)

  const nebulae = [
    { x: 700, y: 300, z: -300, s: 1300, c: '#3b5bdb' },
    { x: -800, y: -200, z: -1100, s: 1500, c: '#9c36b5' },
    { x: 500, y: -350, z: -1900, s: 1200, c: '#1c7ed6' },
    { x: -600, y: 350, z: -2700, s: 1600, c: '#c2255c' },
    { x: 200, y: 0, z: -3700, s: 1900, c: '#5f3dc4' },
  ].map((n) => {
    const m = new THREE.SpriteMaterial({ map: cloudTex, color: n.c, transparent: true, opacity: 0.4, depthWrite: false, blending: THREE.AdditiveBlending })
    m.rotation = Math.random() * 6
    disposables.push(m)
    const sp = new THREE.Sprite(m)
    sp.position.set(n.x, n.y, n.z)
    sp.scale.setScalar(n.s)
    world.add(sp)
    return sp
  })

  // 4) Takımyıldızlar: yol üzerinde yanından geçilen ince çizgiler
  const constellations: { o: [number, number, number]; p: [number, number][] }[] = [
    { o: [-260, 120, -350], p: [[0, 0], [60, 30], [120, 10], [170, 60], [230, 40], [160, 120]] },
    { o: [180, -140, -900], p: [[0, 0], [40, 70], [100, 90], [150, 60], [130, -10], [60, -30]] },
    { o: [-200, -60, -1600], p: [[0, 0], [70, -20], [140, 10], [200, -30], [260, 0]] },
    { o: [140, 120, -2350], p: [[0, 0], [50, 50], [110, 40], [90, -20], [30, -40], [0, 0]] },
  ]
  const lineMat = new THREE.LineBasicMaterial({ color: 0xf4c46a, transparent: true, opacity: 0.35, depthWrite: false })
  disposables.push(lineMat)
  const conStars: Star[] = []
  for (const k of constellations) {
    const pts = k.p.map(([x, y]) => new THREE.Vector3(k.o[0] + x, k.o[1] + y, k.o[2] + (Math.random() - 0.5) * 40))
    const geo = new THREE.BufferGeometry().setFromPoints(pts)
    disposables.push(geo)
    world.add(new THREE.Line(geo, lineMat))
    pts.forEach((v) => conStars.push({ x: v.x, y: v.y, z: v.z, c: STAR_COLORS[4], s: 12 }))
  }
  world.add(makePoints(conStars))

  // 5) Gök küresi ızgarası (atlas teması): enlem/boylam çizgileri
  const grid = new THREE.Group()
  const gridMat = new THREE.LineBasicMaterial({ color: 0x1f3f8a, transparent: true, opacity: 0.22, depthWrite: false })
  disposables.push(gridMat)
  const R = 1400
  const rad = Math.PI / 180
  const addRing = (pts: THREE.Vector3[]) => {
    const geo = new THREE.BufferGeometry().setFromPoints(pts)
    disposables.push(geo)
    grid.add(new THREE.Line(geo, gridMat))
  }
  for (let lat = -75; lat <= 75; lat += 15) {
    const r = R * Math.cos(lat * rad)
    const y = R * Math.sin(lat * rad)
    const pts: THREE.Vector3[] = []
    for (let a = 0; a <= 360; a += 4) pts.push(new THREE.Vector3(r * Math.cos(a * rad), y, r * Math.sin(a * rad)))
    addRing(pts)
  }
  for (let lon = 0; lon < 180; lon += 15) {
    const pts: THREE.Vector3[] = []
    for (let a = 0; a <= 360; a += 4) {
      pts.push(new THREE.Vector3(R * Math.cos(a * rad) * Math.cos(lon * rad), R * Math.sin(a * rad), R * Math.cos(a * rad) * Math.sin(lon * rad)))
    }
    addRing(pts)
  }
  grid.visible = false
  grid.rotation.x = 0.35
  scene.add(grid)

  // ---------- Etkileşim ----------
  let mx = 0
  let my = 0
  let cx = 0
  let cy = 0
  let camZ = START_Z
  let targetZ = START_Z

  const resize = () => {
    renderer.setSize(window.innerWidth, window.innerHeight, false)
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    if (still) render(0)
  }
  const onPointer = (e: PointerEvent) => {
    mx = e.clientX / window.innerWidth - 0.5
    my = e.clientY / window.innerHeight - 0.5
  }
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    targetZ = START_Z - (max > 0 ? window.scrollY / max : 0) * DEPTH
  }

  function render(t: number) {
    starMat.uniforms.uTime.value = t
    camera.position.set(cx, cy, camZ)
    camera.lookAt(cx * 0.3, cy * 0.3, camZ - 600)
    grid.position.z = camZ - 200
    grid.rotation.y = t * 0.01 + (START_Z - camZ) * 0.0004
    renderer.render(scene, camera)
  }

  const clock = new THREE.Clock()
  let raf = 0
  let running = !still
  const tick = () => {
    const t = clock.getElapsedTime()
    camZ += (targetZ - camZ) * 0.06
    cx += (mx * 120 - cx) * 0.04
    cy += (-my * 80 - cy) * 0.04
    world.rotation.z = t * 0.008
    nebulae.forEach((n, i) => (n.material.rotation += 0.0004 * (i % 2 ? 1 : -1)))
    render(t)
    raf = requestAnimationFrame(tick)
  }
  // Sekme arka plandayken çizimi durdur
  const onVisibility = () => {
    if (still) return
    if (document.hidden && running) {
      cancelAnimationFrame(raf)
      running = false
    } else if (!document.hidden && !running) {
      running = true
      raf = requestAnimationFrame(tick)
    }
  }

  window.addEventListener('resize', resize)
  document.addEventListener('visibilitychange', onVisibility)
  resize()
  if (!still) {
    window.addEventListener('pointermove', onPointer, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    camZ = targetZ
    raf = requestAnimationFrame(tick)
  }

  return {
    applySky(sky) {
      const ink = sky.stars === 'ink'
      starMat.uniforms.uInk.value = ink ? 1 : 0
      starMat.blending = ink ? THREE.NormalBlending : THREE.AdditiveBlending
      starMat.needsUpdate = true
      fog.color.set(sky.fog)
      fog.density = ink ? 0.0003 : 0.00045
      lineMat.color.set(sky.line)
      lineMat.opacity = sky.lineOpacity
      grid.visible = sky.grid
      nebulae.forEach((n) => (n.visible = sky.nebulae))
      if (still) render(0)
    },
    dispose() {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('visibilitychange', onVisibility)
      disposables.forEach((d) => d.dispose())
    },
  }
}

export default function SpaceScene({ sky, lite, still }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const api = useRef<SceneApi | null>(null)

  useEffect(() => {
    const scene = createScene(canvasRef.current!, { lite, still })
    api.current = scene
    return () => {
      scene.dispose()
      api.current = null
    }
  }, [lite, still])

  useEffect(() => {
    api.current?.applySky(sky)
  }, [sky, lite, still])

  return <canvas ref={canvasRef} aria-hidden="true" className="block h-full w-full" />
}
