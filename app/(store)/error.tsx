"use client";

import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container-page py-16 text-center">
      <AlertTriangle className="mx-auto h-12 w-12 text-danger" aria-hidden />
      <h1 className="mt-4 text-xl font-bold text-gray-900">
        Something went wrong
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        Please try again. If the problem persists, contact support.
      </p>
      <button onClick={reset} className="btn-primary mt-6">
        Try again
      </button>
    </div>
  );
}
