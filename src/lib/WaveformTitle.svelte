<script lang="ts">
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
    class="btn btn-sm mb-1"
    class:variant-ghost-warning={!$mutes[index]}
    class:variant-soft-warning={$mutes[index]}
    on:click={() => onClickButton(index)}>M</button
  >
</div>
