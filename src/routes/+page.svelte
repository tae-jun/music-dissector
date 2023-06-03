<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import Icon from '@iconify/svelte'
  import Canvas from '$lib/Canvas.svelte'
  import Square from '$lib/Square.svelte'
  import Navigator from '$lib/Navigator.svelte'
  import { currentTime, paused, duration } from '$lib/stores'
  import Labels from '$lib/Labels.svelte'
  import Waveform from '$lib/Waveform.svelte'

  export let data

  console.log('data:', data)

  let audio: HTMLAudioElement
  let audioUrl: string = `https://taejun-allinone-demo.s3.ap-northeast-2.amazonaws.com/audio/${data.id}.mp3`

  onMount(async () => {
    audioUrl = `https://taejun-allinone-demo.s3.ap-northeast-2.amazonaws.com/audio/${data.id}.mp3`
  })

  function handleKeydown(event: KeyboardEvent) {
    if (event.code === 'Space') {
      $paused = !$paused
      event.preventDefault()
    }
  }
</script>

{#if !data.nav}
  <div class="loading">
    <div class="loading__text">Loading...</div>
  </div>
{:else}
  <Labels name="Human" upper labels={data.truths.labels} boundaries={data.truths.segments} />

  <Navigator name="Drum" energy={data.nav.drum} />
  <Navigator name="Bass" energy={data.nav.bass} />
  <Navigator name="Vocal" energy={data.nav.vocal} />
  <Navigator name="Other" energy={data.nav.other} />

  <Labels name="AI" labels={data.inferences.labels} boundaries={data.inferences.segments} />

  <Waveform
    name="Drum"
    wav={data.wav.drum}
    predBeats={data.inferences.beats}
    predDownbeats={data.inferences.downbeats}
    trueBeats={data.truths.beats}
    trueDownbeats={data.truths.downbeats}
  />
  <Waveform
    name="Bass"
    wav={data.wav.bass}
    predBeats={data.inferences.beats}
    predDownbeats={data.inferences.downbeats}
    trueBeats={data.truths.beats}
    trueDownbeats={data.truths.downbeats}
  />
  <Waveform
    name="Vocal"
    wav={data.wav.vocal}
    predBeats={data.inferences.beats}
    predDownbeats={data.inferences.downbeats}
    trueBeats={data.truths.beats}
    trueDownbeats={data.truths.downbeats}
  />
  <Waveform
    name="Other"
    wav={data.wav.other}
    predBeats={data.inferences.beats}
    predDownbeats={data.inferences.downbeats}
    trueBeats={data.truths.beats}
    trueDownbeats={data.truths.downbeats}
  />

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
  {$currentTime}
{/if}

<svelte:window on:keydown={handleKeydown} />
