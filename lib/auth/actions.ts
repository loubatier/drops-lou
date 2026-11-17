"use server";

import { redirect } from "next/navigation";
import { api, ApiError } from "@/lib/api/client";
import {
  authHeaders,
  clearSession,
  setSession,
  type AuthResponse,
} from "@/lib/auth/session";

export type FormState = {
  message?: string;
  fields?: Record<string, string[]>;
  values?: Record<string, string>;
};

const text = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
};

function failure(error: unknown, values: Record<string, string>): FormState {
  if (error instanceof ApiError) {
    return { message: error.message, fields: error.fields, values };
  }
  return { message: "Une erreur est survenue. Réessaie.", values };
}

export async function login(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const loginValue = text(formData, "login");
  const password = String(formData.get("password") ?? "");
  const values = { login: loginValue };

  if (!loginValue || !password) {
    return {
      message: "Renseigne ton identifiant et ton mot de passe.",
      values,
    };
  }

  try {
    const auth = await api.post<AuthResponse>("/auth/login", {
      body: { login: loginValue, password },
    });
    await setSession(auth);
  } catch (error) {
    return failure(error, values);
  }

  redirect("/drops");
}

export async function register(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = {
    username: text(formData, "username"),
    displayName: text(formData, "displayName"),
    email: text(formData, "email"),
  };
  const password = String(formData.get("password") ?? "");

  try {
    const auth = await api.post<AuthResponse>("/auth/register", {
      body: { ...values, password },
    });
    await setSession(auth);
  } catch (error) {
    return failure(error, values);
  }

  redirect("/drops");
}

export async function logout() {
  try {
    await api.post("/auth/logout", { headers: await authHeaders() });
  } catch {}
  await clearSession();
  redirect("/");
}
