export interface ParsedPagination {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
}

export function parsePagination(
  query: Record<string, unknown>,
  defaults: { pageSize?: number; maxPageSize?: number } = {}
): ParsedPagination {
  const pageSize = defaults.pageSize ?? 20;
  const maxPageSize = defaults.maxPageSize ?? 100;

  const page = Math.max(1, Number(query.page ?? 1) || 1);
  const requestedSize = Number(query.pageSize ?? pageSize) || pageSize;
  const size = Math.min(Math.max(1, requestedSize), maxPageSize);

  return { page, pageSize: size, skip: (page - 1) * size, take: size };
}
