import type { Vector2 } from '$lib/components/TrackEditor/types';
import areaVolume from '$lib/assets/data/out_area_volume.json';

// Precompute bounding boxes for all areas
const areaVolumeWithBBox = areaVolume.map((area) => {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const v of area.vertex) {
    if (v.x < minX) minX = v.x;
    if (v.x > maxX) maxX = v.x;
    if (v.y < minY) minY = v.y;
    if (v.y > maxY) maxY = v.y;
  }
  return { ...area, box: { minX, minY, maxX, maxY } };
});

export const getLocationAtPoint = (point: Vector2) => {
  const matchLocations = areaVolumeWithBBox.filter((area) => {
    const inBoundingBox =
      point.x >= area.box.minX &&
      point.x <= area.box.maxX &&
      point.y >= area.box.minY &&
      point.y <= area.box.maxY;
    if (!inBoundingBox) return false;

    let count = 0;
    for (let i = 0; i < area.vertex.length; i += 2) {
      const a = area.vertex[i];
      const b = area.vertex[i + 1];
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
