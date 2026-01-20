import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getOrCreateUser } from "@/lib/user";

export async function POST(request: NextRequest) {
  const user = await getOrCreateUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const formData = await request.formData();
  const files = formData.getAll("files") as File[];

  if (!files || files.length === 0) {
    return NextResponse.json(
      { error: "No files provided" },
      { status: 400 }
    );
  }

  const uploadDir = path.join(process.cwd(), "uploads");
  await mkdir(uploadDir, { recursive: true });

  const uploadedFiles = [];

  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name}`;
    const filePath = path.join(uploadDir, uniqueFilename);

    await writeFile(filePath, buffer);

    uploadedFiles.push({
      filename: uniqueFilename,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
    });
  }

  return NextResponse.json({ files: uploadedFiles });
}
