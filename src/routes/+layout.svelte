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
  import { base } from '$app/paths'
  import { loading } from '$lib/stores'
  import tracks from '$lib/tracks'
  import { afterNavigate, goto } from '$app/navigation'
  import Spinner from '$lib/Spinner.svelte'

  let selected: string

  afterNavigate(() => {
    selected = $page.params.track ?? selected
  })

  async function redirect(event: Event) {
    $loading = true

    await goto(`${base}/${selected}`)
  }
</script>

<!-- App Shell -->
<AppShell>
  <svelte:fragment slot="header">
    {#if !$page.url.pathname.endsWith('/about')}
      <!-- App Bar -->
      <AppBar
        gridColumns="grid-cols-3"
        slotDefault="place-self-center"
        slotTrail="place-content-end"
      >
        <svelte:fragment slot="lead">
          <a href={base || '/'}>
            <strong class="text-xl"> Music Dissector </strong>
          </a>
        </svelte:fragment>

        <svelte:fragment slot="default">
            <select class="select w-96 py-0.5" bind:value={selected} on:change={redirect}>
              {#each tracks as track}
                <option value={track}>{track}</option>
              {/each}
            </select>
        </svelte:fragment>

        <svelte:fragment slot="trail">
          <a class="btn-bar" href="{base}/about"> About </a>
        </svelte:fragment>
      </AppBar>
    {/if}
  </svelte:fragment>

  <!-- Page Route Content -->
  <Spinner />
  <slot />
</AppShell>

<style>
  .btn-bar {
    @apply px-0.5;
    line-height: 1.25rem;
    border-bottom: 2px solid rgb(var(--color-surface-500));
    transition: all 200ms ease-in-out;
  }
  .btn-bar:hover {
    border-bottom: 2px solid rgb(var(--color-surface-300));
  }
</style>
