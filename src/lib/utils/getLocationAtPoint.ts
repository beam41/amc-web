import type { Vector2 } from '$lib/components/TrackEditor/types';
import areaVolume from '$lib/assets/data/out_area_volume.json';

const pointInPolygon = (point: Vector2, polygon: Vector2[]): boolean => {
  let count = 0;
  for (let i = 0; i < polygon.length; i += 2) {
    const a = polygon[i];
    const b = polygon[i + 1];
    const y1 = a.y;
    const y2 = b.y;
    const x1 = a.x;
    const x2 = b.x;
    if (y1 > point.y !== y2 > point.y) {
      const intersect = x1 + ((point.y - y1) * (x2 - x1)) / (y2 - y1);
      if (intersect > point.x) {
        count += 1;
      }
    }
  }
  return count % 2 === 1;
};

export const getLocationAtPoint = (point: Vector2) => {
  const matchLocations = areaVolume.filter((area) => {
    return pointInPolygon(point, area.vertex);
  });

  let racetrack: string | undefined;
  let small: string | undefined;
  let large: string | undefined;
  let zone: string | undefined;

  matchLocations.forEach((m) => {
    switch (m.flag) {
      case 'EMTAreaVolumeFlags::RaceTrack':
        racetrack = m.name;
        break;
      case 'EMTAreaVolumeFlags::SmallArea':
        small = m.name;
        break;
      case 'EMTAreaVolumeFlags::LargeArea':
        large = m.name;
        break;
      case 'EMTAreaVolumeFlags::Zone':
        zone = m.name;
        break;
    }
  });

  let result = '';
  if (racetrack) {
    result += racetrack;
  }
  if (small) {
    if (result.length > 0) {
      result += ', ';
    }
    result += small;
  }
  if (large) {
    if (result.length > 0) {
      result += ', ';
    }
    result += large;
  }
  if (zone) {
    if (result.length > 0) {
      result += ', ';
    }
    result += zone;
  }

  return result;
};
