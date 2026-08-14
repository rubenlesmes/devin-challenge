import { invalidTransition } from "@/lib/errors";

export type TransitionMap<S extends string> = Readonly<Record<S, readonly S[]>>;

export function assertTransition<S extends string>(
  map: TransitionMap<S>,
  from: S,
  to: S,
  entityLabel: string,
): void {
  const allowed = map[from] ?? [];
  if (!allowed.includes(to)) {
    throw invalidTransition(
      `This ${entityLabel} can no longer be moved to the requested status.`,
    );
  }
}
