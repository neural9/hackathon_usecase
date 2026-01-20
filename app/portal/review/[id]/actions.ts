"use server";

import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/user";
import { extractTransactionsFromFile } from "@/lib/extract-transactions";
import { revalidatePath } from "next/cache";

export async function retryExtraction(fileId: string) {
  console.log("[retryExtraction] Starting for fileId:", fileId);

  const user = await getOrCreateUser();

  if (!user) {
    console.log("[retryExtraction] Unauthorized - no user");
    return { error: "Unauthorized" };
  }

  if (user.role !== "REVIEWER") {
    console.log("[retryExtraction] User is not a reviewer:", user.role);
    return { error: "Only reviewers can retry extraction" };
  }

  // Verify the file exists
  const file = await prisma.applicationFile.findUnique({
    where: { id: fileId },
    include: { application: true },
  });

  if (!file) {
    console.log("[retryExtraction] File not found:", fileId);
    return { error: "File not found" };
  }

  console.log("[retryExtraction] Calling extractTransactionsFromFile...");

  // Run the extraction
  const result = await extractTransactionsFromFile(fileId);

  console.log("[retryExtraction] Extraction result:", result);

  // Revalidate the page to show updated status
  revalidatePath(`/portal/review/${file.applicationId}`);

  if (result.success) {
    return { success: true, count: result.count };
  } else {
    return { error: result.error || result.reason || "Extraction failed" };
  }
}
