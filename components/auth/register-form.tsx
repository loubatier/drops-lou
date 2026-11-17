"use client";

import { useActionState } from "react";
import { register, type FormState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Field } from "@/components/auth/field";

const initialState: FormState = {};

export function RegisterForm() {
  const [state, action, pending] = useActionState(register, initialState);

  return (
    <form action={action} className="flex flex-col gap-4">
      {state.message && (
        <Alert variant="destructive">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}
      <Field
        name="displayName"
        label="Nom affiché"
        autoComplete="name"
        defaultValue={state.values?.displayName}
        errors={state.fields?.displayName}
        required
      />
      <Field
        name="username"
        label="Nom d'utilisateur"
        autoComplete="username"
        defaultValue={state.values?.username}
        errors={state.fields?.username}
        required
      />
      <Field
        name="email"
        label="E-mail"
        type="email"
        autoComplete="email"
        defaultValue={state.values?.email}
        errors={state.fields?.email}
        required
      />
      <Field
        name="password"
        label="Mot de passe"
        type="password"
        autoComplete="new-password"
        errors={state.fields?.password}
        required
      />
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Création…" : "Créer mon compte"}
      </Button>
    </form>
  );
}
