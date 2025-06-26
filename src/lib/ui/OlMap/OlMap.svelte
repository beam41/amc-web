<script lang="ts">
  import { onMount } from 'svelte';
  import type { ClassValue } from 'svelte/elements';
  import Map from 'ol/Map.js';
  import View from 'ol/View.js';
  import TileLayer from 'ol/layer/Tile.js';
  import 'ol/ol.css';
  import { Projection } from 'ol/proj';
  import { ImageTile } from 'ol/source';
  import { getCenter } from 'ol/extent';
  import { Zoom } from 'ol/control';
  import clsx from 'clsx';
  import type BaseLayer from 'ol/layer/Base';
  import { MAP_REAL_SIZE } from './utils';

  export type OlMapProps = {
    /**
     * Others layer to display on the map, usually map points. Please use utils/reProjectPoint to convert coordinates
     */
    layers?: BaseLayer[];
    /*
     * The class to apply to the map element
     */
    class?: ClassValue;
    /**
     * The class to apply to ol zoom buttons
     */
    zoomClass?: ClassValue;
    /**
     * The class to apply to ol zoom in button
     */
    zoomInClass?: ClassValue;
    /**
     * The class to apply to ol zoom out button
     */
    zoomOutClass?: ClassValue;
  };

  let target: HTMLDivElement;
  const { class: propsClassName, zoomClass, zoomInClass, zoomOutClass }: OlMapProps = $props();

  onMount(() => {
    const projection = new Projection({
      code: 'customData',
      units: 'pixels',
      extent: [0, 0, MAP_REAL_SIZE, MAP_REAL_SIZE],
      worldExtent: [0, 0, MAP_REAL_SIZE, MAP_REAL_SIZE],
    });

    const zoom = new Zoom({
      className: clsx('ol-zoom', zoomClass),
      zoomInClassName: clsx('ol-zoom-in', zoomInClass),
      zoomOutClassName: clsx('ol-zoom-out', zoomOutClass),
    });

    const map = new Map({
      controls: [zoom],
      layers: [
        new TileLayer({
          source: new ImageTile({
            url: '/map_tiles/{z}_{x}_{y}.avif',
            minZoom: 1,
            maxZoom: 6,
            wrapX: false,
            projection: projection,
          }),
        }),
      ],
      target: target,
      view: new View({
        projection: projection,
        center: getCenter(projection.getExtent()),
        zoom: 1,
        maxZoom: 8,
        extent: [
          0 - MAP_REAL_SIZE,
          0 - MAP_REAL_SIZE,
          MAP_REAL_SIZE + MAP_REAL_SIZE,
          MAP_REAL_SIZE + MAP_REAL_SIZE,
        ],
      }),
    });

    return () => {
      map.setTarget();
    };
  });
</script>

<div class={propsClassName} bind:this={target}></div>
