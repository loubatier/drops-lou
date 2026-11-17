"use client";

import { useActionState } from "react";
import { login, type FormState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Field } from "@/components/auth/field";

const initialState: FormState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(login, initialState);

  return (
    <form action={action} className="flex flex-col gap-4">
      {state.message && (
        <Alert variant="destructive">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}
      <Field
        name="login"
        label="E-mail ou nom d'utilisateur"
        autoComplete="username"
        defaultValue={state.values?.login}
        errors={state.fields?.login}
        required
      />
      <Field
        name="password"
        label="Mot de passe"
        type="password"
        autoComplete="current-password"
        errors={state.fields?.password}
        required
      />
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Connexion…" : "Se connecter"}
      </Button>
    </form>
  );
}
