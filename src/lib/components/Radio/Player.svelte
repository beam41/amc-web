<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { m } from '$lib/paraglide/messages';
  import { startNowPlayingPolling, getStreamUrl } from '$lib/api/radio';
  import Button from '$lib/ui/Button/Button.svelte';
  import Slider from '$lib/ui/Slider/Slider.svelte';
  import PlayerWaveform from './PlayerWaveform.svelte';

  interface Props {
    stationName: string;
  }

  let { stationName = 'My Radio' }: Props = $props();

  let audio: HTMLAudioElement;
  let grillElement: HTMLDivElement;
  let isPlaying = $state<boolean | null>(false);
  let volume = $state(1);

  // Web Audio API variables
  let audioCtx: AudioContext;
  let analyser: AnalyserNode | null = $state(null);

  // Track state
  let currentTrack = $state<string>('Loading...');
  let nowPlayingController: AbortController | null = null;

  // Stream
  const streamUrl = getStreamUrl();

  onMount(() => {
    audioCtx = new AudioContext();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 512;

    const source = audioCtx.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);

    // Start now playing polling
    nowPlayingController = startNowPlayingPolling((track) => {
      currentTrack = track;
    });
  });

  onDestroy(() => {
    nowPlayingController?.abort();
    audioCtx?.close();
  });

  function togglePlay() {
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    if (!isPlaying) audio.play().catch(console.error);
    else audio.pause();
    isPlaying = !isPlaying;
  }

  function onVolume(value: number) {
    audio.volume = +value;
  }

  function handleGrillVolume(vol: number) {
    if (grillElement) {
      const volume = vol;
      const scale = 1 + volume / 400;
      const vibrationIntensity = volume / 200;
      const tx = (Math.random() - 0.5) * vibrationIntensity;
      const ty = (Math.random() - 0.5) * vibrationIntensity;
      const rotate = (Math.random() - 0.5) * vibrationIntensity * 2;

      grillElement.style.transform = `
          translate(${tx}px, ${ty}px)
          rotate(${rotate}deg)
          scale(${scale})
        `;
    }
  }
</script>

<div
  class="radio
           border-3 border-3 max-w-175
           shadow-lg/30 mx-auto
           flex
           max-h-screen w-full flex-col overflow-hidden rounded-lg border-[#5a2c00] bg-[#8b4513] md:h-auto"
>
  <div
    class="border-b-2 border-black/20 bg-[#5a2c00] px-4 py-1.5 text-center font-medium text-[#d2b48c] shadow-lg"
  >
    {stationName}
  </div>

  <div class="flex flex-1 flex-col bg-[#d2b48c] md:flex-row">
    <div
      class="flex h-[40vh] items-center justify-center bg-[#6b3410]
              p-4 [background-image:linear-gradient(135deg,#a58a69_0%,#8a6f52_20%,#a58a69_40%,#8a6f52_60%,#a58a69_80%,#8a6f52_100%)] md:h-auto md:flex-1
              md:border-r-2
              md:border-black/10"
    >
      <div
        bind:this={grillElement}
        class="border-3
                 bg-background-950
                 relative
                 aspect-square
                 h-[85%]
                 overflow-hidden
                 rounded-full
                 border-solid
                 border-[#555]
                 bg-gradient-to-b
                 from-[#333]
                 to-[#111]
                 transition-transform
                 duration-100
                 ease-out
                 [box-shadow:inset_0_0_10px_rgba(0,0,0,0.5)]
                 before:absolute
                 before:inset-0
                 before:content-['']
                 before:[background-image:repeating-linear-gradient(0deg,#444,#444_2px,transparent_2px,transparent_7px),repeating-linear-gradient(90deg,#444,#444_2px,transparent_2px,transparent_7px)]"
      ></div>
    </div>

    <div class=" flex h-[40vh] flex-col p-4 md:h-auto md:flex-1">
      <div
        class="shadow-lg/50 min-h-37.5 mb-2.5 flex h-full flex-[2] items-center justify-center overflow-hidden rounded-md border-2 border-[#5a2c00] bg-black"
      >
        {#if analyser}
          <PlayerWaveform {analyser} grillVolume={(vol) => handleGrillVolume(vol)} />
        {/if}
      </div>
      <div
        class="shadow-lg/40 flex min-h-20 flex-1 flex-col items-center justify-center rounded-md bg-[#5a2c00] p-3 text-[#d2b48c]"
      >
        <div
          class="song-current mb-2.5 text-center font-mono text-sm text-[#aaffaa] [text-shadow:0_0_5px_rgba(170,255,170,0.7)]"
        >
          {currentTrack}
        </div>
        <Button onClick={togglePlay} class="mb-3">
          {isPlaying ? `❚❚ ${m['radio.pause']()}` : `▶ ${m['radio.play']()}`}
        </Button>
        <Slider
          value={volume}
          onChange={(value) => onVolume(value)}
          name="radio_volume"
          min={0}
          max={1}
          size="sm"
          class="w-full"
        />
      </div>
    </div>
  </div>

  <audio bind:this={audio} src={streamUrl} preload="none" crossorigin="anonymous"></audio>
</div>
