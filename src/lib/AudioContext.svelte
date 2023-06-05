<script context="module" lang="ts">
  import { browser } from '$app/environment'
  import { get } from 'svelte/store'
  import { paused, duration } from '$lib/stores'
  import { BASE_AUDIO_URL } from './config'
  import { onDestroy, onMount } from 'svelte'

  export let audioCtx: AudioContext

  let sources: AudioBufferSourceNode[] = []
  let audioBuffers: AudioBuffer[] = []
  let startTime: number = 0
  let offsetTime: number = 0

  if (browser) {
    audioCtx = new AudioContext()

    paused.subscribe((paused) => {
      if (paused) {
        pausePlaying()
      } else {
        startPlaying()
      }
    })
  }

  function destroySources() {
    sources.forEach((source) => {
      source.stop()
      source.disconnect()
    })
    sources = []
  }

  async function loadAudioBuffer(url: string): Promise<AudioBuffer> {
    const cacheName = 'audio-cache'
    const cacheKey = url

    // Check if response is in cache
    const cache = await caches.open(cacheName)
    let response = await cache.match(cacheKey)

    if (!response) {
      // Fetch response and cache it
      response = await fetch(url)
      await cache.put(cacheKey, response.clone())
    }

    const arrayBuffer = await response.arrayBuffer()
    return await audioCtx.decodeAudioData(arrayBuffer)
  }

  async function loadAudioFiles(urls: string[]) {
    // If there are any currently playing audio sources, stop them and disconnect
    destroySources()

    // Load the new audio buffers
    audioBuffers = await Promise.all(urls.map(loadAudioBuffer))

    // Reset timing variables
    startTime = 0
    offsetTime = 0
    paused.set(true)
    duration.set(audioBuffers[0].duration)
  }

  async function loadTrackAudioFiles(trackId: string) {
    const mixdownUrl = `${BASE_AUDIO_URL}/mixdown/${trackId}.mp3`
    const stemUrls = ['drums', 'bass', 'vocals', 'other'].map(
      (stem) => `${BASE_AUDIO_URL}/demixed/${trackId}/${stem}.mp3`,
    )
    // await loadAudioFiles([mixdownUrl, ...stemUrls])
    // await loadAudioFiles(stemUrls)
    await loadAudioFiles([mixdownUrl])
    // await loadAudioFiles(stemUrls.slice(0, 1))
  }

  function startPlaying() {
    sources = audioBuffers.map((audioBuffer) => {
      let source = audioCtx.createBufferSource()
      source.buffer = audioBuffer
      source.connect(audioCtx.destination)
      console.log('offsetTime', offsetTime)
      source.start(0, offsetTime)
      return source
    })

    startTime = audioCtx.currentTime
    paused.set(false)
  }

  function pausePlaying() {
    sources.forEach((source) => {
      source.stop()
    })

    offsetTime += audioCtx.currentTime - startTime // Add elapsed time to offset
    paused.set(true)
  }

  export function getPlaybackTime(): number {
    if (get(paused)) {
      return offsetTime
    } else {
      return offsetTime + (audioCtx.currentTime - startTime)
    }
  }

  export function seekTo(timeInSeconds: number) {
    destroySources()

    // Set the new offset
    offsetTime = timeInSeconds

    if (!get(paused)) startPlaying()
  }
</script>

<script lang="ts">
  export let trackId: string

  onMount(async () => {
    await loadTrackAudioFiles(trackId)
  })

  onDestroy(() => {
    destroySources()
  })
</script>
