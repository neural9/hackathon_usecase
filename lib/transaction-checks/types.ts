export interface Transaction {
  date: string;
  description: string;
  amount: number;
  type: "CREDIT" | "DEBIT";
  balance?: number;
  category?: string;
}

export type CheckSeverity = "error" | "warning" | "info";

export interface CheckResult {
  id: string;
  name: string;
  passed: boolean;
  severity: CheckSeverity;
  message: string;
  details?: string[];
}

export interface TransactionCheck {
  id: string;
  name: string;
  severity: CheckSeverity;
  run: (transactions: Transaction[]) => CheckResult;
}
