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
  let centerFrame: number
  let centerX: number
  let padding: number
  let startFrame: number
  let endFrame: number

  let currentWaveLow: [number, number][]
  let currentWaveMid: [number, number][]
  let currentWaveHigh: [number, number][]

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

    centerFrame = Math.round($currentTime * FPS)
    centerX = centerFrame * hopSize
    padding = Math.max(0, (WINDOW_SECONDS * FPS * hopSize) / 2 - centerX)
    startFrame = Math.max(0, centerFrame - FRAMES_PER_WINDOW / 2)
    endFrame = Math.min(totalFrames, centerFrame + FRAMES_PER_WINDOW / 2)

    currentWaveLow = getCurrentWaveformPoints(wav.low)
    currentWaveMid = getCurrentWaveformPoints(wav.mid)
    currentWaveHigh = getCurrentWaveformPoints(wav.high)

    ctx.clearRect(0, 0, width, height)

    drawWaveform(currentWaveLow, colorLow, COLOR.WAV_LOW)
    drawWaveform(currentWaveMid, colorMid, COLOR.WAV_MID)
    drawWaveform(currentWaveHigh, colorHigh, COLOR.WAV_HIGH)

    if (!$paused) requestAnimationFrame(draw)

    function getCurrentWaveformPoints(wave: number[]): [number, number][] {
      return wave
        .slice(startFrame, endFrame)
        .map((v, i) => [i * hopSize + padding + hopSize / 2, (v / 255) * height])
    }
  }

  function drawWaveform(points: [number, number][], color: string, alpha: string) {
    ctx.save()
    ctx.strokeStyle = color
    ctx.fillStyle = color
    ctx.fillStyle = ctx.fillStyle + alpha

    ctx.beginPath()
    ctx.moveTo(padding, height)
    for (const [x, y] of points) {
      ctx.lineTo(x, height - y)
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
