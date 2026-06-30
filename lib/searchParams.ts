import {
  parseAsString,
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsIndex,
  parseAsInteger,
} from 'nuqs/server';

export const searchParams = {
  gradeFilter: parseAsArrayOf(parseAsString).withDefault([]),
  sectionFilter: parseAsArrayOf(parseAsString).withDefault([]),
  q: parseAsString.withDefault(''),

  limit: parseAsIndex.withDefault(2),

  // For Fee Assignment Page
  pageSize: parseAsInteger.withDefault(30),
  pageIndex: parseAsInteger.withDefault(1),
  search: parseAsString.withDefault(''),
  sectionId: parseAsString.withDefault('all'),
  gradeId: parseAsString.withDefault('all'),

  startDate: parseAsString.withDefault(''),
  endDate: parseAsString.withDefault(''),
  status: parseAsString.withDefault('all'),
};

export const searchParamsCache = createSearchParamsCache(searchParams);
