<script lang="ts">
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'
  import tracks from '$lib/tracks'
  import { loading } from '$lib/stores'

  $loading = true

  onMount(async () => {
    await goto(tracks[Math.floor(Math.random() * tracks.length)])
  })
</script>
