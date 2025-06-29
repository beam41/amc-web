import deliveryPoint from '$lib/assets/data/out_delivery_point.json';
import house from '$lib/assets/data/out_house.json';
import { reProjectPoint } from '$lib/ui/OlMap/utils';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import WebGLVectorLayer from 'ol/layer/WebGLVector';
import VectorSource from 'ol/source/Vector';
import { PointType } from './types';

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

export const getPoints = () => {
  const deliveryPointLayer = new WebGLVectorLayer({
    source: new VectorSource({
      features: deliPoint.map(
        (point) =>
          new Feature({
            geometry: new Point(reProjectPoint([point.coord.x, point.coord.y])),
            name: point.name,
            type: PointType.Delivery,
            coord: point.coord,
            info: point,
          }),
      ),
    }),
    style: {
      'circle-radius': 6,
      'circle-fill-color': [
        'match',
        ['get', 'hover'],
        1,
        computedStyle.getPropertyValue('--color-yellow-300'),
        computedStyle.getPropertyValue('--color-yellow-500'),
      ],
      'circle-stroke-color': 'black',
      'circle-stroke-width': 1,
    },
  });

  const residentPointLayer = new WebGLVectorLayer({
    visible: false,
    source: new VectorSource({
      features: residentPoint.map(
        (point) =>
          new Feature({
            geometry: new Point(reProjectPoint([point.coord.x, point.coord.y])),
            name: point.name,
            type: PointType.Delivery,
            coord: point.coord,
            info: point,
          }),
      ),
    }),
    style: {
      'circle-radius': 5.5,
      'circle-fill-color': [
        'match',
        ['get', 'hover'],
        1,
        computedStyle.getPropertyValue('--color-lime-100'),
        computedStyle.getPropertyValue('--color-lime-300'),
      ],
      'circle-stroke-color': 'black',
      'circle-stroke-width': 1,
    },
  });

  const houseLayer = new WebGLVectorLayer({
    source: new VectorSource({
      features: house.map(
        (point) =>
          new Feature({
            geometry: new Point(reProjectPoint([point.coord.x, point.coord.y])),
            name: point.name,
            type: PointType.House,
            coord: point.coord,
            info: point,
          }),
      ),
    }),
    style: {
      'circle-radius': 6,
      'circle-fill-color': [
        'match',
        ['get', 'hover'],
        1,
        computedStyle.getPropertyValue('--color-cyan-300'),
        computedStyle.getPropertyValue('--color-cyan-500'),
      ],
      'circle-stroke-color': 'black',
      'circle-stroke-width': 1,
    },
  });

  return { deliveryPointLayer, residentPointLayer, houseLayer };
};
