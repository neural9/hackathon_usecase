"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { submitApplication } from "./actions";
import { X, Upload } from "lucide-react";

interface UploadedFile {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
}

export default function ApplyPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    for (const file of files) {
      formData.append("files", file);
    }

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to upload files");
      }

      const data = await response.json();
      setUploadedFiles((prev) => [...prev, ...data.files]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload files");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function removeFile(filename: string) {
    setUploadedFiles((prev) => prev.filter((f) => f.filename !== filename));
  }

  function formatFileSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError(null);

    const result = await submitApplication(formData, uploadedFiles);

    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    router.push("/portal/applications");
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Business Loan Application</CardTitle>
          <CardDescription>
            Fill out the form below to start your business loan application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Supporting Documents</Label>
              <div className="rounded-lg border-2 border-dashed border-gray-300 p-6">
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    Upload supporting documents (e.g., ID, proof of income)
                  </p>
                  <Input
                    ref={fileInputRef}
                    id="files"
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    disabled={isUploading}
                    className="max-w-xs"
                  />
                  {isUploading && (
                    <p className="text-sm text-gray-500">Uploading...</p>
                  )}
                </div>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-gray-700">
                    Uploaded files ({uploadedFiles.length}):
                  </p>
                  <ul className="space-y-2">
                    {uploadedFiles.map((file) => (
                      <li
                        key={file.filename}
                        className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900">
                            {file.originalName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(file.filename)}
                          className="ml-2 rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                          aria-label={`Remove ${file.originalName}`}
                          title="Remove file"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/portal")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isUploading}
                className="bg-[#1d8348] hover:bg-[#166638]"
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
