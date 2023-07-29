<script context="module" lang="ts">
  import { browser } from '$app/environment'
  import { get } from 'svelte/store'
  import { paused, duration, mutes, loading, metronome } from '$lib/stores'
  import { BASE_AUDIO_URL } from './config'
  import { onDestroy, onMount } from 'svelte'

  export let audioCtx: AudioContext

  let sources: AudioBufferSourceNode[] = []
  let gainNodes: GainNode[] = []
  let audioBuffers: AudioBuffer[] = []
  let startTime: number = 0
  let offsetTime: number = 0

  // Metronome related:
  let activeOscillators: OscillatorNode[] = []
  let beats: number[]
  let downbeats: number[]

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

    metronome.subscribe((metronome) => {
      if (metronome && !get(paused)) scheduleBeats()
      else if (!metronome) stopOscillators()
    })
  }

  function destroySources() {
    sources.forEach((source) => {
      source.onended = null
      source.stop()
      source.disconnect()
    })
    gainNodes.forEach((gainNode) => gainNode.disconnect())
    sources = []
    gainNodes = []
  }

  async function loadAudioBuffer(url: string): Promise<AudioBuffer> {
    const response = await fetch(url, { cache: 'force-cache' })
    const arrayBuffer = await response.arrayBuffer()
    return await audioCtx.decodeAudioData(arrayBuffer)
  }

  async function loadAudioFiles(urls: string[]) {
    // If there are any currently playing audio sources, stop them and disconnect
    destroySources()
    stopOscillators()

    // Load the new audio buffers
    audioBuffers = await Promise.all(urls.map(loadAudioBuffer))
  }

  async function loadTrackAudioFiles(trackId: string) {
    loading.set(true)
    duration.set(0)

    const mixdownUrl = `${BASE_AUDIO_URL}/mixdown/${trackId}.mp3`
    const stemUrls = ['drums', 'bass', 'vocals', 'other'].map(
      (stem) => `${BASE_AUDIO_URL}/demixed/${trackId}/${stem}.mp3`,
    )
    await loadAudioFiles([mixdownUrl, ...stemUrls])

    // Reset timing variables
    startTime = audioCtx.currentTime
    offsetTime = 0
    duration.set(audioBuffers[0].duration)
    paused.set(true)
    loading.set(false)
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
    destroySources()

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

    sources[0].onended = () => {
      if (!get(paused)) paused.set(true)
    }

    startTime = audioCtx.currentTime

    if (get(metronome)) scheduleBeats()

    paused.set(false)
  }

  function pausePlaying() {
    destroySources()
    stopOscillators()

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
    // Set the new offset
    offsetTime = timeInSeconds

    startPlaying()
  }

  // -----------------------------------------------------------------------------------------------
  // Metronome related functions
  // -----------------------------------------------------------------------------------------------

  function playOscillator(frequency: number, time: number): void {
    const oscillator = audioCtx.createOscillator()
    const envelope = audioCtx.createGain()

    oscillator.connect(envelope)
    envelope.connect(audioCtx.destination)

    envelope.gain.value = 16
    envelope.gain.exponentialRampToValueAtTime(4, time + 0.001)
    envelope.gain.exponentialRampToValueAtTime(1e-8, time + 0.02)

    oscillator.type = 'sine'
    oscillator.frequency.value = frequency
    oscillator.start(time)
    oscillator.stop(time + 0.3)

    activeOscillators.push(oscillator)
  }

  function stopOscillators(): void {
    activeOscillators.forEach((oscillator: OscillatorNode) => {
      oscillator.stop()
      oscillator.disconnect()
    })
    activeOscillators = []
  }

  function setBeatsAndDownbeats(beats_: number[], downbeats_: number[]): void {
    beats = excludeDownbeats(beats_, downbeats_)
    downbeats = downbeats_
  }

  function scheduleBeats(): void {
    stopOscillators() // stop any currently playing oscillators before scheduling new ones

    const now = audioCtx.currentTime

    for (let beat of beats.filter((b: number) => b >= offsetTime + now - startTime)) {
      playOscillator(BEAT_FREQUENCY, beat - offsetTime + startTime)
    }

    for (let downbeat of downbeats.filter((d: number) => d >= offsetTime)) {
      playOscillator(DOWNBEAT_FREQUENCY, downbeat - offsetTime + startTime)
    }
  }
</script>

<script lang="ts">
  import { BEAT_FREQUENCY, DOWNBEAT_FREQUENCY } from './config'
  import { excludeDownbeats } from './utils'
  export let trackId: string
  export let beats: number[]
  export let downbeats: number[]

  onMount(async () => {
    await loadTrackAudioFiles(trackId)
    setBeatsAndDownbeats(beats, downbeats)
  })

  onDestroy(() => {
    destroySources()
    stopOscillators()
  })
</script>
