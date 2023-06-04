<script lang="ts">
  import { onMount } from 'svelte'
  import { currentTime, paused } from '$lib/stores'
  import { FPS, WINDOW_SECONDS, FRAMES_PER_WINDOW, BEAT_TOLERANCE, COLOR } from '$lib/config'

  export let name: string
  export let wav: { [key: string]: Array<number> }

  export let colorLow: string = 'MediumBlue'
  export let colorMid: string = 'Orange'
  export let colorHigh: string = 'Snow'

  let mounted = false
  let canvas: HTMLCanvasElement
  let ctx: CanvasRenderingContext2D

  let width: number
  let height: number
  let dpr: number
  let hopSize: number

  const totalFrames: number = wav.low.length

  $: if (!$paused) {
    draw()
  }

  onMount(() => {
    dpr = window.devicePixelRatio || 1
    mounted = true

    setupSize()
    draw()
  })

  function onResize() {
    setupSize()
    if ($paused) draw()
  }

  function setupSize() {
    const rect = canvas.getBoundingClientRect()
    width = canvas.width = rect.width * dpr
    height = canvas.height = rect.height * dpr
    hopSize = width / FRAMES_PER_WINDOW
    ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  }

  function draw() {
    if (!mounted) return

    ctx.clearRect(0, 0, width, height)

    drawWaveform(wav.low, colorLow, COLOR.WAV_LOW)
    drawWaveform(wav.mid, colorMid, COLOR.WAV_MID)
    drawWaveform(wav.high, colorHigh, COLOR.WAV_HIGH)

    if (!$paused) requestAnimationFrame(draw)
  }

  function drawWaveform(wave: Array<number>, color: string, alpha: string) {
    const centerFrame = Math.round($currentTime * FPS)
    const centerX = centerFrame * hopSize
    const padding = Math.max(0, (WINDOW_SECONDS * FPS * hopSize) / 2 - centerX)
    const startFrame = Math.max(0, centerFrame - FRAMES_PER_WINDOW / 2)
    const endFrame = Math.min(totalFrames, centerFrame + FRAMES_PER_WINDOW / 2)
    const windowWave = wave.slice(startFrame, endFrame)
    const points = windowWave.map((v, i) => {
      const x = i * hopSize + padding + hopSize / 2
      const y = (v / 255) * height
      return [x, y]
    })

    ctx.save()
    ctx.strokeStyle = color
    ctx.fillStyle = color
    ctx.fillStyle = ctx.fillStyle + alpha

    ctx.beginPath()
    ctx.moveTo(padding, height)
    for (let i = 0; i < points.length; i++) {
      ctx.lineTo(points[i][0], height - points[i][1])
    }
    ctx.stroke()

    // Fill the area under the line graph
    ctx.lineTo(points[points.length - 1][0], height)
    ctx.lineTo(points[0][1], height)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }
</script>

<div class="w-full h-24 flex">
  <div class="relative grow h-full">
    <canvas class="h-full w-full" bind:this={canvas} />
  </div>
  <div class="w-20 h-full">{name}</div>
</div>

<svelte:window on:resize={onResize} />

<style>
  canvas {
    background-color: #0f0020;
  }
</style>
