import { EmptyState } from "@/components/console/EmptyState";

export interface AuditTimelineEvent {
  id: string;
  occurredAt: Date;
  actorName: string;
  action: string;
  reason: string | null;
  beforeState: string | null;
  afterState: string | null;
}

function summarizeState(json: string | null): string | null {
  if (!json) return null;
  try {
    const obj: unknown = JSON.parse(json);
    if (obj && typeof obj === "object") {
      return Object.entries(obj as Record<string, unknown>)
        .map(([k, v]) => `${k}: ${String(v)}`)
        .join(", ");
    }
  } catch {
    return null;
  }
  return null;
}

export function AuditTimeline({ events }: { events: AuditTimelineEvent[] }) {
  if (events.length === 0) {
    return <EmptyState message="No audit events recorded for this record yet." />;
  }
  return (
    <ol className="space-y-3">
      {events.map((event) => {
        const before = summarizeState(event.beforeState);
        const after = summarizeState(event.afterState);
        return (
          <li key={event.id} className="rounded-md border border-gray-200 bg-white p-3 text-sm">
            <div className="flex flex-wrap items-baseline justify-between gap-1">
              <span className="font-medium text-gray-900">{event.action.replaceAll("_", " ")}</span>
              <time
                dateTime={event.occurredAt.toISOString()}
                className="text-xs text-gray-500"
              >
                {event.occurredAt.toISOString().replace("T", " ").slice(0, 19)} UTC
              </time>
            </div>
            <p className="text-gray-600">by {event.actorName}</p>
            {event.reason ? <p className="mt-1 text-gray-700">“{event.reason}”</p> : null}
            {before || after ? (
              <p className="mt-1 text-xs text-gray-500">
                {before ? `Before — ${before}` : ""}
                {before && after ? " · " : ""}
                {after ? `After — ${after}` : ""}
              </p>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
