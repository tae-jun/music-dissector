<script lang="ts">
  // The ordering of these imports is critical to your app working properly
  // import '@skeletonlabs/skeleton/themes/theme-skeleton.css'
  import '@skeletonlabs/skeleton/themes/theme-gold-nouveau.css'
  // import '@skeletonlabs/skeleton/themes/theme-crimson.css'

  // If you have source.organizeImports set to true in VSCode, then it will auto change this ordering
  import '@skeletonlabs/skeleton/styles/skeleton.css'
  // Most of your app wide CSS should be put in this file
  import '../app.postcss'
  import { AppShell, AppBar } from '@skeletonlabs/skeleton'

  import { page } from '$app/stores'
  import tracks from '$lib/tracks'
  import { afterNavigate, goto } from '$app/navigation'

  let selected: string = $page.params.track

  afterNavigate(() => {
    selected = $page.params.track ?? selected
  })

  async function redirect(event: Event) {
    await goto(selected)
  }
</script>

<!-- App Shell -->
<AppShell>
  <svelte:fragment slot="header">
    <!-- App Bar -->
    <AppBar gridColumns="grid-cols-3" slotDefault="place-self-center" slotTrail="place-content-end">
      <svelte:fragment slot="lead">
        <a href="/">
          <strong class="text-xl"> Music Dissector </strong>
        </a>
      </svelte:fragment>

      {#if $page.url.pathname !== '/about'}
        <select class="select" bind:value={selected} on:change={redirect}>
          {#each tracks as track}
            <option value={track}>{track}</option>
          {/each}
          <!-- <option value="1">NewJeans - Hype Boy</option>
          <option value="2">Option 2</option>
          <option value="3">Option 3</option>
          <option value="4">Option 4</option>
          <option value="5">Option 5</option> -->
        </select>
      {/if}

      <svelte:fragment slot="trail">
        <a class="btn btn-sm variant-ghost-surface" href="https://github.com/skeletonlabs/skeleton">
          GitHub
        </a>
        <a class="btn btn-sm variant-ghost-surface" href="/about"> About </a>
      </svelte:fragment>
    </AppBar>
  </svelte:fragment>
  <!-- Page Route Content -->
  <slot />
</AppShell>
