import { TransactionCheck, Transaction, CheckResult } from "../types";

const BALANCE_ROW_KEYWORDS = [
  "opening balance",
  "closing balance",
  "balance brought forward",
  "balance carried forward",
  "brought forward",
  "carried forward",
  "b/f",
  "c/f",
];

function isBalanceStatementRow(transaction: Transaction): boolean {
  const description = transaction.description.toLowerCase();
  return BALANCE_ROW_KEYWORDS.some((keyword) => description.includes(keyword));
}

export const balanceReconciliationCheck: TransactionCheck = {
  id: "balance-reconciliation",
  name: "Balance Reconciliation",
  severity: "error",
  run: (transactions: Transaction[]): CheckResult => {
    // Filter transactions that have balance information
    const transactionsWithBalance = transactions.filter(
      (t) => t.balance !== undefined
    );

    if (transactionsWithBalance.length < 2) {
      return {
        id: "balance-reconciliation",
        name: "Balance Reconciliation",
        passed: true,
        severity: "info",
        message: "Not enough balance data to verify reconciliation",
      };
    }

    const discrepancies: string[] = [];

    for (let i = 1; i < transactions.length; i++) {
      const current = transactions[i];
      const previous = transactions[i - 1];

      // Skip if either transaction doesn't have balance info
      if (current.balance === undefined || previous.balance === undefined) {
        continue;
      }

      // Skip balance statement rows (opening/closing balance entries)
      if (current.amount === 0 || isBalanceStatementRow(current)) {
        continue;
      }

      // Skip if previous row is a balance statement (use its balance as starting point)
      if (isBalanceStatementRow(previous)) {
        continue;
      }

      // Calculate expected balance based on transaction type
      const amount = current.amount;
      const expectedBalance =
        current.type === "CREDIT"
          ? previous.balance + amount
          : previous.balance - amount;

      // Allow for small floating point differences (within 1 penny)
      const difference = Math.abs(current.balance - expectedBalance);
      if (difference > 0.01) {
        discrepancies.push(
          `Row ${i + 1}: Expected £${expectedBalance.toFixed(2)} but found £${current.balance.toFixed(2)} (difference: £${difference.toFixed(2)})`
        );
      }
    }

    if (discrepancies.length === 0) {
      return {
        id: "balance-reconciliation",
        name: "Balance Reconciliation",
        passed: true,
        severity: "error",
        message: "All balances reconcile correctly",
      };
    }

    return {
      id: "balance-reconciliation",
      name: "Balance Reconciliation",
      passed: false,
      severity: "error",
      message: `${discrepancies.length} balance discrepancy(ies) found`,
      details: discrepancies,
    };
  },
};
