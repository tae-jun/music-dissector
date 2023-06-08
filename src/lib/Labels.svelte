<script lang="ts">
  import { onMount } from 'svelte'
  import { duration, loading, paused } from '$lib/stores'
  import { seekTo } from './AudioContext.svelte'

  export let upper: boolean = false
  export let labels: string[]
  export let boundaries: number[]

  let mounted: boolean = false
  let texts: string[] = []
  let positions: number[] = []
  let div: HTMLDivElement

  let filteredLabels: string[] = []
  let filteredBoundaries: number[] = []

  $: if (!$loading) render()

  onMount(() => {
    mounted = true
    render()
  })

  function render() {
    if (!mounted) return

    // Filter out labels and boundaries that are invalid or out of range.
    filteredLabels = labels.filter(
      (label, i) =>
        label !== 'start' &&
        label !== 'end' &&
        boundaries[i] >= 0 &&
        boundaries[i] < $duration - 0.6,
    )
    filteredBoundaries = boundaries.filter(
      (boundary, i) =>
        labels[i] !== 'start' && labels[i] !== 'end' && boundary >= 0 && boundary < $duration - 0.6,
    )

    const rect = div.getBoundingClientRect()
    const witdh = rect.width
    texts = filteredLabels.map((label) => label.charAt(0).toUpperCase() + label.slice(1))
    positions = filteredBoundaries.map((boundary) => Math.round((boundary / $duration) * witdh))
  }

  function seekToBoundary(i: number) {
    seekTo(filteredBoundaries[i])
    if ($paused) $paused = false
  }
</script>

<div class="h-6 relative" bind:this={div}>
  {#each texts as text, i}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div
      class="labelbox absolute flex flex-row h-full"
      style:left={positions[i] + 'px'}
      on:click={() => seekToBoundary(i)}
    >
      <div class="labelbox-body h-full pl-1 flex items-center justify-center">
        <span>{text}</span>
      </div>
      {#if upper}
        <div class="labelbox-tail-upper h-full" />
      {:else}
        <div class="labelbox-tail-lower h-full" />
      {/if}
    </div>
  {/each}
</div>

<svelte:window on:resize={render} />

<style>
  :root {
    --label-color: rgb(var(--color-surface-600));
  }

  .labelbox {
    cursor: pointer;
    transition: 100ms ease-in-out;
  }
  .labelbox:hover {
    /* --label-color: rgb(var(--color-warning-600)); */
    filter: brightness(150%);
  }
  .labelbox-body {
    font-size: 1rem;
    line-height: 1rem;
    background-color: var(--label-color);
    border-left: 1px solid rgb(var(--color-surface-900));
  }
  .labelbox-tail-upper {
    border-bottom: 1.5rem solid var(--label-color);
    border-right: 1.5rem solid transparent;
  }
  .labelbox-tail-lower {
    border-top: 1.5rem solid var(--label-color);
    border-right: 1.5rem solid transparent;
  }
</style>
