import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { getOrCreateUser } from "@/lib/user";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const user = await getOrCreateUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { filename } = await params;

  // Find the file record to get metadata and verify access
  const fileRecord = await prisma.applicationFile.findFirst({
    where: { filename },
    include: {
      application: {
        select: { userId: true },
      },
    },
  });

  if (!fileRecord) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  // Only allow access if user is the owner or a reviewer
  const isOwner = fileRecord.application.userId === user.id;
  const isReviewer = user.role === "REVIEWER";

  if (!isOwner && !isReviewer) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  try {
    const filePath = path.join(process.cwd(), "uploads", filename);
    const fileBuffer = await readFile(filePath);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": fileRecord.mimeType,
        "Content-Disposition": `attachment; filename="${fileRecord.originalName}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
