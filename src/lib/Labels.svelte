<script lang="ts">
  import { onMount } from 'svelte'
  import { duration, loading, paused } from '$lib/stores'
  import { seekTo } from './AudioContext.svelte'
  import { COLOR } from './config'

  export let top: boolean = false
  export let labels: string[]
  export let boundaries: number[]
  export let trueLabels: string[] = []
  export let trueBoundaries: number[] = []

  let mounted: boolean = false
  let div: HTMLDivElement
  let preds: any[] = []

  $: if (!$loading) render()

  onMount(() => {
    mounted = true
    render()
  })

  function render() {
    if (!mounted) return

    const rect = div.getBoundingClientRect()
    const witdh = rect.width

    preds = instantiateAndFilter(labels, boundaries).map(({ label, boundary }) => {
      let color = COLOR.LABEL_CORRECT
      let textColor = 'text-white'

      if (trueLabels.length > 0) {
        const trues = instantiateAndFilter(trueLabels, trueBoundaries)
        const diffs = trues.map((tru) => Math.abs(tru.boundary - boundary))
        const min = Math.min(...diffs)
        const wrongBoundary = min > 0.5

        let wrongLabel
        if (!wrongBoundary) wrongLabel = trues[diffs.indexOf(min)].label !== label
        else {
          const trueIndex = Math.max(
            0,
            trues.findLastIndex((tru) => tru.boundary < boundary),
          )
          wrongLabel = trues[trueIndex].label !== label
        }

        if (wrongBoundary && wrongLabel) {
          color = COLOR.LABEL_SUPER_WRONG
        } else if (wrongBoundary || wrongLabel) {
          color = COLOR.LABEL_WRONG
          textColor = 'text-black'
        }
      }

      return {
        text: label.charAt(0).toUpperCase() + label.slice(1),
        position: Math.round((boundary / $duration) * witdh),
        boundary,
        color,
        textColor,
      }
    })
  }

  function instantiateAndFilter(labels: string[], boundaries: number[]) {
    return labels
      .map((label, i) => ({ label, boundary: boundaries[i] }))
      .filter(
        ({ label, boundary }) =>
          label !== 'start' && label !== 'end' && boundary >= 0 && boundary < $duration,
      )
  }

  function seekToBoundary(i: number) {
    seekTo(preds[i].boundary)
  }
</script>

<div class="h-6 relative" bind:this={div}>
  {#each preds as x, i}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div
      class="labelbox absolute flex flex-row h-full {x.textColor}"
      style:--label-color={x.color}
      style:left={x.position + 'px'}
      on:click={() => seekToBoundary(i)}
    >
      <div class="labelbox-body pl-1 flex items-center justify-center">
        <span>{x.text}</span>
      </div>
      {#if top}
        <div class="labelbox-tail-upper" />
      {:else}
        <div class="labelbox-tail-lower" />
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
    transition: filter 100ms ease-in-out;
  }
  .labelbox:hover {
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
