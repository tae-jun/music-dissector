<script lang="ts">
  import { onMount } from 'svelte'
  import { currentTime, paused } from '$lib/stores'
  import { FPS, WINDOW_SECONDS, FRAMES_PER_WINDOW, BEAT_TOLERANCE, COLOR } from '$lib/config'

  export let name: string
  export let wav: { [key: string]: Array<number> }
  export let predBeats: number[]
  export let predDownbeats: number[]
  export let trueBeats: number[]
  export let trueDownbeats: number[]
  export let colorLow: string = 'MediumBlue'
  export let colorMid: string = 'Orange'
  export let colorHigh: string = 'Snow'

  let mounted = false
  let energyCanvas: HTMLCanvasElement
  let timebarCanvas: HTMLCanvasElement

  let width: number
  let height: number
  let dpr: number
  let hopSize: number

  const totalFrames: number = wav.low.length - 1

  $: if (!$paused) {
    drawTimebar()
    draw()
  }

  // Exclude downbeats from beats.
  function excludeDownbeats(beats: number[], downbeats: number[]): number[] {
    return beats.filter((t) => {
      const diffs = downbeats.map((v) => Math.abs(v - t))
      const min = Math.min(...diffs)
      return min > BEAT_TOLERANCE
    })
  }
  predBeats = excludeDownbeats(predBeats, predDownbeats)
  trueBeats = excludeDownbeats(trueBeats, trueDownbeats)

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

  const beats: GridLine[] = processGridLine(predBeats, trueBeats)
  const downbeats: GridLine[] = processGridLine(predDownbeats, trueDownbeats)

  console.log(beats.filter((b) => b.wrong))

  onMount(() => {
    mounted = true

    dpr = window.devicePixelRatio || 1

    draw()
    drawTimebar()
  })

  function draw() {
    if (!mounted) return

    const rect = energyCanvas.getBoundingClientRect()
    width = energyCanvas.width = rect.width * dpr
    height = energyCanvas.height = rect.height * dpr
    hopSize = width / FRAMES_PER_WINDOW

    const ctx = energyCanvas.getContext('2d') as CanvasRenderingContext2D
    ctx.clearRect(0, 0, width, height)

    drawWaveform(wav.low, colorLow, COLOR.WAV_LOW)
    drawWaveform(wav.mid, colorMid, COLOR.WAV_MID)
    drawWaveform(wav.high, colorHigh, COLOR.WAV_HIGH)

    drawGrid(beats, '#666', true)
    drawGrid(downbeats, '#AAA')

    if (!$paused) requestAnimationFrame(draw)
  }

  function drawWaveform(wav: Array<number>, color: string, alpha: string) {
    const centerFrame = Math.round($currentTime * FPS)
    const centerX = centerFrame * hopSize
    const padding = Math.max(0, (WINDOW_SECONDS * FPS * hopSize) / 2 - centerX)
    const startFrame = Math.max(0, centerFrame - FRAMES_PER_WINDOW / 2)
    const endFrame = Math.min(totalFrames, centerFrame + FRAMES_PER_WINDOW / 2)
    wav = wav.slice(startFrame, endFrame)
    const points = wav.map((v, i) => {
      const x = i * hopSize + padding + hopSize / 2
      const y = (v / 255) * height
      return [x, y]
    })

    const ctx = energyCanvas.getContext('2d') as CanvasRenderingContext2D
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

  function drawGrid(gridLines: GridLine[], color: string, dottedLine: boolean = false) {
    const centerFrame = Math.round($currentTime * FPS)
    const centerX = centerFrame * hopSize
    const start = $currentTime - WINDOW_SECONDS / 2
    const end = $currentTime + WINDOW_SECONDS / 2
    const startIndex = gridLines.findIndex((t) => t.pred >= start)
    const endIndex = gridLines.findIndex((t) => t.pred >= end)

    const windowGridLines = gridLines.slice(startIndex, endIndex)
    const correctGridLines = windowGridLines.filter((t) => !t.wrong)
    const wrongGridLines = windowGridLines.filter((t) => t.wrong)

    const timeToX = (t: number) => Math.round(t * FPS * hopSize - centerX + width / 2)
    const correctGridLineXs = correctGridLines.map((t) => timeToX(t.pred))
    const wrongGridLineXs = wrongGridLines.map((t) => [timeToX(t.pred), timeToX(t.true)])

    const ctx = energyCanvas.getContext('2d') as CanvasRenderingContext2D
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

    ctx.lineWidth = dpr * 1.5
    for (const gridLineX of wrongGridLineXs) {
      ctx.beginPath()
      ctx.strokeStyle = 'red'
      ctx.moveTo(gridLineX[0], 0)
      ctx.lineTo(gridLineX[0], height)
      ctx.stroke()

      ctx.beginPath()
      ctx.strokeStyle = 'green'
      ctx.moveTo(gridLineX[1], 0)
      ctx.lineTo(gridLineX[1], height)
      ctx.stroke()
    }

    ctx.restore()
  }

  function drawTimebar() {
    const x = width / 2
    const ctx = timebarCanvas.getContext('2d') as CanvasRenderingContext2D
    timebarCanvas.width = width
    timebarCanvas.height = height

    ctx.save()
    ctx.strokeStyle = 'white'
    ctx.lineWidth = dpr * 1
    ctx.clearRect(0, 0, width, height)
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
    ctx.restore()

    if (!$paused) requestAnimationFrame(drawTimebar)
  }
</script>

<div class="w-full h-24 flex">
  <div class="relative grow h-full">
    <canvas id="wav" class="absolute h-full w-full" bind:this={energyCanvas} />
    <canvas class="absolute h-full w-full" bind:this={timebarCanvas} />
  </div>
  <div class="w-20 h-full">{name}</div>
</div>

<svelte:window on:resize={draw} />

<style>
  #wav {
    background-color: #0f0020;
  }
</style>
