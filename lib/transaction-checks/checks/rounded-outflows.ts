import { TransactionCheck, Transaction, CheckResult } from "../types";

function isRoundedAmount(amount: number): boolean {
  // Check if the amount is a round number (ends in 0, 00, or 000)
  // Common round amounts: 10, 20, 50, 100, 200, 500, 1000, etc.
  return amount >= 10 && amount % 10 === 0;
}

export const roundedOutflowsCheck: TransactionCheck = {
  id: "rounded-outflows",
  name: "Rounded Number Outflows",
  severity: "warning", // Will be adjusted based on count
  run: (transactions: Transaction[]): CheckResult => {
    const roundedOutflows = transactions.filter(
      (t) => t.type === "DEBIT" && isRoundedAmount(t.amount)
    );

    const count = roundedOutflows.length;

    if (count < 3) {
      return {
        id: "rounded-outflows",
        name: "Rounded Number Outflows",
        passed: true,
        severity: "info",
        message: `${count} rounded outflow(s) detected`,
      };
    }

    if (count < 10) {
      return {
        id: "rounded-outflows",
        name: "Rounded Number Outflows",
        passed: false,
        severity: "warning",
        message: `${count} rounded outflow(s) detected`,
        details: roundedOutflows.map(
          (t) =>
            `${new Date(t.date).toLocaleDateString()}: ${t.description} - £${t.amount.toFixed(2)}`
        ),
      };
    }

    return {
      id: "rounded-outflows",
      name: "Rounded Number Outflows",
      passed: false,
      severity: "error",
      message: `${count} rounded outflow(s) detected`,
      details: roundedOutflows.map(
        (t) =>
          `${new Date(t.date).toLocaleDateString()}: ${t.description} - £${t.amount.toFixed(2)}`
      ),
    };
  },
};
