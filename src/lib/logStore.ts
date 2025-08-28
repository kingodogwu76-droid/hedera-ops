// Simple in-memory log store
export type LogEntry = {
  batchId: string;
  step: string;
  location: string;
  coords: { lat: number; lng: number };
  timestamp: string;
};

export const logs: LogEntry[] = [];