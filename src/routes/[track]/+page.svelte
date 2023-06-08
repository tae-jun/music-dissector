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
  import WaveformTitle from '$lib/WaveformTitle.svelte'

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
    <div class="grid grid-cols-[auto_5rem] divide-y my-2">
      <div>
        <Labels upper labels={data.truths.labels} boundaries={data.truths.segments} />
      </div>
      <div class="navigator-label" style="border: none">Human</div>

      <div><Navigator energy={data.nav.drum} /></div>
      <div class="navigator-label">Drum</div>

      <div><Navigator energy={data.nav.bass} /></div>
      <div class="navigator-label">Bass</div>

      <div><Navigator energy={data.nav.vocal} /></div>
      <div class="navigator-label">Vocal</div>

      <div><Navigator energy={data.nav.other} /></div>
      <div class="navigator-label">Other</div>

      <div>
        <Labels labels={data.inferences.labels} boundaries={data.inferences.segments} />
      </div>
      <div class="navigator-label">AI</div>
    </div>

    <div class="grid grid-cols-[auto_5rem] divide-y my-2">
      <!-- Waveforms -->
      <div style="border-top-width: 2px">
        <Waveform wav={data.wav.drum} />
      </div>
      <div style="border-top-width: 2px">
        <WaveformTitle index={0} title="Drum" />
      </div>

      <div><Waveform wav={data.wav.bass} /></div>
      <div>
        <WaveformTitle index={1} title="Bass" />
      </div>

      <div><Waveform wav={data.wav.vocal} /></div>
      <div>
        <WaveformTitle index={2} title="Vocal" />
      </div>

      <div style="border-bottom-width: 2px">
        <Waveform wav={data.wav.other} />
        <!-- <WaveformGrid
          predBeats={data.inferences.beats}
          predDownbeats={data.inferences.downbeats}
          trueBeats={data.truths.beats}
          trueDownbeats={data.truths.downbeats}
        /> -->
      </div>
      <div style="border-bottom-width: 2px">
        <WaveformTitle index={3} title="Other" />
      </div>
    </div>

    <AudioContext trackId={$page.params.track} />

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

<style>
  .navigator-label {
    @apply flex items-center justify-start h-full pl-1 font-bold;
  }

  div {
    @apply border-surface-600;
  }
</style>
