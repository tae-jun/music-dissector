<script lang="ts">
  import { afterUpdate, onDestroy, onMount, setContext, tick } from 'svelte'
  import { duration, paused } from '$lib/stores'
  import { FPS, WINDOW_SECONDS, FRAMES_PER_WINDOW } from '$lib/config'

  let mounted = false
  let canvas: HTMLCanvasElement
  let ctx: CanvasRenderingContext2D
  let width: number
  let height: number
  let dpr: number

  let items: Set<DrawFn> = new Set()
  let scheduled = false

  type DrawFn = (ctx: CanvasRenderingContext2D, width: number, height: number, dpr: number) => void

  setContext('canvas', { addItem })

  onMount(() => {
    dpr = window.devicePixelRatio || 1
    mounted = true
  })

  onDestroy(() => {
    mounted = false
  })

  function addItem(
    fn: (ctx: CanvasRenderingContext2D, width: number, height: number, dpr: number) => void,
  ) {
    onMount(() => {
      items.add(fn)
      return () => items.delete(fn)
    })

    afterUpdate(async () => {
      if (scheduled) return

      scheduled = true
      await tick()
      scheduled = false

      setupSize()
      drawItems()
    })
  }

  function drawItems() {
    ctx.clearRect(0, 0, width, height)
    items.forEach((fn) => fn(ctx, width, height, dpr))
  }

  function onResize() {
    setupSize()
    drawItems()
  }

  function setupSize() {
    if (!mounted) return
    const rect = canvas.getBoundingClientRect()
    width = canvas.width = rect.width * dpr
    height = canvas.height = rect.height * dpr
    ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  }
</script>

<canvas class="h-full w-full" bind:this={canvas} />
<slot />

<svelte:window on:resize={onResize} />
