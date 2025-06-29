<script lang="ts">
  import { transitionDuration } from '$lib/states/transitionDuration.svelte';
  import { fade } from 'svelte/transition';
  import { PointType } from './types';
  import Card from '$lib/ui/Card/Card.svelte';
  import { getLocationAtPoint } from '$lib/utils/getLocationAtPoint';
  import type deliveryPoint from '$lib/assets/data/out_delivery_point.json';
  import type house from '$lib/assets/data/out_house.json';
  import type { Vector2 } from 'mt-map';
  import DeliveryInfo from './DeliveryInfo.svelte';

  export type HoverInfo = {
    name: string | undefined;
    pixelCoord: [number, number];
    coord: Vector2;
  } & (
    | {
        type: (typeof PointType)['Delivery'];
        info: (typeof deliveryPoint)[number];
      }
    | {
        type: (typeof PointType)['Player'];
        info: never;
      }
    | {
        type: (typeof PointType)['House'];
        info: (typeof house)[number];
      }
  );

  export type HoverInfoTooltipProps = {
    hoverInfo: HoverInfo | undefined;
  };

  const { hoverInfo }: HoverInfoTooltipProps = $props();

  const typeText = $derived.by(() => {
    if (!hoverInfo) {
      return '';
    }

    switch (hoverInfo.type) {
      case PointType.Delivery:
        return 'Delivery';
      case PointType.Player:
        return 'Player';
      case PointType.House:
        return 'House';
    }
  });

  const locationText = $derived.by(() => {
    if (!hoverInfo) {
      return '';
    }

    return getLocationAtPoint(hoverInfo.coord);
  });

  const typeHasMoreInfo = $derived.by(() => {
    if (!hoverInfo) {
      return false;
    }
    return hoverInfo.type === PointType.Delivery || hoverInfo.type === PointType.House;
  });

  let tooltip: HTMLDivElement | undefined = $state(undefined);

  const tooltipPosition = $derived.by(() => {
    if (!hoverInfo) {
      return [];
    }
    const position = [hoverInfo.pixelCoord[0] + 10, hoverInfo.pixelCoord[1] + 16];

    const parentBounding = tooltip?.parentElement?.getBoundingClientRect();
    const parentWidth = parentBounding?.width ?? 0;
    const parentHeight = parentBounding?.height ?? 0;

    const tooltipBounding = tooltip?.getBoundingClientRect();
    const tooltipWidth = tooltipBounding?.width ?? 0;
    const tooltipHeight = tooltipBounding?.height ?? 0;

    const widthOverFlow = position[0] + tooltipWidth > parentWidth;
    const heightOverFlow = position[1] + tooltipHeight > parentHeight;

    if (widthOverFlow && heightOverFlow) {
      position[0] -= tooltipWidth;
      position[1] -= tooltipHeight + 24;
    } else if (heightOverFlow) {
      position[1] -= tooltipHeight + 16;
    } else if (widthOverFlow) {
      position[0] -= tooltipWidth;
      position[1] += 4;
    }

    return position;
  });
</script>

{#if hoverInfo}
  <div
    transition:fade={{ duration: transitionDuration }}
    class="absolute"
    style:left="{tooltipPosition[0]}px"
    style:top="{tooltipPosition[1]}px"
    bind:this={tooltip}
  >
    <Card
      class="!bg-background-900/50 text-text-dark flex max-w-60 flex-col gap-0.5 !px-1.5 !py-1 !shadow-white/3 !ring-white/5 backdrop-blur-lg"
    >
      <div class="text-xs font-semibold">
        {typeText}
      </div>
      <div class="text-sm">
        {hoverInfo.name}
      </div>
      {#if hoverInfo.info}
        <div class="my-1 w-full border-t-1 border-neutral-100/20"></div>
        {#if hoverInfo.type === PointType.Delivery}
          <DeliveryInfo {hoverInfo} />
        {/if}
        {#if hoverInfo.type === PointType.House}
          <div class="text-xs">
            <span class="font-semibold">Size:</span>
            {hoverInfo.info.size.x / 100} x {hoverInfo.info.size.y / 100}
          </div>
          <div class="text-xs">
            <span class="font-semibold">Rent Price:</span>
            {hoverInfo.info.cost / 10}
          </div>
          <div class="text-xs">
            <span class="font-semibold">Owner:</span> TODO
          </div>
        {/if}
        <div class="my-1 w-full border-t-1 border-neutral-100/20"></div>
      {/if}
      <div class="text-xs font-semibold text-neutral-200">
        {locationText}
      </div>
      {#if typeHasMoreInfo}
        <div
          class="mt-1 rounded bg-white/10 px-2 py-1 text-center text-xs leading-none font-semibold text-neutral-200"
        >
          Click for more info
        </div>
      {/if}
    </Card>
  </div>
{/if}
