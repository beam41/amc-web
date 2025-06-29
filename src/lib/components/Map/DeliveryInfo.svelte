<script lang="ts">
  import { PointType } from './types';
  import type deliveryPoint from '$lib/assets/data/out_delivery_point.json';
  import type { Vector2 } from 'mt-map';
  import { uniq } from 'lodash-es';
  import cargoName from '$lib/assets/data/cargo_name.json';

  type storageItem = {
    type?: string;
    key?: string;
    value: number;
    maxStorage: number;
  };

  export type HoverInfo = {
    name: string | undefined;
    pixelCoord: [number, number];
    coord: Vector2;
    type: (typeof PointType)['Delivery'];
    info: (typeof deliveryPoint)[number];
  };

  export type HoverInfoTooltipProps = {
    hoverInfo: HoverInfo;
  };

  const { hoverInfo }: HoverInfoTooltipProps = $props();

  const supplyText = $derived.by(() => {
    if (!hoverInfo) {
      return '';
    }
    return uniq(hoverInfo.info.prod
      ?.map((prod) => {
        const prodOutput = prod as { output: storageItem[] | undefined };

        return prodOutput.output
          ?.map((item) => cargoName.type[item.type] || cargoName.key[item.key])
          .join(', ');
      })
      .filter((item) => item)
      .sort())
      .join(', ');
  });

  const demandText = $derived.by(() => {
    if (!hoverInfo) {
      return '';
    }
    let prodDemand =
      hoverInfo.info.prod
        ?.map((prod) => {
          const prodInput = prod as { input: storageItem[] | undefined };

          return prodInput.input?.map(
            (item) => cargoName.type[item.type] || cargoName.key[item.key],
          );
        })
        .flat() ?? [];

    let realDemand =
      (hoverInfo.info.demand as storageItem[] | undefined)?.map((item) => {
        return cargoName.type[item.type] || cargoName.key[item.key];
      }) ?? [];

    return uniq([...prodDemand, ...realDemand])
      .filter((item) => item)
      .filter(Boolean)
      .sort()
      .join(', ');
  });
</script>

{#if supplyText}
  <div class="text-xs">
    <span class="font-semibold">Supply:</span>
    {supplyText}
  </div>
{/if}
{#if demandText}
  <div class="text-xs">
    <span class="font-semibold">Demand:</span>
    {demandText}
  </div>
{/if}
