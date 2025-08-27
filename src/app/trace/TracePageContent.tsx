"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";

export default function TracePage() {
  const searchParams = useSearchParams();
  const initialBatchId = searchParams.get("batchId") || "";

  const [batchId, setBatchId] = useState(initialBatchId);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
        // sort newest → oldest
        setHistory(
          data.history.sort(
            (a: any, b: any) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )
        );
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

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🌱 Supply Chain Trace</h1>

      {/* Input + button */}
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

      {/* ✅ QR Code */}
      {batchId && (
        <div className="mb-6 text-center">
          <p className="mb-2 font-semibold">🔗 Share this Batch</p>
          <QRCodeCanvas
            value={`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/trace?batchId=${batchId}`}
            size={180}
            className="mx-auto"
          />
          <p className="text-sm text-gray-500 mt-2">
            Scan to view Batch {batchId}
          </p>
        </div>
      )}

      {error && <p className="text-red-600">❌ {error}</p>}

      {/* Timeline */}
      <div>
        {history.length === 0 ? (
          <p className="text-gray-500">
            No history yet for {batchId || "this batch"}
          </p>
        ) : (
          <ul className="space-y-4">
            {history.map((event, idx) => (
              <li
                key={idx}
                className="border p-4 rounded shadow bg-white"
              >
                <p>
                  <span className="font-semibold">Step:</span> {event.event}
                </p>
                <p>
                  <span className="font-semibold">Role:</span> {event.role}
                </p>
                <p>
                  <span className="font-semibold">Location:</span>{" "}
                  {event.location || "N/A"}
                </p>
                <p>
                  <span className="font-semibold">Notes:</span>{" "}
                  {event.notes || "—"}
                </p>
                <p className="text-sm text-gray-500">
                  <span className="font-semibold">Timestamp:</span>{" "}
                  {event.timestamp}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}