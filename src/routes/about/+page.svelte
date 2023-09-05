<script lang="ts">
  import { base } from '$app/paths'
  import { loading } from '$lib/stores'
  import { onMount } from 'svelte'

  onMount(() => {
    $loading = false
  })
</script>

<div class="container h-full mx-auto flex justify-center items-center">
  <div class="text-center flex flex-col items-center">

    <h1 class="h1">
      <span
        class="bg-gradient-to-br from-red-500 to-yellow-500 bg-clip-text text-transparent box-decoration-clone"
      >
        <a href={base || '/'}>Music Dissector</a>
      </span>
    </h1>
    <h3 class="h3">An Interactive Music Structure Visualizer</h3>

    <div class="flex flex-row space-x-1 pt-4">
      <a href="https://github.com/mir-aidj/all-in-one/">
        <img alt="GitHub repo" src="https://img.shields.io/badge/GitHub-all--in--one-purple?logo=github">
      </a>
      <a href="http://arxiv.org/abs/2307.16425/">
        <img alt="arXiv" src="https://img.shields.io/badge/arXiv-2307.16425-B31B1B" />
      </a>
      <a href="https://huggingface.co/spaces/taejunkim/all-in-one/">
        <img alt="Hugging Face Space" src="https://img.shields.io/badge/%F0%9F%A4%97%20Hugging%20Face-Spaces-f9f107" />
      </a>
      <!-- <a href="https://pypi.org/project/allin1">
        <img alt="PyPI - Version" src="https://img.shields.io/pypi/v/allin1.svg">
      </a>
      <a href="https://pypi.org/project/allin1">
        <img alt="PyPI - Python Version" src="https://img.shields.io/pypi/pyversions/allin1.svg">
      </a> -->
    </div>

    <div class="pt-10">
      <p>
        This is a web app demonstrates <a href="https://github.com/mir-aidj/all-in-one/" class="anchor">All-In-One Music Structure Analyzer</a>,
        which you can install via <a href="https://pypi.org/project/allin1/" class="anchor">pip</a>.
        The models are trained on the <a href="https://github.com/urinieto/harmonixset/" class="anchor">Harmonix Set</a> with 8-fold cross validation.
        The demonstrated tracks are from a test set of a fold.
        You can also try the models on your own tracks at <a href="https://huggingface.co/spaces/taejunkim/all-in-one/" class="anchor">Hugging Face Space</a>.
        For more information, please refer to the <a href="http://arxiv.org/abs/2307.16425/" class="anchor">paper</a>.
      </p>
    </div>

    <div class="pt-10">
      <a class="text-slate-400" href="https://taejun.kim/">
        <i>Taejun Kim</i>
      </a>
    </div>
  </div>
</div>

<style lang="postcss">
  .container {
    max-width: 40rem;
  }

  p {
    text-align: left;
  }
</style>