"use server";

import { authGuard } from "@/actions/auth";
import { db, deleteImage, putImage } from "@/actions/lib";
import { clerkClient } from "@clerk/nextjs";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cache } from "react";
import { z } from "zod";

const UserSchema = z.object({
  name: z.string().max(240),
});

export const currentUser = cache(async () => {
  const uid = authGuard();
  const user = await db.user.findUnique({
    where: {
      id: uid,
    },
  });

  if (!user) {
    return null;
  }

  return user;
});

export const createUser = async (formData: FormData) => {
  const id = authGuard();
  const validatedData = UserSchema.parse({
    name: formData.get("name"),
  });

  const data: Prisma.UserUncheckedCreateInput = {
    ...validatedData,
    id,
  };

  const profileImageDataURL = formData.get("profileImageURL") as string;

  if (profileImageDataURL) {
    data.profileImageURL = await putImage(profileImageDataURL, `users/${id}/avatar.png`);
  }

  await db.user.create({
    data,
  });

  await clerkClient.users.updateUserMetadata(id, {
    publicMetadata: {
      onboarded: true,
    },
  });

  revalidatePath("/");
  redirect("/");
};

export const updateUser = async (formData: FormData) => {
  const id = authGuard();
  const validatedData = UserSchema.parse({
    name: formData.get("name"),
  });
  const data: Prisma.UserUncheckedUpdateInput = {
    ...validatedData,
  };

  const profileAction = formData.get("profileImage-action") as string;
  const profileImageDataURL = formData.get("profileImage") as string;

  if (profileImageDataURL && profileAction === "save") {
    data.profileImageURL = await putImage(profileImageDataURL, `users/${id}/avatar.png`);
  } else if (profileAction === "delete") {
    data.profileImageURL = null;
    await deleteImage(`users/${id}/avatar.png`);
  }

  await db.user.update({
    where: {
      id,
    },
    data,
  });

  revalidatePath("/");
};

export const deleteUser = async () => {
  const id = authGuard();

  await db.user.delete({
    where: {
      id,
    },
  });

  await deleteImage(`users/${id}/avatar.png`);

  revalidatePath("/");
};
