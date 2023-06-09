<script lang="ts">
  import { onMount } from 'svelte'
  import { duration, paused } from '$lib/stores'
  import { getPlaybackTime, seekTo } from './AudioContext.svelte'
  import { COLOR } from './config'

  export let energy: { [key: string]: Array<number> }

  let width: number
  let height: number
  let dpr: number
  let frames: number

  let energyCanvas: HTMLCanvasElement
  let timebarCanvas: HTMLCanvasElement

  $: if (!$paused) drawTimebar()
  $: if ($duration) drawTimebar()

  onMount(() => {
    dpr = window.devicePixelRatio || 1
    frames = energy.low.length - 1

    draw()
    drawTimebar()
  })

  function draw() {
    const rect = energyCanvas.getBoundingClientRect()
    width = energyCanvas.width = rect.width * dpr
    height = energyCanvas.height = rect.height * dpr

    drawEnergy(energy.high, COLOR.NAV_HIGH)
    drawEnergy(energy.mid, COLOR.NAV_MID)
    drawEnergy(energy.low, COLOR.NAV_LOW)
  }

  function drawEnergy(eg: Array<number>, color: string) {
    const ctx = energyCanvas.getContext('2d') as CanvasRenderingContext2D
    const points = eg.map((v, i) => {
      const x = (i / frames) * width
      const y = (v / 255) * height
      return [x, y]
    })

    ctx.strokeStyle = color
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.moveTo(0, height)
    for (let i = 0; i < points.length; i++) {
      ctx.lineTo(points[i][0], height - points[i][1])
    }
    ctx.stroke()

    // Fill the area under the line graph
    ctx.lineTo(points[points.length - 1][0], height)
    ctx.lineTo(points[0][1], height)
    ctx.closePath()
    ctx.fill()
  }

  function drawTimebar() {
    if (!timebarCanvas) return
    if (!$paused) requestAnimationFrame(drawTimebar)

    const x = (getPlaybackTime() / $duration) * width
    const ctx = timebarCanvas.getContext('2d') as CanvasRenderingContext2D
    timebarCanvas.width = width
    timebarCanvas.height = height

    ctx.strokeStyle = 'white'
    ctx.lineWidth = dpr * 1
    ctx.clearRect(0, 0, width, height)
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }

  function seek(event: MouseEvent) {
    const rect = energyCanvas.getBoundingClientRect()
    seekTo(($duration * event.offsetX) / rect.width)
  }
</script>

<div class="relative h-8">
  <canvas id="energy-canvas" class="absolute h-full w-full" bind:this={energyCanvas} />
  <canvas class="absolute h-full w-full" bind:this={timebarCanvas} on:mousedown={seek} />
</div>

<svelte:window on:resize={draw} />

<style>
  #energy-canvas {
    @apply bg-surface-900;
  }
</style>
