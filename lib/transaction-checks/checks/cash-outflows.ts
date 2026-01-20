import { TransactionCheck, Transaction, CheckResult } from "../types";

const CASH_KEYWORDS = [
  "cash",
  "atm",
  "cashpoint",
  "withdrawal",
  "cash withdrawal",
  "link",
];

function isCashOutflow(transaction: Transaction): boolean {
  if (transaction.type !== "DEBIT") return false;

  const description = transaction.description.toLowerCase();
  const category = transaction.category?.toLowerCase() || "";

  return (
    CASH_KEYWORDS.some((keyword) => description.includes(keyword)) ||
    category === "cash" ||
    category === "atm"
  );
}

function getQuarter(date: Date): string {
  const year = date.getFullYear();
  const quarter = Math.floor(date.getMonth() / 3) + 1;
  return `${year}-Q${quarter}`;
}

export const cashOutflowsCheck: TransactionCheck = {
  id: "cash-outflows",
  name: "Cash Withdrawals",
  severity: "warning",
  run: (transactions: Transaction[]): CheckResult => {
    const cashTransactions = transactions.filter(isCashOutflow);

    if (cashTransactions.length === 0) {
      return {
        id: "cash-outflows",
        name: "Cash Withdrawals",
        passed: true,
        severity: "info",
        message: "No cash withdrawals detected",
      };
    }

    // Group by quarter
    const byQuarter: Record<string, Transaction[]> = {};

    for (const t of cashTransactions) {
      const quarter = getQuarter(new Date(t.date));
      if (!byQuarter[quarter]) {
        byQuarter[quarter] = [];
      }
      byQuarter[quarter].push(t);
    }

    // Find quarters with more than 3 cash outflows
    const flaggedQuarters = Object.entries(byQuarter)
      .filter(([, txns]) => txns.length > 3)
      .sort(([a], [b]) => a.localeCompare(b));

    if (flaggedQuarters.length === 0) {
      return {
        id: "cash-outflows",
        name: "Cash Withdrawals",
        passed: true,
        severity: "info",
        message: `${cashTransactions.length} cash withdrawal(s) detected, within normal limits per quarter`,
      };
    }

    const details = flaggedQuarters.map(([quarter, txns]) => {
      const total = txns.reduce((sum, t) => sum + t.amount, 0);
      return `${quarter}: ${txns.length} withdrawals totalling £${total.toFixed(2)}`;
    });

    return {
      id: "cash-outflows",
      name: "Cash Withdrawals",
      passed: false,
      severity: "warning",
      message: `${flaggedQuarters.length} quarter(s) with excessive cash withdrawals (>3)`,
      details,
    };
  },
};
