<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import Icon from '@iconify/svelte'
  import Canvas from '$lib/Canvas.svelte'
  import Square from '$lib/Square.svelte'
  import Navigator from '$lib/Navigator.svelte'
  import { currentTime, paused, duration } from '$lib/stores'
  import Labels from '$lib/Labels.svelte'

  export let data

  console.log('data:', data)

  let audio: HTMLAudioElement
  let audioUrl: string = `https://taejun-allinone-demo.s3.ap-northeast-2.amazonaws.com/audio/${data.id}.mp3`

  onMount(async () => {
    audioUrl = `https://taejun-allinone-demo.s3.ap-northeast-2.amazonaws.com/audio/${data.id}.mp3`
  })

  function handleKeydown(event: KeyboardEvent) {
    console.log(event)
    if (event.code === 'Space') {
      $paused = !$paused
    }
  }
</script>

{#if !data.nav}
  <div class="loading">
    <div class="loading__text">Loading...</div>
  </div>
{:else}
  <Labels labels={data.truths.labels} boundaries={data.truths.segments} />
  <Labels labels={data.inferences.labels} boundaries={data.inferences.segments} />

  <Navigator name="Drum" energy={data.nav.drum} />
  <Navigator name="Bass" energy={data.nav.bass} />
  <Navigator name="Vocal" energy={data.nav.vocal} />
  <Navigator name="Other" energy={data.nav.other} />

  <audio
    src={audioUrl}
    bind:this={audio}
    bind:currentTime={$currentTime}
    bind:paused={$paused}
    bind:duration={$duration}
  />
  <button type="button" class="btn" on:click={() => ($paused = !$paused)}>
    {#if $paused}
      <Icon icon="ph:play" />
    {:else}
      <Icon icon="ph:pause" />
    {/if}
  </button>
{/if}

<svelte:window on:keydown={handleKeydown} />
