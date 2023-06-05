<script lang="ts">
  import Icon from '@iconify/svelte'
  import Navigator from '$lib/Navigator.svelte'
  import { paused } from '$lib/stores'
  import Labels from '$lib/Labels.svelte'
  import Waveform from '$lib/Waveform.svelte'
  import WaveformGrid from '$lib/WaveformGrid.svelte'
  import { page } from '$app/stores'
  import AudioContext from '$lib/AudioContext.svelte'
  import TimeDisplay from '$lib/TimeDisplay.svelte'

  export let data

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
  {#key $page.params.track}
    <AudioContext trackId={$page.params.track} />

    <Labels name="Human" upper labels={data.truths.labels} boundaries={data.truths.segments} />

    <Navigator name="Drum" energy={data.nav.drum} />
    <Navigator name="Bass" energy={data.nav.bass} />
    <Navigator name="Vocal" energy={data.nav.vocal} />
    <Navigator name="Other" energy={data.nav.other} />

    <Labels name="AI" labels={data.inferences.labels} boundaries={data.inferences.segments} />

    <div class="relative h-96 w-full">
      <div class="absolute w-full">
        <Waveform index={0} name="Drum" wav={data.wav.drum} />
        <Waveform index={1} name="Bass" wav={data.wav.bass} />
        <Waveform index={2} name="Vocal" wav={data.wav.vocal} />
        <Waveform index={3} name="Other" wav={data.wav.other} />
      </div>
      <div class="absolute w-full h-96">
        <WaveformGrid
          predBeats={data.inferences.beats}
          predDownbeats={data.inferences.downbeats}
          trueBeats={data.truths.beats}
          trueDownbeats={data.truths.downbeats}
        />
      </div>
    </div>

    <button type="button" class="btn" on:click={() => ($paused = !$paused)}>
      {#if $paused}
        <Icon icon="ph:play" />
      {:else}
        <Icon icon="ph:pause" />
      {/if}
    </button>

    <TimeDisplay />

    <div>
      Beat F1: {data.scores.beat.f1}
    </div>
    <div>
      Downbeat F1: {data.scores.downbeat.f1}
    </div>
    <div>
      Segment F1 @ 0.5s: {data.scores.segment['F-measure@0.5']}
    </div>
    <div>
      Labeling Pairwise F-measure: {data.scores.segment['Pairwise F-measure']}
    </div>
  {/key}
  <!-- 
  <audio
    src={`https://taejun-allinone-demo.s3.ap-northeast-2.amazonaws.com/audio/${data.id}.mp3`}
    bind:this={audio}
    bind:currentTime={$currentTime}
    bind:paused={$paused}
    bind:duration={$duration}
    on:loadeddata={() => {
      $paused = true
      $currentTime = 0
    }}
  />
   -->
{/if}

<svelte:window on:keydown={handleKeydown} />
