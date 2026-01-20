import { readFile } from "fs/promises";
import path from "path";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const anthropic = new Anthropic();

interface ExtractedTransaction {
  date: string;
  description: string;
  amount: number;
  type: "CREDIT" | "DEBIT";
  balance?: number;
  category?: string;
}

interface ExtractionResponse {
  transactions: ExtractedTransaction[];
}

export async function extractTransactionsFromFile(fileId: string) {
  // Get the file from the database
  const file = await prisma.applicationFile.findUnique({
    where: { id: fileId },
  });

  if (!file) {
    throw new Error("File not found");
  }

  // Determine if it's a PDF or image and build the appropriate content block
  const isPdf = file.mimeType === "application/pdf";
  const isImage =
    file.mimeType === "image/png" ||
    file.mimeType === "image/jpeg" ||
    file.mimeType === "image/jpg" ||
    file.mimeType === "image/gif" ||
    file.mimeType === "image/webp";

  if (!isPdf && !isImage) {
    console.log(`Skipping unsupported file type: ${file.mimeType}`);
    await prisma.applicationFile.update({
      where: { id: fileId },
      data: {
        extractionStatus: "SKIPPED",
        extractionError: `Unsupported file type: ${file.mimeType}`,
      },
    });
    return { success: false, reason: "Unsupported file type" };
  }

  // Mark as processing
  await prisma.applicationFile.update({
    where: { id: fileId },
    data: { extractionStatus: "PROCESSING", extractionError: null },
  });

  try {
    // Read the file from disk
    const uploadDir = path.join(process.cwd(), "uploads");
    const filePath = path.join(uploadDir, file.filename);
    const fileBuffer = await readFile(filePath);
    const base64Data = fileBuffer.toString("base64");

    const promptText = `Analyze this bank statement or financial document and extract all transactions.

Return a JSON object with a "transactions" array. Each transaction should have:
- date: ISO 8601 date string (YYYY-MM-DD)
- description: string describing the transaction
- amount: positive number (the absolute value of the transaction)
- type: "CREDIT" for money coming in, "DEBIT" for money going out
- balance: the balance after this transaction (if available, otherwise omit)
- category: a category for the transaction (e.g., "Groceries", "Utilities", "Salary", "Transfer", "Entertainment", "Gambling", etc.)

Return ONLY valid JSON, no other text. If you cannot extract any transactions, return: {"transactions": []}

Example response:
{
  "transactions": [
    {"date": "2024-01-15", "description": "TESCO STORES", "amount": 45.67, "type": "DEBIT", "balance": 1234.56, "category": "Groceries"},
    {"date": "2024-01-14", "description": "SALARY ACME INC", "amount": 2500.00, "type": "CREDIT", "balance": 1280.23, "category": "Salary"}
  ]
}`;

    // Call Claude API to extract transactions
    let message;
    if (isPdf) {
      message = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 16384,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "document",
                source: {
                  type: "base64",
                  media_type: "application/pdf",
                  data: base64Data,
                },
              },
              { type: "text", text: promptText },
            ],
          },
        ],
      });
    } else {
      // Handle images
      const imageMediaType =
        file.mimeType === "image/png"
          ? "image/png"
          : file.mimeType === "image/gif"
            ? "image/gif"
            : file.mimeType === "image/webp"
              ? "image/webp"
              : "image/jpeg";
      message = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 16384,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: imageMediaType,
                  data: base64Data,
                },
              },
              { type: "text", text: promptText },
            ],
          },
        ],
      });
    }

    // Parse the response
    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    let extractedData: ExtractionResponse;
    try {
      // Clean up response - remove markdown code blocks if present
      let cleanedResponse = responseText.trim();
      if (cleanedResponse.startsWith("```json")) {
        cleanedResponse = cleanedResponse.slice(7);
      } else if (cleanedResponse.startsWith("```")) {
        cleanedResponse = cleanedResponse.slice(3);
      }
      if (cleanedResponse.endsWith("```")) {
        cleanedResponse = cleanedResponse.slice(0, -3);
      }
      extractedData = JSON.parse(cleanedResponse.trim());
    } catch {
      console.error("Failed to parse Claude response:", responseText);
      await prisma.applicationFile.update({
        where: { id: fileId },
        data: {
          extractionStatus: "FAILED",
          extractionError: "Failed to parse transaction data from document",
        },
      });
      return { success: false, error: "Failed to parse transaction data" };
    }

    // Store transactions JSON in the ApplicationFile record
    await prisma.applicationFile.update({
      where: { id: file.id },
      data: {
        transactions:
          extractedData.transactions as unknown as Prisma.InputJsonValue,
        extractionStatus: "COMPLETED",
        extractionError: null,
      },
    });

    return {
      success: true,
      count: extractedData.transactions.length,
      transactions: extractedData.transactions,
    };
  } catch (error) {
    console.error("Extraction error:", error);
    // Mark as failed with error message
    await prisma.applicationFile.update({
      where: { id: fileId },
      data: {
        extractionStatus: "FAILED",
        extractionError:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
