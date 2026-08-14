export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
      {message}
    </div>
  );
}
