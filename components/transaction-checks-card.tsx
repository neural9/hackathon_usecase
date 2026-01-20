"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { CheckResult, CheckSeverity } from "@/lib/transaction-checks";

interface TransactionChecksCardProps {
  results: CheckResult[];
  fileName?: string;
}

function getSeverityStyles(severity: CheckSeverity, passed: boolean) {
  if (passed) {
    return {
      bg: "bg-green-50",
      border: "border-green-200",
      icon: CheckCircle2,
      iconColor: "text-green-600",
      textColor: "text-green-800",
    };
  }

  switch (severity) {
    case "error":
      return {
        bg: "bg-red-50",
        border: "border-red-200",
        icon: XCircle,
        iconColor: "text-red-600",
        textColor: "text-red-800",
      };
    case "warning":
      return {
        bg: "bg-yellow-50",
        border: "border-yellow-200",
        icon: AlertTriangle,
        iconColor: "text-yellow-600",
        textColor: "text-yellow-800",
      };
    case "info":
      return {
        bg: "bg-blue-50",
        border: "border-blue-200",
        icon: Info,
        iconColor: "text-blue-600",
        textColor: "text-blue-800",
      };
  }
}

function CheckResultItem({ result }: { result: CheckResult }) {
  const [expanded, setExpanded] = useState(false);
  const styles = getSeverityStyles(result.severity, result.passed);
  const Icon = styles.icon;

  return (
    <div className={`rounded-lg border ${styles.border} ${styles.bg} p-4`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <Icon className={`h-5 w-5 mt-0.5 ${styles.iconColor}`} />
          <div>
            <h4 className={`font-medium ${styles.textColor}`}>{result.name}</h4>
            <p className={`text-sm ${styles.textColor} opacity-80`}>
              {result.message}
            </p>
          </div>
        </div>
        {result.details && result.details.length > 0 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className={`p-1 rounded hover:bg-black/5 ${styles.textColor}`}
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
      {expanded && result.details && (
        <ul className={`mt-3 ml-8 text-sm ${styles.textColor} space-y-1`}>
          {result.details.map((detail, index) => (
            <li key={index} className="opacity-80">
              {detail}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function TransactionChecksCard({
  results,
  fileName,
}: TransactionChecksCardProps) {
  const failedResults = results.filter((r) => !r.passed);
  const passedResults = results.filter((r) => r.passed);

  const hasErrors = failedResults.some((r) => r.severity === "error");
  const hasWarnings = failedResults.some((r) => r.severity === "warning");

  let cardBorderClass = "border-green-300";
  let cardBgClass = "";

  if (hasErrors) {
    cardBorderClass = "border-red-300";
    cardBgClass = "bg-red-50/50";
  } else if (hasWarnings) {
    cardBorderClass = "border-yellow-300";
    cardBgClass = "bg-yellow-50/50";
  }

  return (
    <Card className={`border-2 ${cardBorderClass} ${cardBgClass}`}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          {hasErrors ? (
            <XCircle className="h-5 w-5 text-red-600" />
          ) : hasWarnings ? (
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
          ) : (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          )}
          Transaction Checks
        </CardTitle>
        <CardDescription>
          {fileName && <span className="font-medium">{fileName}</span>}
          {fileName && " • "}
          {failedResults.length === 0
            ? "All checks passed"
            : `${failedResults.length} issue(s) found`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {failedResults.map((result) => (
          <CheckResultItem key={result.id} result={result} />
        ))}
        {passedResults.map((result) => (
          <CheckResultItem key={result.id} result={result} />
        ))}
      </CardContent>
    </Card>
  );
}
