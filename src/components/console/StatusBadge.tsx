const STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  IN_REVIEW: "bg-blue-100 text-blue-800",
  NEEDS_INFORMATION: "bg-purple-100 text-purple-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  LOW: "bg-green-100 text-green-800",
  MEDIUM: "bg-amber-100 text-amber-800",
  HIGH: "bg-red-100 text-red-800",
  DEVELOPMENT: "bg-gray-100 text-gray-700",
  STAGING: "bg-blue-100 text-blue-800",
  PRODUCTION: "bg-red-100 text-red-800",
  ENABLED: "bg-green-100 text-green-800",
  DISABLED: "bg-gray-100 text-gray-700",
};

export function StatusBadge({ value }: { value: string }) {
  const style = STYLES[value] ?? "bg-gray-100 text-gray-700";
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${style}`}>
      {value.replaceAll("_", " ")}
    </span>
  );
}
