<script lang="ts">
  import { onMount } from 'svelte';

  interface Props {
    analyser: AnalyserNode;
    grillVolume(vol: number): void;
  }

  // Width and height are no longer needed as props
  let { analyser, grillVolume }: Props = $props();

  let canvas: HTMLCanvasElement;
  let animationId: number;

  onMount(() => {
    const maybeCtx = canvas.getContext('2d');
    if (!maybeCtx) {
      console.error('Failed to get 2D context');
      return;
    }

    const ctx = maybeCtx;
    const freqData = new Uint8Array(analyser.frequencyBinCount);
    const waveData = new Uint8Array(analyser.fftSize);

    // Use a ResizeObserver to automatically handle canvas sizing.
    // This is more robust than passing width/height props.
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      const { width, height } = entry.contentRect;
      const dpr = window.devicePixelRatio || 1;

      // Update the canvas's internal bitmap size for high-res screens
      canvas.width = width * dpr;
      canvas.height = height * dpr;

      // Scale the drawing context so we can use CSS pixels
      ctx.resetTransform();
      ctx.scale(dpr, dpr);
    });

    observer.observe(canvas);

    function draw() {
      animationId = requestAnimationFrame(draw);

      // On each frame, get the canvas's current CSS-driven size
      const { clientWidth: width, clientHeight: height } = canvas;
      if (width === 0 || height === 0) return; // Skip drawing if canvas is not visible

      // --- Grill Volume ---
      analyser.getByteFrequencyData(freqData);
      const avg = freqData.reduce((a, b) => a + b, 0) / freqData.length;
      grillVolume(avg);

      // --- Waveform Drawing ---
      analyser.getByteTimeDomainData(waveData);
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.globalCompositeOperation = 'source-in';
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'hsl(200, 100%, 70%)';
      ctx.beginPath();

      const sliceWidth = width / waveData.length;
      let x = 0;

      for (let i = 0; i < waveData.length; i++) {
        // Normalize waveform data from [0, 255] to [-1, 1]
        const v = waveData[i] / 128.0 - 1.0;
        // Position the y-coordinate vertically centered in the canvas
        const y = height / 2 + (v * height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }
      ctx.stroke();
      ctx.restore();
    }

    draw();

    // The onMount function can return a cleanup function
    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationId);
    };
  });
</script>

<canvas bind:this={canvas} class="block h-auto w-full"></canvas>
