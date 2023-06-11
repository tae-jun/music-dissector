<script lang="ts">
  import * as THREE from 'three'
  import { onMount, onDestroy } from 'svelte'
  import { duration, paused } from '$lib/stores'
  import { FPS, FRAMES_PER_WINDOW, COLOR } from '$lib/config'
  import { getPlaybackTime } from './AudioContext.svelte'

  export let wav: { [key: string]: number[] }

  let mounted = false

  let canvas: HTMLCanvasElement
  let camera: THREE.OrthographicCamera
  let scene: THREE.Scene
  let renderer: THREE.WebGLRenderer

  let width: number
  let height: number
  let dpr: number
  let hopSize: number

  $: if (!$paused) animate()
  $: if ($duration) animate()

  onMount(() => {
    dpr = window.devicePixelRatio || 1
    mounted = true

    resizeAndDraw()
    animate()
  })

  onDestroy(() => {
    mounted = false
    dispose()
  })

  function onResize() {
    resizeAndDraw()
    if (!$paused) animate()
  }

  function animate() {
    if (!mounted) return
    if (!$paused) requestAnimationFrame(animate)
    camera.position.x = getPlaybackTime() * FPS * hopSize
    renderer.render(scene, camera)
  }

  function dispose() {
    if (renderer) renderer.dispose()
    if (scene)
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose()
          obj.material.dispose()
        }
      })
  }

  function resizeAndDraw() {
    dispose()

    const rect = canvas.getBoundingClientRect()
    width = canvas.width = rect.width
    height = canvas.height = rect.height
    hopSize = width / FRAMES_PER_WINDOW

    camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 1, 1000)
    camera.position.set(getPlaybackTime() * FPS * hopSize, 0, height)

    scene = new THREE.Scene()

    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      canvas,
    })
    renderer.setPixelRatio(dpr)

    drawWave(wav.low, COLOR.WAV_LOW, COLOR.WAV_LOW_OPACITY)
    drawWave(wav.mid, COLOR.WAV_MID, COLOR.WAV_MID_OPACITY)
    drawWave(wav.high, COLOR.WAV_HIGH, COLOR.WAV_HIGH_OPACITY)
  }

  function drawWave(wave: number[], color: string, opacity: number) {
    const shape = new THREE.Shape()
    shape.moveTo(0, 0)
    wave.forEach((v, i) => {
      shape.lineTo(i * hopSize, (v / 256) * height)
    })
    shape.lineTo((wave.length - 1) * hopSize, 0)
    shape.lineTo(0, 0)

    const geometryUpper = new THREE.ShapeGeometry(shape)

    const geometryLower = geometryUpper.clone()
    geometryLower.scale(1, -1, 1)

    const material = new THREE.MeshBasicMaterial({
      color,
      opacity,
      transparent: opacity < 1,
      side: THREE.DoubleSide,
      depthWrite: false,
    })

    const meshUpper = new THREE.Mesh(geometryUpper, material)
    const meshLower = new THREE.Mesh(geometryLower, material)

    scene.add(meshUpper)
    scene.add(meshLower)
  }
</script>

<div class="w-full h-24 flex">
  <div class="relative grow h-full">
    <canvas class="h-full w-full" bind:this={canvas} />
  </div>
</div>

<svelte:window on:resize={onResize} />

<style>
  canvas {
    @apply bg-surface-900;
  }
</style>
