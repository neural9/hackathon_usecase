import { getOrCreateUser } from "@/lib/user";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { FileText } from "lucide-react";

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function ApplicationsPage() {
  const user = await getOrCreateUser();

  if (!user) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-8">
        <p>Please sign in to view your applications.</p>
      </main>
    );
  }

  const applications = await prisma.application.findMany({
    where: { userId: user.id },
    include: { files: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
          <p className="text-gray-600">View your business loan applications</p>
        </div>
        <Link
          href="/portal/apply"
          className="rounded-md bg-[#1d8348] px-4 py-2 text-sm font-medium text-white hover:bg-[#166638]"
        >
          New Application
        </Link>
      </div>

      {applications.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-600">You haven&apos;t submitted any applications yet.</p>
            <Link
              href="/portal/apply"
              className="mt-4 inline-block rounded-md bg-[#1d8348] px-4 py-2 text-sm font-medium text-white hover:bg-[#166638]"
            >
              Start your first application
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <Card key={app.id}>
              <CardHeader>
                <CardTitle className="text-lg">{app.name}</CardTitle>
                <CardDescription>
                  Submitted on {app.createdAt.toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date of Birth:</span>
                    <span>{app.dateOfBirth.toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Application ID:</span>
                    <span className="font-mono text-xs">{app.id}</span>
                  </div>
                </div>

                {app.files.length > 0 && (
                  <div className="mt-4 border-t pt-4">
                    <p className="mb-2 text-sm font-medium text-gray-700">
                      Attached Documents ({app.files.length})
                    </p>
                    <ul className="space-y-1">
                      {app.files.map((file) => (
                        <li
                          key={file.id}
                          className="flex items-center gap-2 text-sm text-gray-600"
                        >
                          <FileText className="h-4 w-4" />
                          <span className="truncate">{file.originalName}</span>
                          <span className="text-xs text-gray-400">
                            ({formatFileSize(file.size)})
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
