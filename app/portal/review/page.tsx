import { getOrCreateUser } from "@/lib/user";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, ChevronRight } from "lucide-react";
import Link from "next/link";

export default async function ReviewPage() {
  const user = await getOrCreateUser();

  if (!user) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-8">
        <p>Please sign in to access this page.</p>
      </main>
    );
  }

  if (user.role !== "REVIEWER") {
    return (
      <main className="mx-auto max-w-4xl px-6 py-8">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-600">
              You don&apos;t have permission to access this page.
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Only reviewers can view applications.
            </p>
            <Link
              href="/portal"
              className="mt-4 inline-block rounded-md bg-[#1d8348] px-4 py-2 text-sm font-medium text-white hover:bg-[#166638]"
            >
              Back to Dashboard
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  const applications = await prisma.application.findMany({
    include: {
      files: true,
      user: {
        select: {
          email: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Review Applications</h1>
        <p className="text-gray-600">
          Review submitted business loan applications
        </p>
      </div>

      {applications.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-600">No applications have been submitted yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {applications.map((app) => (
            <Link key={app.id} href={`/portal/review/${app.id}`}>
              <Card className="h-full transition-shadow hover:shadow-md cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base leading-tight">{app.name}</CardTitle>
                    <span className="flex-shrink-0 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                      Pending
                    </span>
                  </div>
                  <CardDescription className="text-xs">
                    {app.createdAt.toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-1 text-sm">
                    <p className="truncate text-gray-600">{app.user.email}</p>
                    <div className="flex items-center gap-1 text-gray-500">
                      <FileText className="h-3.5 w-3.5" />
                      <span className="text-xs">
                        {app.files.length} document{app.files.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
