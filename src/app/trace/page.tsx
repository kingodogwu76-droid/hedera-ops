"use client";

import { Suspense } from "react";
import TracePageContent from "./TracePageContent";

export default function TracePage() {
  return (
    <Suspense fallback={<p className="p-6">Loading trace page.....</p>}>
      <TracePageContent />
    </Suspense>
  );
}