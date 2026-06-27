"use client";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip, Circle } from "react-leaflet";
import type { MapAreaData } from "./MumbaiMap";

export { AREA_COORDS } from "./MumbaiMap";

// Venue-level pins per seller
const VENUE_PINS: Record<string, { name: string; coords: [number, number]; channel: string; tip: string }[]> = {
  "seller-09": [
    { name: "Andheri Gold's Gym",         coords: [19.1170, 72.8570], channel: "Gym",            tip: "Best: 6–8 PM · Flamin' Fun Puffs" },
    { name: "Snap Fitness Andheri West",  coords: [19.1110, 72.8620], channel: "Gym",            tip: "Best: 7–9 AM · Mighty Masala" },
    { name: "Cult.fit Andheri",           coords: [19.1155, 72.8660], channel: "Gym",            tip: "Morning class crowd · try Chaat Corner" },
    { name: "D.G. Ruparel College",       coords: [19.1090, 72.8710], channel: "College",        tip: "Lunch rush 12–2 PM · any spicy SKU" },
    { name: "Andheri Station Stall",      coords: [19.1195, 72.8498], channel: "Metro Stall",    tip: "Evening commuters 5–7 PM" },
  ],
  "seller-01": [
    { name: "Bandra Gold's Gym",          coords: [19.0560, 72.8340], channel: "Gym",            tip: "Best: 7–9 AM · Flamin' Fun Puffs" },
    { name: "Gold's Gym Pali Hill",       coords: [19.0612, 72.8298], channel: "Gym",            tip: "Morning class · Mighty Masala" },
    { name: "St. Andrew's College",       coords: [19.0654, 72.8396], channel: "College",        tip: "Lunch crowd · Chaat Corner Mini" },
    { name: "Lilavati Hospital",          coords: [19.0476, 72.8244], channel: "Hospital",       tip: "Visitor café · Flavoured Raisins" },
    { name: "Birdsong Café",             coords: [19.0531, 72.8279], channel: "Café",           tip: "Afternoon traffic · Millet Bhujia" },
    { name: "Bandra Station Stall",       coords: [19.0544, 72.8396], channel: "Metro Stall",    tip: "Evening rush · any mini SKU" },
  ],
};

const CHANNEL_COLORS: Record<string, string> = {
  Gym:              "#FF6900",
  College:          "#7C3AED",
  Hospital:         "#0EA5E9",
  Café:             "#16A34A",
  "Metro Stall":    "#FFB800",
  "Corporate Office": "#DC2626",
};

const AREA_COORDS: Record<string, [number, number]> = {
  Andheri:       [19.1136, 72.8697],
  BKC:           [19.0596, 72.8649],
  Bandra:        [19.0544, 72.8402],
  Powai:         [19.1176, 72.9060],
  "Lower Parel": [18.9929, 72.8288],
  Borivali:      [19.2307, 72.8567],
  Thane:         [19.2183, 72.9781],
  Vashi:         [19.0728, 73.0070],
};

type Props = {
  areas: MapAreaData[];
  maxValue: number;
  highlightArea?: string;
  sellerId?: string;
};

export default function TerritoryMap({ areas, maxValue, highlightArea, sellerId }: Props) {
  const getColor = (area: MapAreaData) => {
    if (area.status === "white-space") return "#FFB800";
    if (area.status === "healthy")     return "#22c55e";
    if (area.status === "saturated")   return "#D62828";
    return "#9C8870";
  };

  const venuePins = sellerId ? (VENUE_PINS[sellerId] ?? []) : [];

  // Centre map on highlight area or default Mumbai
  const centre: [number, number] = highlightArea && AREA_COORDS[highlightArea]
    ? AREA_COORDS[highlightArea]
    : [19.1, 72.87];

  return (
    <MapContainer
      center={centre}
      zoom={11}
      style={{ height: "340px", zIndex: 0 }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Highlight ring for current seller's zone */}
      {highlightArea && AREA_COORDS[highlightArea] && (
        <Circle
          center={AREA_COORDS[highlightArea]}
          radius={1800}
          pathOptions={{ color: "#FF6900", fillColor: "#FF6900", fillOpacity: 0.07, weight: 2, dashArray: "6 4" }}
        />
      )}

      {/* Area circles */}
      {areas.map((area) => {
        const coords = AREA_COORDS[area.area];
        if (!coords) return null;
        const isHighlight = area.area === highlightArea;
        return (
          <CircleMarker
            key={area.area}
            center={coords}
            radius={isHighlight ? 22 : 14 + (area.value / Math.max(maxValue, 1)) * 16}
            pathOptions={{
              fillColor: getColor(area),
              fillOpacity: isHighlight ? 0.9 : 0.65,
              color: isHighlight ? "#FF6900" : "white",
              weight: isHighlight ? 3 : 1.5,
            }}
          >
            <Tooltip sticky>
              <strong style={{ fontSize: 13 }}>{area.area}</strong>
            </Tooltip>
            <Popup>
              <div style={{ minWidth: 170, fontFamily: "sans-serif", padding: "2px 0" }}>
                <p style={{ fontWeight: 800, fontSize: 14, margin: "0 0 4px", color: "#1A1200" }}>{area.area}</p>
                <p style={{ fontSize: 11, color: "#6B5B45", margin: "0 0 4px" }}>{area.label}</p>
                {area.topSku && <p style={{ fontSize: 11, color: "#FF6900", margin: 0 }}>🔥 {area.topSku}</p>}
              </div>
            </Popup>
          </CircleMarker>
        );
      })}

      {/* Venue-level pins */}
      {venuePins.map((pin) => (
        <CircleMarker
          key={pin.name}
          center={pin.coords}
          radius={7}
          pathOptions={{
            fillColor: CHANNEL_COLORS[pin.channel] ?? "#9C8870",
            fillOpacity: 1,
            color: "white",
            weight: 1.5,
          }}
        >
          <Tooltip sticky>
            <span style={{ fontSize: 12, fontWeight: 700 }}>{pin.name}</span>
          </Tooltip>
          <Popup>
            <div style={{ minWidth: 170, fontFamily: "sans-serif", padding: "2px 0" }}>
              <p style={{ fontWeight: 800, fontSize: 13, margin: "0 0 3px", color: "#1A1200" }}>{pin.name}</p>
              <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 10, background: CHANNEL_COLORS[pin.channel] ?? "#ccc", color: "white" }}>
                {pin.channel}
              </span>
              <p style={{ fontSize: 11, color: "#6B5B45", margin: "6px 0 0" }}>{pin.tip}</p>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
