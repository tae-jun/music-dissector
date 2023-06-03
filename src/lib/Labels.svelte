<script lang="ts">
  import { setContext, afterUpdate, onMount, tick } from 'svelte'
  import { currentTime, duration, paused } from '$lib/stores'

  export let name: string
  export let upper: boolean = false
  export let labels: string[]
  export let boundaries: number[]

  let texts: string[] = []
  let positions: number[] = []
  let div: HTMLDivElement

  // Exclude labels and boundaries if the label is 'start' or 'end'
  const filteredLabels = labels.filter((label) => label !== 'start' && label !== 'end')
  boundaries = boundaries.filter((_, i) => {
    const label = labels[i]
    return label !== 'start' && label !== 'end'
  })
  labels = filteredLabels

  onMount(() => {
    texts = labels.map((label) => label.charAt(0).toUpperCase() + label.slice(1))
    onResize()
  })

  function onResize() {
    const rect = div.getBoundingClientRect()
    const witdh = rect.width
    const duration = boundaries[boundaries.length - 1]
    positions = boundaries.map((boundary) => Math.round((boundary / duration) * witdh))
  }

  function onClick(i: number) {
    console.log(i)
    $currentTime = boundaries[i]
    if ($paused) $paused = false
  }
</script>

<div class="w-full h-[1.2rem] flex">
  <div class="relative grow h-full" bind:this={div}>
    {#each texts as text, i}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div
        class="labelbox flex flex-row"
        style:left={positions[i] + 'px'}
        on:click={() => onClick(i)}
      >
        <div class="labelbox-body">{text}</div>
        {#if upper}
          <div class="labelbox-tail-upper" />
        {:else}
          <div class="labelbox-tail-lower" />
        {/if}
      </div>
    {/each}
  </div>
  <div class="w-20 h-full z-10">{name}</div>
</div>

<svelte:window on:resize={onResize} />

<style>
  .labelbox {
    @apply absolute;

    cursor: pointer;
    transition: 100ms ease-in-out;
  }
  .labelbox:hover {
    filter: brightness(150%);
  }
  .labelbox-body {
    font-size: 1rem;
    line-height: 1rem;
    padding-left: 0.2rem;
    padding-right: 0.2rem;
    padding-top: 0.07rem;
    background-color: green;
  }
  .labelbox-tail-upper {
    border-bottom: 1.2rem solid green;
    border-right: 1.2rem solid transparent;
  }
  .labelbox-tail-lower {
    border-top: 1.2rem solid green;
    border-right: 1.2rem solid transparent;
  }
</style>
