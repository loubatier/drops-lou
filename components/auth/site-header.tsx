import { Suspense } from "react";
import Link from "next/link";
import { RealtimeStatus } from "@/components/realtime/realtime-status";
import { UserMenu, UserMenuFallback } from "@/components/auth/user-menu";

export function SiteHeader() {
  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between gap-4 px-4">
        <Link href="/" className="text-base font-semibold tracking-tight">
          Drops
        </Link>
        <div className="flex items-center gap-4">
          <RealtimeStatus />
          <Suspense fallback={<UserMenuFallback />}>
            <UserMenu />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
