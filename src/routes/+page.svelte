<script lang="ts">
  import { goto } from '$app/navigation'
  import tracks from '$lib/tracks'
  import { onMount } from 'svelte'

  onMount(async () => {
    await goto(tracks[Math.floor(Math.random() * tracks.length)])
  })
</script>
