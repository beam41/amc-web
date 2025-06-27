<script lang="ts">
  import OlMap from '$lib/ui/OlMap/OlMap.svelte';
  import deliveryPoint from '$lib/assets/data/out_delivery_point.json';
  import VectorLayer from 'ol/layer/Vector';
  import VectorSource from 'ol/source/Vector';
  import { Circle, Fill, Stroke, Style } from 'ol/style';
  import { reProjectPoint } from '$lib/ui/OlMap/utils';
  import Point from 'ol/geom/Point';
  import Feature from 'ol/Feature';
  import { onMount } from 'svelte';
  import type { Vector2 } from 'mt-map';

  const [deliPoint, residentPoint] = deliveryPoint.reduce(
    (acc, point) => {
      if (point.type === 'Resident_C') {
        acc[1].push(point);
      } else {
        acc[0].push(point);
      }
      return acc;
    },
    [[] as typeof deliveryPoint, [] as typeof deliveryPoint],
  );

  const computedStyle = getComputedStyle(document.documentElement);

  const deliveryPointLayer = new VectorLayer({
    source: new VectorSource({
      features: deliPoint.map(
        (point) =>
          new Feature({
            geometry: new Point(
              reProjectPoint([point.relativeLocation.x, point.relativeLocation.y]),
            ),
            name: point.name,
          }),
      ),
    }),
    style: new Style({
      image: new Circle({
        radius: 6,
        fill: new Fill({
          color: computedStyle.getPropertyValue('--color-yellow-500'),
        }),
        stroke: new Stroke({
          color: 'black',
          width: 1,
        }),
      }),
    }),
  });

  const residentPointLayer = new VectorLayer({
    source: new VectorSource({
      features: residentPoint.map(
        (point) =>
          new Feature({
            geometry: new Point(
              reProjectPoint([point.relativeLocation.x, point.relativeLocation.y]),
            ),
            name: point.name,
          }),
      ),
    }),
    style: new Style({
      image: new Circle({
        radius: 5,
        fill: new Fill({
          color: computedStyle.getPropertyValue('--color-lime-300'),
        }),
        stroke: new Stroke({
          color: 'black',
          width: 1,
        }),
      }),
    }),
  });

  type Player = {
    name: string;
    coord: [number, number];
  };

  type EventData = Record<string, Vector2>;

  const playerPointSource = new VectorSource({
    features: [] as Feature<Point>[],
  });

  const playerPointLayer = new VectorLayer({
    source: playerPointSource,
    style: new Style({
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
    }),
  });

  onMount(() => {
    const evt = new EventSource('https://server.aseanmotorclub.com/api/player_positions/');

    evt.onmessage = (e) => {
      const data: EventData = JSON.parse(e.data);

      const newPlayers = Object.entries(data).map(([name, coord]) => ({
        name,
        coord: reProjectPoint([coord.x, coord.y]),
      })) as Player[];

      playerPointSource.clear(true);
      playerPointSource.addFeatures(
        newPlayers.map(
          (point) =>
            new Feature({
              geometry: new Point(point.coord),
              name: point.name,
            }),
        ),
      );
    };

    return () => {
      evt.close();
    };
  });

  const layers = $derived([deliveryPointLayer, residentPointLayer, playerPointLayer]);
</script>

<div class="h-full w-full bg-[#375d87]/25">
  <OlMap {layers} class="h-full w-full" zoomClass="left-[unset] top-0" />
</div>
