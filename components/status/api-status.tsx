import { connection } from "next/server";
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  XCircleIcon,
  type LucideIcon,
} from "lucide-react";
import { API_URL } from "@/lib/drops";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshButton } from "./refresh-button";

const SLOW_THRESHOLD_MS = 800;
const TIMEOUT_MS = 5000;

type Level = "operational" | "degraded" | "down";

type Check = {
  level: Level;
  httpStatus: number | null;
  latencyMs: number | null;
  checkedAt: Date;
};

const LEVELS: Record<
  Level,
  {
    label: string;
    description: string;
    icon: LucideIcon;
    badge: "secondary" | "outline" | "destructive";
    tone: string;
  }
> = {
  operational: {
    label: "En ligne",
    description: "L'API répond normalement.",
    icon: CheckCircle2Icon,
    badge: "secondary",
    tone: "text-emerald-600 dark:text-emerald-400",
  },
  degraded: {
    label: "Dégradé",
    description: "L'API répond, mais plus lentement que d'habitude.",
    icon: AlertTriangleIcon,
    badge: "outline",
    tone: "text-amber-600 dark:text-amber-400",
  },
  down: {
    label: "Hors ligne",
    description: "L'API ne répond pas.",
    icon: XCircleIcon,
    badge: "destructive",
    tone: "text-destructive",
  },
};

async function checkHealth(): Promise<Check> {
  await connection();
  const startedAt = performance.now();
  const checkedAt = new Date();

  try {
    const res = await fetch(`${API_URL}/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const latencyMs = Math.round(performance.now() - startedAt);
    const level: Level = !res.ok
      ? "down"
      : latencyMs > SLOW_THRESHOLD_MS
        ? "degraded"
        : "operational";
    return { level, httpStatus: res.status, latencyMs, checkedAt };
  } catch {
    return { level: "down", httpStatus: null, latencyMs: null, checkedAt };
  }
}

const timeFormat = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",
  timeStyle: "medium",
  timeZone: "Europe/Paris",
});

function Detail({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="truncate text-sm font-medium tabular-nums">{children}</dd>
    </div>
  );
}

export async function ApiStatus() {
  const check = await checkHealth();
  const { label, description, icon: Icon, badge, tone } = LEVELS[check.level];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className={`size-5 ${tone}`} aria-hidden />
          API Drops
        </CardTitle>
        <CardDescription>{description}</CardDescription>
        <CardAction>
          <Badge variant={badge} role="status">
            {label}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {check.level === "down" && (
          <Alert variant="destructive">
            <XCircleIcon />
            <AlertTitle>Service indisponible</AlertTitle>
            <AlertDescription>
              {check.httpStatus
                ? `Le endpoint /health a répondu avec le code ${check.httpStatus}.`
                : "Aucune réponse du serveur. Réessaie dans quelques instants."}
            </AlertDescription>
          </Alert>
        )}
        <Separator />
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Detail label="Endpoint">
            <span title={`${API_URL}/health`}>{new URL(API_URL).host}</span>
          </Detail>
          <Detail label="Code HTTP">{check.httpStatus ?? "—"}</Detail>
          <Detail label="Latence">
            {check.latencyMs === null ? "—" : `${check.latencyMs} ms`}
          </Detail>
          <Detail label="Vérifié le">
            <time dateTime={check.checkedAt.toISOString()}>
              {timeFormat.format(check.checkedAt)}
            </time>
          </Detail>
        </dl>
      </CardContent>
      <CardFooter className="justify-end">
        <RefreshButton />
      </CardFooter>
    </Card>
  );
}

export function ApiStatusSkeleton() {
  return (
    <Card aria-busy="true" aria-label="Vérification du statut en cours">
      <CardHeader>
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-56" />
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Separator />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="justify-end">
        <Skeleton className="h-7 w-24" />
      </CardFooter>
    </Card>
  );
}
