<script lang="ts">
  import { transitionDuration } from '$lib/states/transitionDuration.svelte';
  import { fade } from 'svelte/transition';
  import { PointType } from './types';
  import Card from '$lib/ui/Card/Card.svelte';
  import type { Vector2 } from 'mt-map';
  import { getLocationAtPoint } from '$lib/utils/getLocationAtPoint';

  export type HoverInfo = {
    type: (typeof PointType)[keyof typeof PointType];
    name: string | undefined;
    pixelCoord: [number, number];
    coord: Vector2;
  };

  export type HoverInfoTooltipProps = {
    hoverInfo: HoverInfo | undefined;
  };

  const { hoverInfo }: HoverInfoTooltipProps = $props();

  const typeText = $derived.by(() => {
    if (hoverInfo) {
      switch (hoverInfo.type) {
        case PointType.Delivery:
          return 'Delivery Point';
        case PointType.Player:
          return 'Player';
        case PointType.House:
          return 'House';
      }
    }
    return '';
  });

  const locationText = $derived.by(() => {
    if (!hoverInfo) {
      return '';
    }
    
    return getLocationAtPoint(hoverInfo.coord);
  });
</script>

{#if hoverInfo}
  <div
    transition:fade={{ duration: transitionDuration }}
    class="absolute"
    style="left: {hoverInfo.pixelCoord[0] + 10}px; top: {hoverInfo.pixelCoord[1] + 15}px;"
  >
    <Card
      class="!bg-background-900/40 text-text-dark !px-1.5 !py-1 !shadow-white/3 !ring-white/5 backdrop-blur-lg"
    >
      <div class="mb-0.5 text-xs font-semibold whitespace-nowrap">
        {typeText}
      </div>
      <div class="text-sm whitespace-nowrap">
        {hoverInfo.name}
      </div>
      <div class="text-text-dark/60 mt-0.5 text-xs font-semibold whitespace-nowrap">
        {locationText}
      </div>
    </Card>
  </div>
{/if}
