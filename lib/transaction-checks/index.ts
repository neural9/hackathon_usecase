import { Transaction, TransactionCheck, CheckResult } from "./types";
import { gamblingCheck } from "./checks/gambling";
import { dateSequenceCheck } from "./checks/date-sequence";
import { roundedOutflowsCheck } from "./checks/rounded-outflows";
import { balanceReconciliationCheck } from "./checks/balance-reconciliation";
import { cashOutflowsCheck } from "./checks/cash-outflows";

export type { Transaction, TransactionCheck, CheckResult, CheckSeverity } from "./types";

// Register all checks here
const allChecks: TransactionCheck[] = [
  gamblingCheck,
  dateSequenceCheck,
  roundedOutflowsCheck,
  balanceReconciliationCheck,
  cashOutflowsCheck,
];

export function runAllChecks(transactions: Transaction[]): CheckResult[] {
  return allChecks.map((check) => check.run(transactions));
}

export function runCheck(
  checkId: string,
  transactions: Transaction[]
): CheckResult | null {
  const check = allChecks.find((c) => c.id === checkId);
  if (!check) return null;
  return check.run(transactions);
}

export function getFailedChecks(results: CheckResult[]): CheckResult[] {
  return results.filter((r) => !r.passed);
}

export function hasFailedChecks(results: CheckResult[]): boolean {
  return results.some((r) => !r.passed);
}

export function getChecksBySeverity(
  results: CheckResult[],
  severity: "error" | "warning" | "info"
): CheckResult[] {
  return results.filter((r) => r.severity === severity);
}

export {
  gamblingCheck,
  dateSequenceCheck,
  roundedOutflowsCheck,
  balanceReconciliationCheck,
  cashOutflowsCheck,
};
