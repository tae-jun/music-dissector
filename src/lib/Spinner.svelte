<script lang="ts">
  import { ProgressRadial } from '@skeletonlabs/skeleton'
  import { loading } from '$lib/stores'
</script>

{#if $loading}
  <div
    class="absolute w-screen h-screen bg-surface-900 z-20 flex flex-col items-center justify-center"
  >
    <ProgressRadial stroke={20} meter="stroke-primary-500" track="stroke-primary-500/30" />
    <div class="h-20" />
  </div>
{/if}
