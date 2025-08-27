"use client";

import { useState } from "react";

export default function Home() {
  const [batchId, setBatchId] = useState("FARM-001");
  const [role, setRole] = useState<"farmer" | "distributor" | "retailer">("farmer");
  const [event, setEvent] = useState<"harvested" | "shipped" | "arrived" | "stocked">("harvested");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting...");
    try {
      const res = await fetch("/api/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchId, role, event, location, notes }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus(`✅ submitted (topic ${data.topicId})`);
      } else {
        setStatus(`❌ ${data.error}`);
      }
    } catch {
      setStatus("❌ network error");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <form
        onSubmit={submit}
        className="w-full max-w-xl bg-white rounded-2xl shadow p-6 space-y-4"
      >
        <h1 className="text-2xl font-bold">🚜 Farm Supply Transparency</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col">
            <span className="text-sm text-gray-600 mb-1">Batch ID</span>
            <input
              className="border rounded-xl p-2"
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              placeholder="FARM-001"
              required
            />
          </label>

          <label className="flex flex-col">
            <span className="text-sm text-gray-600 mb-1">Role</span>
            <select
              className="border rounded-xl p-2"
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
            >
              <option value="farmer">farmer</option>
              <option value="distributor">distributor</option>
              <option value="retailer">retailer</option>
            </select>
          </label>

          <label className="flex flex-col">
            <span className="text-sm text-gray-600 mb-1">Event</span>
            <select
              className="border rounded-xl p-2"
              value={event}
              onChange={(e) => setEvent(e.target.value as any)}
            >
              <option value="harvested">harvested</option>
              <option value="shipped">shipped</option>
              <option value="arrived">arrived</option>
              <option value="stocked">stocked</option>
            </select>
          </label>

          <label className="flex flex-col">
            <span className="text-sm text-gray-600 mb-1">Location (optional)</span>
            <input
              className="border rounded-xl p-2"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Village X"
            />
          </label>
        </div>

        <label className="flex flex-col">
          <span className="text-sm text-gray-600 mb-1">Notes (optional)</span>
          <textarea
            className="border rounded-xl p-2"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Quality checked, organic, etc."
          />
        </label>

        <button
          type="submit"
          className="px-6 py-3 bg-green-600 text-white rounded-2xl shadow hover:bg-green-700"
        >
          Submit Event
        </button>

        <p className="text-sm text-gray-700">{status}</p>
      </form>
    </main>
  );
}