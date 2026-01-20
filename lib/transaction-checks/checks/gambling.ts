import { TransactionCheck, Transaction, CheckResult } from "../types";

const GAMBLING_KEYWORDS = [
  "bet365",
  "betfair",
  "paddy power",
  "paddypower",
  "william hill",
  "williamhill",
  "ladbrokes",
  "coral",
  "betfred",
  "skybet",
  "sky bet",
  "888",
  "unibet",
  "betway",
  "bwin",
  "pokerstars",
  "poker stars",
  "casino",
  "gambling",
  "lottery",
  "lotto",
  "national lottery",
  "scratch card",
  "scratchcard",
  "bookmaker",
  "bookie",
  "betting",
  "wager",
  "slots",
  "roulette",
  "blackjack",
  "sportingbet",
  "betvictor",
  "tombola",
  "gala bingo",
  "mecca bingo",
  "foxy bingo",
];

function isGamblingTransaction(transaction: Transaction): boolean {
  const description = transaction.description.toLowerCase();
  const category = transaction.category?.toLowerCase() || "";

  if (category === "gambling") {
    return true;
  }

  return GAMBLING_KEYWORDS.some(
    (keyword) => description.includes(keyword) || category.includes(keyword)
  );
}

export const gamblingCheck: TransactionCheck = {
  id: "gambling",
  name: "Gambling Activity",
  severity: "error",
  run: (transactions: Transaction[]): CheckResult => {
    const gamblingTransactions = transactions.filter(isGamblingTransaction);

    if (gamblingTransactions.length === 0) {
      return {
        id: "gambling",
        name: "Gambling Activity",
        passed: true,
        severity: "error",
        message: "No gambling transactions detected",
      };
    }

    const totalAmount = gamblingTransactions.reduce(
      (sum, t) => sum + t.amount,
      0
    );

    return {
      id: "gambling",
      name: "Gambling Activity",
      passed: false,
      severity: "error",
      message: `${gamblingTransactions.length} gambling transaction(s) detected`,
      details: gamblingTransactions.map(
        (t) =>
          `${new Date(t.date).toLocaleDateString()}: ${t.description} - £${t.amount.toFixed(2)}`
      ),
    };
  },
};
