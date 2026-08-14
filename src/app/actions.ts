"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { isAllowedPersonaId, PERSONA_COOKIE } from "@/lib/auth/session";

export async function switchPersona(formData: FormData): Promise<void> {
  const personaId = formData.get("personaId");
  if (typeof personaId !== "string" || !isAllowedPersonaId(personaId)) {
    return;
  }
  const store = await cookies();
  store.set(PERSONA_COOKIE, personaId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  revalidatePath("/", "layout");
}
