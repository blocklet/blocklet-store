import { omitBy, pick } from 'lodash-es';

export default function useSearch(
  filters: IFilters,
  options: {
    emptyCategory?: boolean;
    onFilterChange: (filters: IFilters) => void;
    onSearchSelect?: (selected: Partial<IBlockletMeta>) => void;
  }
): ISearch {
  const finalFilters: IFilters = filters.menu
    ? {
        sortBy: 'popularity',
        sortDirection: 'desc',
        showResources: 'true',
        ...pick(filters, ['sortBy', 'sortDirection', 'showResources']),
      }
    : {
        sortBy: 'popularity',
        sortDirection: 'desc',
        showResources: 'true',
        ...filters,
        menu: undefined,
      };
  const {
    onFilterChange,
    onSearchSelect = (selected) => {
      options.onFilterChange({ ...finalFilters, keyword: selected.title });
    },
    emptyCategory,
  } = options;

  if (!finalFilters.category && !emptyCategory) {
    finalFilters.category = 'All';
  }

  const onChange = (changeFilters: Partial<IFilters>) => {
    const changeData = { ...finalFilters, ...changeFilters };
    onFilterChange(omitBy(changeData, (value) => value === '' || value === undefined));
  };

  return {
    filters,
    cleanFilter: (keys?: (keyof IFilters)[]) => {
      const changeData = keys ? omitBy(finalFilters, (_value, key) => keys.includes(key as keyof IFilters)) : {};
      onFilterChange(omitBy(changeData, (value) => value === '' || value === undefined));
    },
    handleActiveMenu: (key) => {
      if (key !== filters.menu) {
        onFilterChange({ menu: key });
      }
    },
    handleSort: (sort: IFilters['sortBy'], sortDirection: IFilters['sortDirection']) => {
      onChange({ sortBy: sort, sortDirection: sortDirection || sort === 'nameAsc' ? 'asc' : 'desc' });
    },
    handleKeyword: (keyWord: IFilters['keyword']) => {
      onChange({ category: undefined, keyword: keyWord || undefined });
    },
    handlePrice: (price: IFilters['price']) => {
      onChange({ price: price === filters.price ? undefined : price });
    },
    handleCategory: (category: IFilters['category']) => {
      onChange({ category: category === filters.category ? '' : category });
    },
    handleDeveloper: (owner: IFilters['owner']) => {
      onChange({ owner: owner || undefined });
    },
    handlePage: (page: IFilters['currentPage']) => {
      onChange({ currentPage: page });
    },
    handleSwitchIsOfficial: (isOfficial: IFilters['isOfficial']) => {
      onChange({ isOfficial: isOfficial === 'true' ? 'true' : '' });
    },
    handleSwitchShowResources: (showResources: IFilters['resourceType']) => {
      onChange({ showResources });
    },
    handleSearchSelect: (selected: Partial<IBlockletMeta>) => {
      onSearchSelect(selected);
    },
  };
}
