import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getUpdatedSearchParams, IUrlState, parseUrlState } from '../libs/url-state';
import { ESortDirection } from '../constants';

export interface BlockletUrlState {
  page: number;
  freeText: string;
  filters: Record<string, string[]>;
  sort: {
    name: string;
    direction: ESortDirection;
  };
}

/**
 * Manages and synchronizes URL state for pagination, search, filtering, and sorting.
 *
 * @remarks
 * This hook provides a comprehensive way to interact with URL parameters using React Router's `useSearchParams`.
 * It handles parsing, updating, and maintaining the URL state with various setter methods.
 *
 * @returns A tuple containing:
 * - The current URL state with page, free text search, filters, and sorting information
 * - An object with methods to update specific aspects of the URL state
 *
 * @example
 * ```typescript
 * const [state, { setPage, setFreeText, setFilters, setSort }] = useUrlState();
 *
 * // Update page
 * setPage(2);
 *
 * // Perform free text search
 * setFreeText('search query');
 *
 * // Set filters
 * setFilters({ category: ['books', 'electronics'] });
 *
 * // Set sorting
 * setSort({ name: 'price', direction: ESortDirection.ASC });
 * ```
 *
 * @beta
 */
export function useUrlState(): [
  BlockletUrlState,
  {
    setPage: (page: number) => void;
    setFreeText: (text: string) => void;
    setFilters: (filters: Record<string, string[]>) => void;
    setSort: (sort: { name: string; direction: ESortDirection }) => void;
    updateState: (updates: Partial<IUrlState>) => void;
  },
] {
  const [searchParams, setSearchParams] = useSearchParams();

  // 解析当前 URL 状态
  const state = useMemo(() => {
    const urlState = parseUrlState(searchParams);
    return {
      page: urlState.page,
      freeText: urlState.q,
      filters: urlState.filters,
      sort: urlState.sort,
    };
  }, [searchParams]);

  // 更新状态的通用函数
  const updateState = useCallback(
    (updates: Partial<IUrlState>) => {
      const newParams = getUpdatedSearchParams(searchParams, { ...state, ...updates }, ['filters']);
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams, state]
  );

  // 具体的更新函数
  const setPage = useCallback(
    (page: number) => {
      updateState({ page: page === 1 ? undefined : page });
    },
    [updateState]
  );

  const setFreeText = useCallback(
    (text: string) => {
      updateState({
        q: text || undefined,
        page: undefined,
      });
    },
    [updateState]
  );

  const setFilters = useCallback(
    (filters: Record<string, string[]>) => {
      updateState({
        filters,
        page: undefined,
      });
    },
    [updateState]
  );

  const setSort = useCallback(
    (sort: { name: string; direction: ESortDirection }) => {
      if (!Object.values(ESortDirection).includes(sort.direction)) {
        console.warn(`Invalid sort direction: ${sort.direction}`);
        return;
      }
      updateState({
        sort,
        page: undefined,
      });
    },
    [updateState]
  );

  return [
    state as BlockletUrlState,
    {
      setPage,
      setFreeText,
      setFilters,
      setSort,
      updateState,
    },
  ];
}
