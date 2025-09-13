import React, { useEffect } from 'react';
import { MapContainer, TileLayer, ZoomControl, useMap } from 'react-leaflet';

import { findStatePath, indiaViewBox } from '../lib/indiaGeo';

import type { LatLngExpression } from 'leaflet';

import 'leaflet/dist/leaflet.css';

type Props = {
  center?: LatLngExpression;
  zoom?: number;
  className?: string;
  style?: React.CSSProperties;
  selectedState?: string;
};

export default function MapView({
  center = [22.9734, 78.6569],
  zoom = 5,
  className,
  style,
  selectedState,
}: Props) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      zoomControl={false}
      scrollWheelZoom={true}
      className={className}
      style={{ height: '100%', width: '100%', ...style }}
    >
      <TileLayer
        attribution='&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      />
      {selectedState ? <FitToState name={selectedState} /> : <ResetToIndia active />}
      <ZoomControl position="bottomright" />
    </MapContainer>
  );
}

function FitToState({ name }: { name: string }) {
  const map = useMap();

  useEffect(() => {
    const d = findStatePath(name);
    if (!d) return;
    // Compute bbox in SVG coordinates
    const svgNS = 'http://www.w3.org/2000/svg';
    const tmp = document.createElementNS(svgNS, 'svg');
    const p = document.createElementNS(svgNS, 'path');
    p.setAttribute('d', d);
    tmp.appendChild(p);
    tmp.setAttribute('width', '0');
    tmp.setAttribute('height', '0');
    tmp.style.position = 'absolute';
    tmp.style.left = '-9999px';
    document.body.appendChild(tmp);
    try {
      const bbox = p.getBBox();
  // Approximate conversion using indiaViewBox and lat/lon bounds
  const [vx, vy, vw, vh] = indiaViewBox;
  const indiaX: [number, number] = [vx, vx + vw];
  const indiaY: [number, number] = [vy, vy + vh];
  const indiaLon: [number, number] = [68, 97];
  const indiaLat: [number, number] = [37, 8]; // SVG y grows downwards
      const lon = (x: number) => indiaLon[0] + (x - indiaX[0]) * (indiaLon[1] - indiaLon[0]) / (indiaX[1] - indiaX[0]);
      const lat = (y: number) => indiaLat[0] + (y - indiaY[0]) * (indiaLat[1] - indiaLat[0]) / (indiaY[1] - indiaY[0]);
      const west = lon(bbox.x);
      const east = lon(bbox.x + bbox.width);
      const north = lat(bbox.y);
      const south = lat(bbox.y + bbox.height);
      const padLon = (east - west) * 0.2;
      const padLat = (south - north) * 0.2;
      const bounds: [[number, number], [number, number]] = [
        [north - padLat, west - padLon],
        [south + padLat, east + padLon],
      ];
      map.fitBounds(bounds, { animate: true });
    } catch {
      // ignore
    } finally {
      document.body.removeChild(tmp);
    }
  }, [map, name]);

  return null;
}

function ResetToIndia({ active }: { active: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (!active) return;
    const bounds: [[number, number], [number, number]] = [
      [8, 68],
      [37, 97],
    ];
    map.fitBounds(bounds, { animate: true });
  }, [active, map]);
  return null;
}
