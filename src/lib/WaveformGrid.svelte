<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import { paused } from '$lib/stores'
  import { FPS, WINDOW_SECONDS, FRAMES_PER_WINDOW, BEAT_TOLERANCE, COLOR } from '$lib/config'
  import { getPlaybackTime } from './AudioContext.svelte'
  import { excludeDownbeats, processGridLine, type GridLine, getCssVarColorAsHex } from '$lib/utils'

  export let predBeats: number[]
  export let predDownbeats: number[]
  export let trueBeats: number[]
  export let trueDownbeats: number[]

  let mounted = false
  let canvas: HTMLCanvasElement
  let ctx: CanvasRenderingContext2D
  let width: number
  let height: number
  let dpr: number
  let hopSize: number

  let beats: GridLine[] = processGridLine(predBeats, trueBeats)
  const downbeats: GridLine[] = processGridLine(predDownbeats, trueDownbeats)

  beats = beats.filter(({ pred: predBeat }) => {
    const predDiffs = downbeats.map(({ pred: predDownbeat }) => Math.abs(predDownbeat - predBeat))
    const trueDiffs = downbeats.map(({ true: trueDownbeat }) => Math.abs(trueDownbeat - predBeat))
    const predMin = Math.min(...predDiffs)
    const trueMin = Math.min(...trueDiffs)
    if (predMin > BEAT_TOLERANCE && trueMin > BEAT_TOLERANCE) {
      return true
    } else if (trueMin <= BEAT_TOLERANCE) {
      return false
    } else {
      downbeats[predDiffs.indexOf(predMin)].pred = predBeat // beat has a better precision
      return false
    }
  })

  $: if (!$paused) {
    draw()
  }

  onMount(() => {
    dpr = window.devicePixelRatio || 1
    mounted = true

    setupSize()
    draw()
  })

  onDestroy(() => {
    mounted = false
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
    if (!$paused) requestAnimationFrame(draw)

    ctx.clearRect(0, 0, width, height)

    drawTimebar()
    drawGrids()
  }

  function drawGrids() {
    drawGrid(beats, '#FFFE', true)
    // drawGrid(downbeats, '#FFFC')
    drawGrid(downbeats, '#FFFE')
  }

  function drawGrid(gridLines: GridLine[], color: string, dottedLine: boolean = false) {
    const playbackTime = getPlaybackTime()
    const centerFrame = playbackTime * FPS
    const centerX = centerFrame * hopSize
    const start = playbackTime - WINDOW_SECONDS / 2
    const end = playbackTime + WINDOW_SECONDS / 2
    const startIndex = gridLines.findIndex((t) => t.pred >= start)
    const endIndex = gridLines.findIndex((t) => t.pred >= end)

    const windowGridLines = gridLines.slice(startIndex, endIndex)
    const correctGridLines = windowGridLines.filter((t) => !t.wrong)
    const wrongGridLines = windowGridLines.filter((t) => t.wrong)

    const timeToX = (t: number) => t * FPS * hopSize - centerX + width / 2
    const correctGridLineXs = correctGridLines.map((t) => timeToX(t.pred))
    const wrongGridLineXs = wrongGridLines.map((t) => [timeToX(t.pred), timeToX(t.true)])

    ctx.save()
    ctx.lineWidth = dpr * 1
    const dashWidth = 8 * dpr
    if (dottedLine) ctx.setLineDash([dashWidth, dpr * 2])

    ctx.strokeStyle = color
    ctx.beginPath()
    for (const gridLineX of correctGridLineXs) {
      ctx.moveTo(gridLineX, 0)
      ctx.lineTo(gridLineX, height)
    }
    ctx.stroke()

    for (const [predX, trueX] of wrongGridLineXs) {
      ctx.lineWidth = dpr * 1
      ctx.beginPath()
      ctx.strokeStyle = color
      ctx.moveTo(trueX, 0)
      ctx.lineTo(trueX, height)
      ctx.stroke()

      ctx.lineWidth = dpr * 2
      ctx.beginPath()
      if (dottedLine) ctx.strokeStyle = COLOR.GRID_WRONG_BEAT
      else ctx.strokeStyle = COLOR.GRID_WRONG_DOWNBEAT
      ctx.moveTo(predX, 0)
      ctx.lineTo(predX, height)
      ctx.stroke()
    }

    ctx.restore()
  }

  function drawTimebar() {
    const centerX = width / 2

    ctx.save()
    ctx.strokeStyle = 'white'
    ctx.lineWidth = dpr * 1
    ctx.beginPath()
    ctx.moveTo(centerX, 0)
    ctx.lineTo(centerX, height)
    ctx.stroke()
    ctx.restore()
  }
</script>

<div class="w-full h-full flex">
  <div class="relative grow h-full">
    <canvas class="h-full w-full" bind:this={canvas} />
  </div>
</div>

<svelte:window on:resize={onResize} />
