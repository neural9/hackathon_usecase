import { TransactionCheck, Transaction, CheckResult } from "../types";

export const dateSequenceCheck: TransactionCheck = {
  id: "date-sequence",
  name: "Date Sequence",
  severity: "warning",
  run: (transactions: Transaction[]): CheckResult => {
    if (transactions.length < 2) {
      return {
        id: "date-sequence",
        name: "Date Sequence",
        passed: true,
        severity: "warning",
        message: "Not enough transactions to check sequence",
      };
    }

    const outOfOrderPairs: { index: number; current: Date; previous: Date }[] =
      [];

    for (let i = 1; i < transactions.length; i++) {
      const currentDate = new Date(transactions[i].date);
      const previousDate = new Date(transactions[i - 1].date);

      if (currentDate < previousDate) {
        outOfOrderPairs.push({
          index: i,
          current: currentDate,
          previous: previousDate,
        });
      }
    }

    if (outOfOrderPairs.length === 0) {
      return {
        id: "date-sequence",
        name: "Date Sequence",
        passed: true,
        severity: "warning",
        message: "All transactions are in chronological order",
      };
    }

    return {
      id: "date-sequence",
      name: "Date Sequence",
      passed: false,
      severity: "warning",
      message: `${outOfOrderPairs.length} date sequence issue(s) detected`,
      details: outOfOrderPairs.map(
        (pair) =>
          `Row ${pair.index + 1}: ${pair.current.toLocaleDateString()} comes after ${pair.previous.toLocaleDateString()}`
      ),
    };
  },
};
