<script lang="ts">
  import OlMap from '$lib/ui/OlMap/OlMap.svelte';
  import VectorLayer from 'ol/layer/Vector';
  import VectorSource from 'ol/source/Vector';
  import { reProjectPoint } from '$lib/ui/OlMap/utils';
  import Point from 'ol/geom/Point';
  import Feature from 'ol/Feature';
  import { onMount } from 'svelte';
  import type { Vector2 } from 'mt-map';
  import Button from '$lib/ui/Button/Button.svelte';
  import Card from '$lib/ui/Card/Card.svelte';
  import type { MapBrowserEvent } from 'ol';
  import { Circle, Fill, Stroke, Style, Text } from 'ol/style';
  import { PointType } from '$lib/components/Map/types';
  import { getPoints as getStaticPoints } from '$lib/components/Map/staticPoints';
  import HoverInfoTooltip, { type HoverInfo } from '$lib/components/Map/HoverInfoTooltip.svelte';

  const { deliveryPointLayer, residentPointLayer, houseLayer } = getStaticPoints();

  const computedStyle = getComputedStyle(document.documentElement);

  type PlayerEventData = Record<string, Vector2>;

  const playerPointStyle = new Style({
    image: new Circle({
      radius: 5,
      fill: new Fill({
        color: computedStyle.getPropertyValue('--color-emerald-400'),
      }),
      stroke: new Stroke({
        color: 'black',
        width: 1,
      }),
    }),
    text: new Text({
      font: `${computedStyle.getPropertyValue('--text-xs')} ${computedStyle.getPropertyValue('--font-sans')}`,
      offsetY: -14,
      fill: new Fill({
        color: 'black',
      }),
      stroke: new Stroke({
        color: 'white',
        width: 3,
      }),
    }),
  });

  const playerPointSource = new VectorSource({
    features: [] as Feature<Point>[],
  });

  const colorEmerald200 = computedStyle.getPropertyValue('--color-emerald-200');
  const colorEmerald400 = computedStyle.getPropertyValue('--color-emerald-400');

  const playerPointLayer = new VectorLayer({
    source: playerPointSource,
    style: (f) => {
      const hover = f.get('hover');
      (playerPointStyle.getImage() as Circle)
        ?.getFill()
        ?.setColor(hover ? colorEmerald200 : colorEmerald400);
      playerPointStyle.getText()?.setText(f.get('name') ?? '');
      return playerPointStyle;
    },
  });

  onMount(() => {
    const evt = new EventSource('https://server.aseanmotorclub.com/api/player_positions/');

    evt.onmessage = (e) => {
      const data: PlayerEventData = JSON.parse(e.data);

      playerPointSource.clear(true);
      playerPointSource.addFeatures(
        Object.entries(data).map(
          ([name, coord]) =>
            new Feature({
              geometry: new Point(reProjectPoint([coord.x, coord.y])),
              name: name,
              type: PointType.Player,
              coord: coord,
            }),
        ),
      );
    };

    return () => {
      evt.close();
    };
  });

  const layers = $derived([deliveryPointLayer, residentPointLayer, houseLayer, playerPointLayer]);

  const layersData = $state([
    {
      name: 'Delivery',
      layer: deliveryPointLayer,
      btnClass: '!bg-yellow-500 !text-text',
      enabled: true,
    },
    {
      name: 'Resident',
      layer: residentPointLayer,
      btnClass: '!bg-lime-300 !text-text',
      enabled: false,
    },
    {
      name: 'House',
      layer: houseLayer,
      btnClass: '!bg-cyan-500 !text-text',
      enabled: true,
    },
    {
      name: 'Player',
      layer: playerPointLayer,
      btnClass: '!bg-emerald-400 !text-text',
      enabled: true,
    },
  ]);

  let hoverPoint: Feature | undefined = undefined;
  let hoverInfo: HoverInfo | undefined = $state(undefined);

  const handlePointerMove = (e: MapBrowserEvent<KeyboardEvent | WheelEvent | PointerEvent>) => {
    hoverInfo = undefined;
    if (hoverPoint) {
      hoverPoint.set('hover', false);
      hoverPoint = undefined;
    }

    e.map.forEachFeatureAtPixel(e.pixel, (feature) => {
      const f = feature as Feature;
      f.set('hover', true);
      hoverInfo = {
        type: f.get('type'),
        name: f.get('name'),
        pixelCoord: e.pixel as [number, number],
        coord: f.get('coord'),
        info: f.get('info'),
      };
      hoverPoint = f;
      return true;
    });
  };
</script>

<div class="relative h-full w-full overflow-hidden bg-[#375d87]">
  <OlMap
    {layers}
    class="h-full w-full"
    zoomClass="!left-[unset] !top-[unset] right-4 bottom-4"
    onPointerMove={handlePointerMove}
  />
  <HoverInfoTooltip {hoverInfo} />
  <Card
    class="!bg-background-900/20 absolute bottom-4 left-4 !p-1.5 !shadow-white/3 !ring-white/5 backdrop-blur-lg"
  >
    <h2 class="text-text-dark mb-1 text-xs">Point of interests (click to hide)</h2>
    <div class="flex flex-wrap gap-2">
      {#each layersData as layer (layer.name)}
        <Button
          class={['!px-2', layer.btnClass, !layer.enabled && 'opacity-50']}
          size="xs"
          onClick={() => {
            layer.enabled = !layer.enabled;
            layer.layer.setVisible(layer.enabled);
          }}
        >
          {layer.name}
        </Button>
      {/each}
    </div>
  </Card>
</div>
