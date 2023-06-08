<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import { paused } from '$lib/stores'
  import { FPS, WINDOW_SECONDS, FRAMES_PER_WINDOW, BEAT_TOLERANCE, COLOR } from '$lib/config'
  import { getPlaybackTime } from './AudioContext.svelte'

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

  predBeats = excludeDownbeats(predBeats, predDownbeats)
  trueBeats = excludeDownbeats(trueBeats, trueDownbeats)

  const beats: GridLine[] = processGridLine(predBeats, trueBeats)
  const downbeats: GridLine[] = processGridLine(predDownbeats, trueDownbeats)

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
    drawGrid(beats, '#666', true)
    drawGrid(downbeats, '#AAA')
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
    if (dottedLine) ctx.setLineDash([5, 5])

    ctx.strokeStyle = color
    ctx.beginPath()
    for (const gridLineX of correctGridLineXs) {
      ctx.moveTo(gridLineX, 0)
      ctx.lineTo(gridLineX, height)
    }
    ctx.stroke()

    ctx.lineWidth = dpr * 1
    for (const gridLineX of wrongGridLineXs) {
      ctx.beginPath()
      ctx.strokeStyle = COLOR.BEAT_CORRECT
      ctx.moveTo(gridLineX[0], 0)
      ctx.lineTo(gridLineX[0], height)
      ctx.stroke()

      ctx.beginPath()
      ctx.strokeStyle = COLOR.BEAT_WRONG
      ctx.moveTo(gridLineX[1], 0)
      ctx.lineTo(gridLineX[1], height)
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

  // Exclude downbeats from beats.
  function excludeDownbeats(beats: number[], downbeats: number[]): number[] {
    return beats.filter((t) => {
      const diffs = downbeats.map((v) => Math.abs(v - t))
      const min = Math.min(...diffs)
      return min > BEAT_TOLERANCE
    })
  }

  type GridLine = {
    pred: number
    true: number
    wrong: boolean
  }

  function processGridLine(preds: number[], trues: number[]): GridLine[] {
    return preds.map((t) => {
      const diffs = trues.map((v) => Math.abs(v - t))
      const min = Math.min(...diffs)
      return {
        pred: t,
        true: trues[diffs.indexOf(min)],
        wrong: min > BEAT_TOLERANCE,
      }
    })
  }
</script>

<div class="w-full h-full flex">
  <div class="relative grow h-full">
    <canvas class="h-full w-full" bind:this={canvas} />
  </div>
</div>

<svelte:window on:resize={onResize} />
