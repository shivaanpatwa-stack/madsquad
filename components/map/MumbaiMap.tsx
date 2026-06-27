"use client";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from "react-leaflet";

export const AREA_COORDS: Record<string, [number, number]> = {
  Andheri:       [19.1136, 72.8697],
  BKC:           [19.0596, 72.8649],
  Bandra:        [19.0544, 72.8402],
  Powai:         [19.1176, 72.9060],
  "Lower Parel": [18.9929, 72.8288],
  Borivali:      [19.2307, 72.8567],
  Thane:         [19.2183, 72.9781],
  Vashi:         [19.0728, 73.0070],
};

export type MapAreaData = {
  area: string;
  value: number;
  label: string;
  status?: "white-space" | "healthy" | "saturated";
  topSku?: string;
  sellerCount?: number;
};

type Props = {
  mode: "demand" | "network";
  areas: MapAreaData[];
  maxValue: number;
};

export default function MumbaiMap({ mode, areas, maxValue }: Props) {
  const getColor = (area: MapAreaData) => {
    if (mode === "demand") {
      const pct = area.value / Math.max(maxValue, 1);
      if (pct > 0.6) return "#FF6900";
      if (pct > 0.3) return "#FFB800";
      if (pct > 0.05) return "#f9a825";
      return "#9C8870";
    }
    if (area.status === "white-space") return "#FFB800";
    if (area.status === "healthy")     return "#22c55e";
    if (area.status === "saturated")   return "#D62828";
    return "#9C8870";
  };

  const getRadius = (area: MapAreaData) =>
    mode === "demand" ? 14 + (area.value / Math.max(maxValue, 1)) * 22 : 18;

  return (
    <MapContainer
      center={[19.1, 72.92]}
      zoom={11}
      style={{ height: "420px", borderRadius: "16px", zIndex: 0 }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {areas.map((area) => {
        const coords = AREA_COORDS[area.area];
        if (!coords) return null;
        return (
          <CircleMarker
            key={area.area}
            center={coords}
            radius={getRadius(area)}
            pathOptions={{
              fillColor: getColor(area),
              fillOpacity: 0.8,
              color: "white",
              weight: 2,
            }}
          >
            <Tooltip sticky>
              <strong style={{ fontSize: 13 }}>{area.area}</strong>
            </Tooltip>
            <Popup>
              <div style={{ minWidth: 160, fontFamily: "sans-serif" }}>
                <p style={{ fontWeight: 800, fontSize: 14, margin: "0 0 4px" }}>{area.area}</p>
                <p style={{ fontSize: 12, color: "#6B5B45", margin: 0 }}>{area.label}</p>
                {area.topSku && (
                  <p style={{ fontSize: 11, color: "#FF6900", marginTop: 4 }}>🔥 {area.topSku}</p>
                )}
                {area.sellerCount !== undefined && (
                  <p style={{ fontSize: 11, color: "#9C8870", marginTop: 2 }}>
                    {area.sellerCount} seller{area.sellerCount !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
