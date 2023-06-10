<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import { duration, paused } from '$lib/stores'
  import { FPS, WINDOW_SECONDS, FRAMES_PER_WINDOW } from '$lib/config'
  import { type GridLine, processGridLine } from './utils'

  export let preds: number[]
  export let trues: number[]

  let mounted = false
  let canvas: HTMLCanvasElement
  let ctx: CanvasRenderingContext2D
  let width: number
  let height: number
  let dpr: number
  let hopSize: number

  const beats: GridLine[] = processGridLine(preds, trues)
  const wrongBeats: GridLine[] = beats.filter((beat) => beat.wrong)

  $: if (mounted && $duration) draw()

  onMount(() => {
    dpr = window.devicePixelRatio || 1
    mounted = true

    setupSize()
    draw()
  })

  function onResize() {
    setupSize()
    draw()
  }

  function setupSize() {
    const rect = canvas.getBoundingClientRect()
    width = canvas.width = rect.width * dpr
    height = canvas.height = rect.height * dpr
    hopSize = width / FRAMES_PER_WINDOW
    ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  }

  function draw() {
    ctx.clearRect(0, 0, width, height)
    ctx.lineWidth = dpr * 2
    ctx.strokeStyle = '#FF0000'
    ctx.beginPath()
    for (const { pred } of wrongBeats) {
      const x = (pred / $duration) * width
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
    }
    ctx.stroke()
  }
</script>

<canvas class="h-full w-full" bind:this={canvas} />

<svelte:window on:resize={onResize} />
