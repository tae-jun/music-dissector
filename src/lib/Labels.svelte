<script lang="ts">
  import { setContext, afterUpdate, onMount, tick } from 'svelte'
  import { currentTime, duration, paused } from '$lib/stores'

  export let labels: Array<string>
  export let boundaries: Array<number>

  const margin = 0.2 // rem
  const fontsize = 1 // rem

  let canvas: HTMLCanvasElement
  let ctx: CanvasRenderingContext2D
  let width: number
  let height: number
  let dpr: number
  let rect: DOMRect

  onMount(draw)

  function draw() {
    ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    dpr = window.devicePixelRatio || 1
    rect = canvas.getBoundingClientRect()
    width = canvas.width = rect.width * dpr
    height = canvas.height = rect.height * dpr

    const duration = boundaries[boundaries.length - 1]
    const rem = parseInt(getComputedStyle(document.documentElement).fontSize)
    const marginPx = margin * rem * dpr

    for (const i in labels) {
      const label = labels[i].toLowerCase()
      const text = label.charAt(0).toUpperCase() + label.slice(1)
      const boundary = boundaries[i]
      const x = (boundary / duration) * width
      const textWidth = ctx.measureText(text).width

      ctx.fillStyle = 'red'
      ctx.fillRect(x, 0, textWidth + marginPx * 2, height)
      ctx.fillStyle = 'white'
      ctx.font = `${fontsize * dpr}rem Arial`
      ctx.fillText(text, x + marginPx, height - marginPx)
    }
  }
</script>

<div class="w-full h-[{fontsize + margin}rem] flex">
  <div class="w-12 h-full" />
  <div class="relative grow h-full">
    <canvas class="absolute h-full w-full" bind:this={canvas} />
  </div>
</div>

<svelte:window on:resize={draw} />
