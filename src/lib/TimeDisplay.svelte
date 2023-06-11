<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import { getPlaybackTime } from './AudioContext.svelte'
  import { duration, paused } from './stores'

  let mounted = false
  let requestId: number
  let time: string = formatTime(getPlaybackTime())

  $: if (!$paused) {
    animate()
  }

  onMount(() => {
    mounted = true
  })

  onDestroy(() => {
    mounted = false
    cancelAnimationFrame(requestId)
  })

  function formatTime(timeInSeconds: number) {
    const minutes = Math.floor(timeInSeconds / 60)
    const seconds = timeInSeconds - minutes * 60
    return minutes + ':' + seconds.toFixed(1).padStart(4, '0')
  }

  function animate() {
    if (!mounted) return
    if (!$paused) requestId = requestAnimationFrame(animate)
    time = formatTime(getPlaybackTime())
  }
</script>

<span class="font-mono">{time} / {formatTime($duration)}</span>
