"use client";

import React, { useEffect, useRef } from "react";
import { RequestResponse } from "@/lib/types";

interface MapProps {
  userLat: number;
  userLng: number;
  confirmedShops: RequestResponse[];
}

export function MapComponent({ userLat, userLng, confirmedShops }: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    // Dynamically load Leaflet client-side
    import("leaflet").then((L) => {
      // Leaflet CSS check
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      if (!mapContainerRef.current) return;

      const map = L.map(mapContainerRef.current).setView([userLat, userLng], 14);
      mapInstanceRef.current = map;

      // Clean OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      // Custom icon for coarse patient location
      const userIcon = L.divIcon({
        className: "custom-user-pin",
        html: `<div style="background-color: #1F4D3A; color: white; border-radius: 50%; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">📍</div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      L.marker([userLat, userLng], { icon: userIcon })
        .addTo(map)
        .bindPopup("<strong>Your Approximate Location</strong><br/><span style='font-size:11px; color:#5B6660;'>Coarsened to ~200m for privacy</span>");

      // 3 km live search boundary circle
      L.circle([userLat, userLng], {
        radius: 3000,
        color: "#1F4D3A",
        fillColor: "#1F4D3A",
        fillOpacity: 0.07,
        weight: 1.5,
        dashArray: "4, 6",
      }).addTo(map).bindPopup("<strong>3 km Search Radius</strong><br/><span style='font-size:11px;'>Notifying all verified, open chemists inside this zone.</span>");

      // Custom icon for confirmed chemist shops (Green)
      const chemistIcon = L.divIcon({
        className: "custom-chem-pin",
        html: `<div style="background-color: #2F7D4F; color: white; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.35);">🏥</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      // Plot confirmed chemist locations
      const markers: any[] = [];
      confirmedShops.forEach((shop, index) => {
        const offsetLat = userLat + (index === 0 ? 0.007 : -0.006 * (index + 1));
        const offsetLng = userLng + (index === 0 ? 0.006 : 0.005 * (index + 1));

        const m = L.marker([offsetLat, offsetLng], { icon: chemistIcon })
          .addTo(map)
          .bindPopup(
            `<div style="font-family: system-ui; padding: 2px;">` +
            `<strong style="font-size: 13px; color: #1C2420;">${shop.chemistShopName}</strong><br/>` +
            `<span style="color:#2F7D4F; font-size:11px; font-weight:bold;">✓ Confirmed in Stock</span><br/>` +
            `<span style="font-size:11px; color: #5B6660;">Distance: ~${shop.chemistDistanceKm} km</span><br/>` +
            `<div style="margin-top: 6px; display: flex; gap: 6px;">` +
            `<a href="tel:${shop.chemistPhone}" style="display:inline-block; padding: 3px 8px; background:#1F4D3A; color:white; border-radius:4px; font-size:11px; text-decoration:none; font-weight:bold;">Call</a>` +
            `<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shop.chemistShopName)}" target="_blank" style="display:inline-block; padding: 3px 8px; background:#F6F3EC; border:1px solid #E4DFD3; color:#1C2420; border-radius:4px; font-size:11px; text-decoration:none; font-weight:bold;">Navigate</a>` +
            `</div></div>`
          );
        markers.push(m);
      });

      // If shops confirmed, open first popup
      if (markers.length > 0) {
        markers[0].openPopup();
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [userLat, userLng, confirmedShops]);

  return (
    <div className="card-base overflow-hidden border border-stone">
      <div className="bg-paper px-4 py-2 border-b border-stone flex items-center justify-between text-xs text-ink-muted">
        <span>Leaflet / OpenStreetMap Live Radar</span>
        <span className="flex items-center gap-1 text-forest font-semibold">
          <span className="w-2 h-2 rounded-full bg-available"></span>
          <span>{confirmedShops.length} Confirmed Nearby</span>
        </span>
      </div>
      <div ref={mapContainerRef} className="w-full h-64 bg-paper z-0" />
    </div>
  );
}
