<script lang="ts">
  import { setContext, afterUpdate, onMount, tick } from 'svelte';

  export let key: string;
  export let color: string;

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let width: number;
  let height: number;
  let items = new Set();
  let scheduled = false;

  onMount(() => {
    ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    width = canvas.width = rect.width * dpr;
    height = canvas.height = rect.height * dpr;

    // Create a new image object
    var img = new Image();

    // Set the source of the image
    img.src = 'https://d3ta5tpotdqa0v.cloudfront.net/spec/3-mix-dj.png';

    // Once the image is loaded, draw it on the canvas
    img.onload = function () {
      var sourceX = 100; // The x coordinate where to start clipping
      var sourceY = 0; // The y coordinate where to start clipping
      var sourceWidth = 200; // The width of the clipped image
      var sourceHeight = img.height; // The height of the clipped image
      var destWidth = canvas.width; // The width of the image to use (stretch or reduce the image)
      var destHeight = canvas.height; // The height of the image to use (stretch or reduce the image)
      var destX = 0; // The x coordinate where to place the image on the canvas
      var destY = 0; // The y coordinate where to place the image on the canvas

      ctx.drawImage(
        img,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        destX,
        destY,
        destWidth,
        destHeight,
      );
    };
  });

  setContext(key, {
    addItem,
    getColor: () => color,
  });

  function addItem(fn) {
    onMount(() => {
      items.add(fn);
      return () => items.delete(fn);
    });

    afterUpdate(async () => {
      if (scheduled) return;

      scheduled = true;
      await tick();
      scheduled = false;

      draw();
    });
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    items.forEach((fn) => fn(ctx));
  }
</script>

<div class="w-full h-24">
  <canvas bind:this={canvas} class="h-full w-full" style:--color={color}>
    <slot />
  </canvas>
</div>

<style>
  canvas {
    width: 100%;
    height: 100%;
    background-color: var(--color, #fff);
  }
</style>
