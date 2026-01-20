import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getOrCreateUser } from "@/lib/user";

const anthropic = new Anthropic();

interface Transaction {
  date: string;
  description: string;
  amount: number;
  type: "CREDIT" | "DEBIT";
  balance?: number;
  category?: string;
}

export async function POST(request: NextRequest) {
  const user = await getOrCreateUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { question, transactions } = await request.json();

  if (!question || !transactions) {
    return NextResponse.json(
      { error: "Question and transactions are required" },
      { status: 400 }
    );
  }

  const transactionSummary = (transactions as Transaction[])
    .map(
      (t, i) =>
        `${i + 1}. ${t.date} | ${t.description} | ${t.type} | £${t.amount.toFixed(2)} | ${t.category || "Uncategorized"}${t.balance !== undefined ? ` | Balance: £${t.balance.toFixed(2)}` : ""}`
    )
    .join("\n");

  const systemPrompt = `You are a financial analyst assistant helping to review bank transaction data for a loan application. You have access to the applicant's transaction history and should answer questions about their financial behavior.

Be concise but thorough. When citing specific transactions, mention the date and description. If you identify concerns (like gambling, irregular income, etc.), flag them clearly.

Here are the transactions you're analyzing:

Date | Description | Type | Amount | Category | Balance
${transactionSummary}

Total transactions: ${transactions.length}
Total credits: £${(transactions as Transaction[]).filter((t) => t.type === "CREDIT").reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
Total debits: £${(transactions as Transaction[]).filter((t) => t.type === "DEBIT").reduce((sum, t) => sum + t.amount, 0).toFixed(2)}`;

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: question,
      },
    ],
  });

  const responseText =
    message.content[0].type === "text" ? message.content[0].text : "";

  return NextResponse.json({
    answer: responseText,
  });
}
