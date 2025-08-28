"use client";

import { useState } from "react";

export default function SubmitLogPage() {
  const [batchId, setBatchId] = useState("");
  const [step, setStep] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async () => {
    if (!batchId || !step) {
      setError("Batch ID and Step are required");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      let coords: { lat: number; lng: number } | undefined;

      // ✅ Try to fetch user coordinates
      await new Promise<void>((resolve) => {
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              coords = {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
              };
              resolve();
            },
            () => resolve(), // If user denies or fails → just continue without coords
            { enableHighAccuracy: true }
          );
        } else {
          resolve();
        }
      });

      // ✅ Send data to backend
      const res = await fetch("/api/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batchId,
          step,
          location, // optional typed location
          coords, // { lat, lng } if available
        }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setSuccess("✅ Event submitted successfully!");
        setBatchId("");
        setStep("");
        setLocation("");
      }
    } catch (err: any) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">📌 Log Supply Chain Event</h1>

      <input
        type="text"
        placeholder="Batch ID (e.g. BATCH-001)"
        value={batchId}
        onChange={(e) => setBatchId(e.target.value)}
        className="border p-2 mb-2 w-full rounded"
      />

      <input
        type="text"
        placeholder="Step (e.g. Harvested, Shipped)"
        value={step}
        onChange={(e) => setStep(e.target.value)}
        className="border p-2 mb-2 w-full rounded"
      />

      <input
        type="text"
        placeholder="Optional location name (e.g. Kano Farm)"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="border p-2 mb-2 w-full rounded"
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded w-full"
      >
        {loading ? "Submitting..." : "Submit Event"}
      </button>

      {error && <p className="text-red-600 mt-3">❌ {error}</p>}
      {success && <p className="text-green-600 mt-3">{success}</p>}
    </div>
  );
}