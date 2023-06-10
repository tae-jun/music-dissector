<script lang="ts">
  import { getPlaybackTime } from './AudioContext.svelte'
  import { duration, paused } from './stores'

  let time: string = formatTime(getPlaybackTime())

  $: if (!$paused) {
    animate()
  }

  function formatTime(timeInSeconds: number) {
    const minutes = Math.floor(timeInSeconds / 60)
    const seconds = timeInSeconds - minutes * 60
    return minutes + ':' + seconds.toFixed(1).padStart(4, '0')
  }

  function animate() {
    if (!$paused) requestAnimationFrame(animate)
    time = formatTime(getPlaybackTime())
  }
</script>

<span class="font-mono">{time} / {formatTime($duration)}</span>
