import Link from "next/link";
import { AuthPage } from "@/components/auth/auth-page";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata = { title: "Inscription" };

export default function RegisterPage() {
  return (
    <AuthPage
      title="Créer un compte"
      description="Rejoins Drops pour laisser et découvrir des messages."
      footer={
        <>
          Déjà inscrit ?&nbsp;
          <Link href="/login" className="text-foreground underline underline-offset-4">
            Connecte-toi
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthPage>
  );
}
