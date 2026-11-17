import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

async function RedirectIfSignedIn() {
  if (await getCurrentUser()) redirect("/drops");
  return null;
}

type AuthPageProps = {
  title: string;
  description: string;
  footer: React.ReactNode;
  children: React.ReactNode;
};

export function AuthPage({ title, description, footer, children }: AuthPageProps) {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-12">
      <Suspense>
        <RedirectIfSignedIn />
      </Suspense>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
        <CardFooter className="text-sm text-muted-foreground">{footer}</CardFooter>
      </Card>
    </main>
  );
}
