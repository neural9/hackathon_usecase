"use server";

import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/user";
import { revalidatePath } from "next/cache";

interface UploadedFile {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
}

export async function submitApplication(
  formData: FormData,
  uploadedFiles: UploadedFile[]
) {
  const user = await getOrCreateUser();

  if (!user) {
    return { error: "You must be logged in to submit an application." };
  }

  const name = formData.get("name") as string;
  const dateOfBirthStr = formData.get("dateOfBirth") as string;

  if (!name || !dateOfBirthStr) {
    return { error: "Please fill out all required fields." };
  }

  const dateOfBirth = new Date(dateOfBirthStr);

  if (isNaN(dateOfBirth.getTime())) {
    return { error: "Please enter a valid date of birth." };
  }

  const application = await prisma.application.create({
    data: {
      name,
      dateOfBirth,
      userId: user.id,
      files: {
        create: uploadedFiles.map((file) => ({
          filename: file.filename,
          originalName: file.originalName,
          mimeType: file.mimeType,
          size: file.size,
        })),
      },
    },
    include: {
      files: true,
    },
  });

  revalidatePath("/portal");
  revalidatePath("/portal/applications");

  return { success: true };
}
