"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, Play, RotateCcw } from "lucide-react";
import { retryExtraction } from "./actions";

interface ExtractButtonProps {
  fileId: string;
  status: string;
}

export function ExtractButton({ fileId, status }: ExtractButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleExtract = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log("Starting extraction for file:", fileId);
      const result = await retryExtraction(fileId);
      console.log("Extraction result:", result);
      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        setSuccess(`Extracted ${result.count} transactions`);
        // Refresh the page to show the transactions
        router.refresh();
      }
    } catch (err) {
      console.error("Extraction error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show button for completed extractions (unless you want to allow re-extraction)
  if (status === "COMPLETED") {
    return null;
  }

  // Don't show for skipped files
  if (status === "SKIPPED") {
    return null;
  }

  const isRetry = status === "FAILED";
  const isPending = status === "PENDING";

  return (
    <div className="flex flex-col gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={handleExtract}
        disabled={isLoading}
        className={isRetry ? "border-red-200 text-red-700 hover:bg-red-50" : ""}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Extracting...
          </>
        ) : isRetry ? (
          <>
            <RotateCcw className="mr-2 h-4 w-4" />
            Retry
          </>
        ) : isPending ? (
          <>
            <Play className="mr-2 h-4 w-4" />
            Extract
          </>
        ) : (
          <>
            <Play className="mr-2 h-4 w-4" />
            Extract
          </>
        )}
      </Button>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {success && <p className="text-xs text-green-600">{success}</p>}
    </div>
  );
}
