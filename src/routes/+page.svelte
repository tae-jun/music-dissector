<script lang="ts">
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'
  import { base } from '$app/paths'
  import tracks from '$lib/tracks'
  import { loading } from '$lib/stores'

  $loading = true

  onMount(async () => {
    let selected = tracks[Math.floor(Math.random() * tracks.length)]
    await goto(`${base}/${selected}`)
  })
</script>

<svelte:head>
  <title>Music Dissector</title>
</svelte:head>
