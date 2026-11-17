import Link from "next/link";
import { LogInIcon, LogOutIcon, UserIcon } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { logout } from "@/lib/auth/actions";
import { Button, buttonVariants } from "@/components/ui/button";

export async function UserMenu() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/login" className={buttonVariants({ variant: "ghost", size: "sm" })}>
          <LogInIcon data-icon="inline-start" />
          Connexion
        </Link>
        <Link href="/register" className={buttonVariants({ size: "sm" })}>
          Inscription
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="flex items-center gap-1.5 text-sm">
        <UserIcon aria-hidden className="size-4 text-muted-foreground" />
        <span className="font-medium">{user.displayName}</span>
        <span className="hidden text-muted-foreground sm:inline">@{user.username}</span>
      </span>
      <form action={logout}>
        <Button type="submit" variant="outline" size="sm">
          <LogOutIcon data-icon="inline-start" />
          Déconnexion
        </Button>
      </form>
    </div>
  );
}

export function UserMenuFallback() {
  return <div aria-hidden className="h-7 w-40" />;
}
