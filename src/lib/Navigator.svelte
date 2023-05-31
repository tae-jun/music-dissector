<script lang="ts">
  import { onMount } from 'svelte'
  import { currentTime, duration, paused } from '$lib/stores'

  export let name: string
  export let energy: { [key: string]: Array<number> }
  export let colorLow: string = 'MediumBlue'
  export let colorMid: string = 'Orange'
  export let colorHigh: string = 'Snow'

  let width: number
  let height: number
  let dpr: number
  let frames: number

  let energyCanvas: HTMLCanvasElement
  let timebarCanvas: HTMLCanvasElement

  $: if (!$paused) drawTimebar()

  onMount(() => {
    dpr = window.devicePixelRatio || 1
    frames = energy.low.length - 1

    draw()
  })

  function draw() {
    const rect = energyCanvas.getBoundingClientRect()
    width = energyCanvas.width = rect.width * dpr
    height = energyCanvas.height = rect.height * dpr

    drawEnergy(energy.high, colorHigh)
    drawEnergy(energy.mid, colorMid)
    drawEnergy(energy.low, colorLow)
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
    const x = ($currentTime / $duration) * width
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

    if (!$paused) requestAnimationFrame(drawTimebar)
  }

  function seek(event: MouseEvent) {
    console.log(event)
    if ($paused) $paused = false

    const rect = energyCanvas.getBoundingClientRect()
    $currentTime = ($duration * event.offsetX) / rect.width
  }
</script>

<div class="w-full h-8 flex">
  <div class="w-12 h-full">{name}</div>
  <div class="relative grow h-full">
    <canvas id="energy" class="absolute h-full w-full" bind:this={energyCanvas} />
    <canvas class="absolute h-full w-full" bind:this={timebarCanvas} on:mousedown={seek} />
  </div>
</div>

<svelte:window on:resize={draw} />

<style>
  #energy {
    background-color: #0f0020;
  }
</style>
