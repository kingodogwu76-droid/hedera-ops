"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";
import dynamic from "next/dynamic";

// ✅ Dynamically import map components (Next.js SSR fix)
const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(mod => mod.Popup), { ssr: false });

import "leaflet/dist/leaflet.css";

export default function TracePage() {
  const searchParams = useSearchParams();
  const initialBatchId = searchParams.get("batchId") || "";

  const [batchId, setBatchId] = useState(initialBatchId);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  // 🔄 Fetch history
  const fetchHistory = async (id: string) => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/history?batchId=${id}`);
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setHistory(data.history);
      }
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  // ✅ Auto-load if batchId comes from query
  useEffect(() => {
    if (initialBatchId) {
      fetchHistory(initialBatchId);
    }
  }, [initialBatchId]);

  // ✅ Get first valid coordinate for map center
  const firstCoords = history.find((e) => e.coords)?.coords;

  return (
    <Suspense fallback={<p className="p-6">Loading trace page...</p>}>
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">🌱 Supply Chain Trace</h1>

        <div className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="Enter Batch ID (e.g. BATCH-001)"
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
            className="border p-2 flex-1 rounded"
          />
          <button
            onClick={() => fetchHistory(batchId)}
            disabled={!batchId || loading}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            {loading ? "Loading..." : "Trace"}
          </button>
        </div>

        {/* ✅ QR Code section */}
        {batchId && (
          <div className="mb-6 text-center">
            <p className="mb-2 font-semibold">🔗 Share this Batch</p>
            <QRCodeCanvas
              value={`${window.location.origin}/trace?batchId=${batchId}`}
              size={180}
              className="mx-auto"
            />
            <p className="text-sm text-gray-500 mt-2">
              Scan to view Batch {batchId}
            </p>
          </div>
        )}

        {error && <p className="text-red-600">❌ {error}</p>}

        {/* ✅ Map Section */}
        {firstCoords && (
          <div className="h-96 w-full mb-6">
            <MapContainer
  center={[coords.lat || 0, coords.lng || 0]}
  zoom={13}
  style={{ height: "400px", width: "100%" }}
>
  <TileLayer
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    attribution="© OpenStreetMap contributors"
  />
  <Marker position={[coords.lat, coords.lng]}>
    <Popup>Current Location</Popup>
  </Marker>
</MapContainer>
          </div>
        )}

        {/* ✅ Event history list */}
        <div>
          {history.length === 0 ? (
            <p className="text-gray-500">
              No history yet for {batchId || "this batch"}
            </p>
          ) : (
            <ul className="space-y-4">
              {history.map((event, idx) => (
                <li key={idx} className="border p-4 rounded shadow">
                  <p>
                    <span className="font-semibold">Step:</span> {event.step}
                  </p>
                  <p>
                    <span className="font-semibold">Location:</span>{" "}
                    {event.location || "Unknown"}
                  </p>
                  {event.coords && (
                    <p>
                      <span className="font-semibold">Coordinates:</span>{" "}
                      {event.coords.lat}, {event.coords.lng}
                    </p>
                  )}
                  <p>
                    <span className="font-semibold">Timestamp:</span>{" "}
                    {event.timestamp}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Suspense>
  );
}
