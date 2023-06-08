<script lang="ts">
  import { ProgressRadial } from '@skeletonlabs/skeleton'
  import Icon from '@iconify/svelte'
  import Navigator from '$lib/Navigator.svelte'
  import { paused, mutes, loading } from '$lib/stores'
  import Labels from '$lib/Labels.svelte'
  import Waveform from '$lib/Waveform.svelte'
  import WaveformGrid from '$lib/WaveformGrid.svelte'
  import { page } from '$app/stores'
  import AudioContext from '$lib/AudioContext.svelte'
  import TimeDisplay from '$lib/TimeDisplay.svelte'
  import WaveformTitle from '$lib/WaveformTitle.svelte'

  export let data

  console.log('data', data)

  function handleKeydown(event: KeyboardEvent) {
    if (event.code === 'Space') {
      $paused = !$paused
      event.preventDefault()
    }
  }
</script>

{#key $page.params.track}
  <AudioContext trackId={$page.params.track} />

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

  <div class="relative my-2" style="height: calc(24rem + 7px);">
    <div class="absolute w-full grid grid-cols-[auto_5rem] divide-y">
      <!-- Waveforms -->
      <div style="border-top-width: 2px">
        <Waveform wav={data.wav.drum} />
      </div>
      <div class="z-10" style="border-top-width: 2px">
        <WaveformTitle index={0} title="Drum" />
      </div>

      <div><Waveform wav={data.wav.bass} /></div>
      <div class="z-10">
        <WaveformTitle index={1} title="Bass" />
      </div>

      <div><Waveform wav={data.wav.vocal} /></div>
      <div class="z-10">
        <WaveformTitle index={2} title="Vocal" />
      </div>

      <div style="border-bottom-width: 2px">
        <Waveform wav={data.wav.other} />
      </div>
      <div class="z-10" style="border-bottom-width: 2px">
        <WaveformTitle index={3} title="Other" />
      </div>
    </div>

    <div class="absolute w-full grid grid-cols-[auto_5rem]">
      <div class="w-full" style="height: calc(24rem + 7px);">
        <WaveformGrid
          predBeats={data.inferences.beats}
          predDownbeats={data.inferences.downbeats}
          trueBeats={data.truths.beats}
          trueDownbeats={data.truths.downbeats}
        />
      </div>
    </div>
  </div>

  <!-- Bottom Bar -->
  <div class="flex flex-row items-center justify-start">
    <div class="px-2">
      <button
        type="button"
        class="btn btn-sm h-7 w-10 variant-ghost-primary"
        on:click={() => ($paused = !$paused)}
      >
        {#if $paused}
          <Icon icon="ph:play" />
        {:else}
          <Icon icon="ph:pause" />
        {/if}
      </button>
    </div>

    <div class="grow" />

    <div class="px-1"><TimeDisplay /></div>

    <div class="px-2" style="width: 5rem;">
      <button
        type="button"
        class="btn btn-sm w-10 h-7"
        class:variant-ghost-primary={$mutes.some((m) => m)}
        class:variant-soft-primary={!$mutes.some((m) => m)}
        on:click={() => ($mutes = $mutes.map((m) => false))}
      >
        <span class="text-primary-500 text-lg">
          <Icon icon="carbon:reset-alt" />
        </span>
      </button>
    </div>
  </div>

  <div class="flex flex-row">
    <div class="w-[30rem] p-2">
      <!-- <h2 class="text-2xl font-bold">Scores for {$page.params.track}</h2> -->
      <div class="table-container">
        <table class="table table-compact table-hover">
          <thead>
            <tr>
              <th>Target</th>
              <th>Metric</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Beat</td>
              <td>F-measure</td>
              <td>{data.scores.beat.f1.toFixed(4)}</td>
            </tr>
            <tr>
              <td>Downbeat</td>
              <td>F-measure</td>
              <td>{data.scores.downbeat.f1.toFixed(4)}</td>
            </tr>
            <tr>
              <td>Segment</td>
              <td>F-measure @ 0.5s</td>
              <td>{data.scores.segment['F-measure@0.5'].toFixed(4)}</td>
            </tr>
            <tr>
              <td>Label</td>
              <td>Pairwise F-measure</td>
              <td>{data.scores.segment['Pairwise F-measure'].toFixed(4)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
{/key}

<svelte:window on:keydown={handleKeydown} />

<style>
  .navigator-label {
    @apply flex items-center justify-start h-full pl-1 font-bold;
  }

  div {
    @apply border-surface-600;
  }
</style>
