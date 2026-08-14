export interface SelectFilter {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  value?: string;
}

export interface CheckboxFilter {
  name: string;
  label: string;
  checked?: boolean;
}

// GET-form filter bar: filtering is read-only and expressed in the URL, so it
// never mutates state. All mutations go through server actions and services.
export function FilterBar({
  action,
  searchPlaceholder,
  searchValue,
  selects = [],
  checkboxes = [],
}: {
  action: string;
  searchPlaceholder: string;
  searchValue?: string;
  selects?: SelectFilter[];
  checkboxes?: CheckboxFilter[];
}) {
  return (
    <form action={action} method="get" className="flex flex-wrap items-end gap-3">
      <div className="flex min-w-48 flex-1 flex-col gap-1">
        <label htmlFor="q" className="text-xs font-medium text-gray-600">
          Search
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={searchValue}
          placeholder={searchPlaceholder}
          className="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>
      {selects.map((s) => (
        <div key={s.name} className="flex flex-col gap-1">
          <label htmlFor={s.name} className="text-xs font-medium text-gray-600">
            {s.label}
          </label>
          <select
            id={s.name}
            name={s.name}
            defaultValue={s.value ?? ""}
            className="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">All</option>
            {s.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      ))}
      {checkboxes.map((c) => (
        <label key={c.name} className="flex items-center gap-2 py-1.5 text-sm text-gray-700">
          <input
            type="checkbox"
            name={c.name}
            value="1"
            defaultChecked={c.checked}
            className="h-4 w-4 rounded border-gray-300"
          />
          {c.label}
        </label>
      ))}
      <button
        type="submit"
        className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:outline-none"
      >
        Apply
      </button>
    </form>
  );
}
