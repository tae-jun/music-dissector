<script context="module" lang="ts">
  import { browser } from '$app/environment'
  import { get } from 'svelte/store'
  import { paused, duration, mutes } from '$lib/stores'
  import { BASE_AUDIO_URL } from './config'
  import { onDestroy, onMount } from 'svelte'

  export let audioCtx: AudioContext

  let sources: AudioBufferSourceNode[] = []
  let gainNodes: GainNode[] = []
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

    mutes.subscribe((mutes) => applyMutes(mutes))
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
    await loadAudioFiles([mixdownUrl, ...stemUrls])
  }

  function applyMutes(mutes: boolean[]) {
    // gainNodes are not initialized at the beginning
    if (gainNodes.length === 0) return

    const [mixdownGainNode, ...stemGainNodes] = gainNodes
    const allActivated = mutes.every((mute) => !mute)

    if (allActivated) {
      // Unmute the mixdown gain node
      mixdownGainNode.gain.value = 1
      // Mute all stem gain nodes
      for (const gainNode of stemGainNodes) {
        gainNode.gain.value = 0
      }
    } else {
      // Mute the mixdown gain node
      mixdownGainNode.gain.value = 0
      // Unmute stem gain nodes based on mute values
      for (const [i, mute] of mutes.entries()) {
        stemGainNodes[i].gain.value = mute ? 0 : 1
      }
    }
  }

  function startPlaying() {
    sources = []
    gainNodes = []

    audioBuffers.forEach((audioBuffer) => {
      let source = audioCtx.createBufferSource()
      source.buffer = audioBuffer

      let gainNode = audioCtx.createGain()
      source.connect(gainNode)
      gainNode.connect(audioCtx.destination)

      source.start(0, offsetTime)

      sources.push(source)
      gainNodes.push(gainNode)
    })
    applyMutes(get(mutes))

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
