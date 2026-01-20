import { getOrCreateUser } from "@/lib/user";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Download,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExtractButton } from "./extract-button";
import { runAllChecks, Transaction } from "@/lib/transaction-checks";
import { TransactionChecksCard } from "@/components/transaction-checks-card";
import { TransactionChat } from "@/components/transaction-chat";

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amount);
}

function ExtractionStatusBadge({
  status,
  error,
}: {
  status: string;
  error: string | null;
}) {
  switch (status) {
    case "PENDING":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
          <Clock className="h-3 w-3" />
          Pending
        </span>
      );
    case "PROCESSING":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
          <Loader2 className="h-3 w-3 animate-spin" />
          Processing
        </span>
      );
    case "COMPLETED":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
          <CheckCircle className="h-3 w-3" />
          Extracted
        </span>
      );
    case "FAILED":
      return (
        <span
          className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700"
          title={error || "Extraction failed"}
        >
          <XCircle className="h-3 w-3" />
          Failed
        </span>
      );
    case "SKIPPED":
      return (
        <span
          className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700"
          title={error || "File type not supported"}
        >
          <AlertCircle className="h-3 w-3" />
          Skipped
        </span>
      );
    default:
      return null;
  }
}

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getOrCreateUser();
  const { id } = await params;

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

  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      files: true,
      user: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  });

  if (!application) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-6">
        <Link
          href="/portal/review"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all applications
        </Link>
      </div>

      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{application.name}</CardTitle>
                <CardDescription className="mt-1">
                  Application ID: {application.id}
                </CardDescription>
              </div>
              <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
                Pending Review
              </span>
            </div>
          </CardHeader>
        </Card>

        {/* Applicant Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Applicant Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                <dd className="mt-1 text-gray-900">{application.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Date of Birth
                </dt>
                <dd className="mt-1 text-gray-900">
                  {application.dateOfBirth.toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-gray-900">{application.user.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Account Name
                </dt>
                <dd className="mt-1 text-gray-900">
                  {application.user.name || "Not provided"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Submitted On
                </dt>
                <dd className="mt-1 text-gray-900">
                  {application.createdAt.toLocaleDateString()} at{" "}
                  {application.createdAt.toLocaleTimeString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Last Updated
                </dt>
                <dd className="mt-1 text-gray-900">
                  {application.updatedAt.toLocaleDateString()} at{" "}
                  {application.updatedAt.toLocaleTimeString()}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Uploaded Documents ({application.files.length})
            </CardTitle>
            <CardDescription>
              Supporting documents submitted with this application
            </CardDescription>
          </CardHeader>
          <CardContent>
            {application.files.length === 0 ? (
              <p className="text-sm text-gray-500">
                No documents were uploaded with this application.
              </p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {application.files.map((file) => (
                  <li
                    key={file.id}
                    className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                        <FileText className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">
                            {file.originalName}
                          </p>
                          <ExtractionStatusBadge
                            status={file.extractionStatus}
                            error={file.extractionError}
                          />
                        </div>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(file.size)} • {file.mimeType} •
                          Uploaded {file.createdAt.toLocaleDateString()}
                        </p>
                        {file.extractionStatus === "FAILED" && file.extractionError && (
                          <p className="mt-1 text-xs text-red-600">
                            Error: {file.extractionError}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <ExtractButton
                        fileId={file.id}
                        status={file.extractionStatus}
                      />
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={`/api/files/${file.filename}`}
                          download={file.originalName}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </a>
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Transactions per Document */}
        {application.files.map((file) => {
          const transactions = file.transactions as Transaction[] | null;
          if (!transactions || transactions.length === 0) return null;

          const checkResults = runAllChecks(transactions);

          const totalCredits = transactions
            .filter((t) => t.type === "CREDIT")
            .reduce((sum, t) => sum + t.amount, 0);
          const totalDebits = transactions
            .filter((t) => t.type === "DEBIT")
            .reduce((sum, t) => sum + t.amount, 0);

          return (
            <div key={`transactions-${file.id}`} className="space-y-4">
              <TransactionChecksCard
                results={checkResults}
                fileName={file.originalName}
              />
              <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Transactions from {file.originalName}
                </CardTitle>
                <CardDescription>
                  {transactions.length} transactions extracted •{" "}
                  <span className="text-green-600">
                    {formatCurrency(totalCredits)} in
                  </span>{" "}
                  •{" "}
                  <span className="text-red-600">
                    {formatCurrency(totalDebits)} out
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-white">
                      <tr className="border-b text-left">
                        <th className="pb-3 font-medium text-gray-500">Date</th>
                        <th className="pb-3 font-medium text-gray-500">
                          Description
                        </th>
                        <th className="pb-3 font-medium text-gray-500">
                          Category
                        </th>
                        <th className="pb-3 text-right font-medium text-gray-500">
                          Amount
                        </th>
                        <th className="pb-3 text-right font-medium text-gray-500">
                          Balance
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {transactions.map((transaction, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="py-3 text-gray-900">
                            {new Date(transaction.date).toLocaleDateString()}
                          </td>
                          <td className="py-3 text-gray-900">
                            {transaction.description}
                          </td>
                          <td className="py-3">
                            {transaction.category && (
                              <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                                {transaction.category}
                              </span>
                            )}
                          </td>
                          <td className="py-3 text-right">
                            <span
                              className={`inline-flex items-center gap-1 font-medium ${
                                transaction.type === "CREDIT"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {transaction.type === "CREDIT" ? (
                                <TrendingUp className="h-3 w-3" />
                              ) : (
                                <TrendingDown className="h-3 w-3" />
                              )}
                              {transaction.type === "CREDIT" ? "+" : "-"}
                              {formatCurrency(transaction.amount)}
                            </span>
                          </td>
                          <td className="py-3 text-right text-gray-600">
                            {transaction.balance !== undefined
                              ? formatCurrency(transaction.balance)
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
              <TransactionChat
                transactions={transactions}
                fileName={file.originalName}
              />
            </div>
          );
        })}
      </div>
    </main>
  );
}
