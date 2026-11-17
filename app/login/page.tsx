import Link from "next/link";
import { AuthPage } from "@/components/auth/auth-page";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = { title: "Connexion" };

export default function LoginPage() {
  return (
    <AuthPage
      title="Connexion"
      description="Retrouve tes drops et ceux que tu as aimés."
      footer={
        <>
          Pas encore de compte ?&nbsp;
          <Link href="/register" className="text-foreground underline underline-offset-4">
            Inscris-toi
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthPage>
  );
}
