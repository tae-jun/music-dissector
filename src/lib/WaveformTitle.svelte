<script lang="ts">
  import Icon from '@iconify/svelte'
  import { mutes } from './stores'

  export let title: string
  export let index: number

  function onClickButton(index: number) {
    $mutes[index] = !$mutes[index]
  }
</script>

<div class="flex flex-col h-full p-2 items-start justify-center">
  <div class="mb-1"><span class="text-xl font-bold">{title}</span></div>
  <button
    type="button"
    class="btn btn-sm mb-1 w-10 h-10"
    class:variant-ghost-primary={!$mutes[index]}
    class:variant-soft-primary={$mutes[index]}
    on:click={() => onClickButton(index)}
  >
    <span class="text-primary-500 text-lg">
      {#if $mutes[index]}
        <Icon icon="ph:x" />
      {:else}
        <Icon icon="ph:circle" />
      {/if}
    </span>
  </button>
</div>
