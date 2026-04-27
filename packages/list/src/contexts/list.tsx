import { createAxios } from '@blocklet/js-sdk';
import { orderBy } from 'lodash-es';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import useFetchCategories from '../hooks/use-fetch-categories';
import useSearch from '../hooks/use-search';
import { getCategoryOptions, getPrices } from '../libs/utils';
import { createRequestHeaders, translate } from './utils';

const DEFAULT_FILTER_STORE: IFilterStore = {
  errors: {
    fetchCategoriesError: null,
  },
  loadings: {
    fetchCategoriesLoading: false,
  },
  compact: false,
  endpoint: '',
  wrapChildren: () => null,
  t: (key: string) => key,
  storeVersion: '',
  minItemWidth: 350,
  serverVersion: '',
  layout: {},
  selectedCategory: undefined,
  categoryList: [],
  blockletRender: () => null,
  locale: 'en',
  categoryOptions: [],
  priceOptions: [],
  storeApi: null,
  baseSearch: false,
  showResourcesSwitch: false,
  showCategory: false,
  tagFilters: [],
  developerName: '',
  onFilterChange: () => {},
  updateDeveloperName: () => {},
  getCategoryLocale: () => null,

  search: {
    filters: {},
    cleanFilter: () => {},
    handleActiveMenu: () => {},
    handleSort: () => {},
    handleKeyword: () => {},
    handlePrice: () => {},
    handleCategory: () => {},
    handleDeveloper: () => {},
    handleSwitchShowResources: () => {},
    handleSwitchIsOfficial: () => {},
    handleSearchSelect: () => {},
    handlePage: () => {},
  },
};

const Filter = createContext(DEFAULT_FILTER_STORE);
const { Provider, Consumer } = Filter;

function ListProvider(props: Omit<IListProps, 'children'> & { children: React.ReactNode }) {
  const {
    locale = 'zh',
    filters = {},
    serverVersion = '',
    onFilterChange = () => {},
    minItemWidth = 350,
    queryFilter = true,
    layout = {},
    wrapChildren = (children) => children,
    extraFilter = (list) => list,
    baseSearch = false,
    fetchCategoryDelay = 0,
    showResourcesSwitch = false,
    showCategory = true,
    tagFilters = [],
    children,
    storeVersion,
    onSearchSelect = () => {},
    endpoint,
    blockletRender,
    compact = false,
  } = props;
  const requestHeaders = createRequestHeaders(serverVersion, storeVersion);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const storeApi = useMemo(() => createAxios({ baseURL: endpoint, headers: requestHeaders }), [endpoint]);

  const search = useSearch(filters, { onFilterChange, emptyCategory: !layout.showExplore, onSearchSelect });

  const [developerName, setDeveloperName] = useState('');

  const {
    data: allCategories = [],
    error: fetchCategoriesError,
    loading: fetchCategoriesLoading,
    run: fetchCategories,
  } = useFetchCategories(storeApi);

  const categoryList = useMemo(() => {
    const categories = orderBy(allCategories, [(i) => i.name], ['asc']);

    const index = categories.findIndex((item) => item.name === 'All' || item.locales.en === 'All');
    if (index > -1) {
      return [{ ...categories[index], _id: 'All' }, ...categories.slice(0, index), ...categories.slice(index + 1)];
    }
    return categories;
  }, [allCategories]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const translateFn = useCallback(translate(locale), [locale]);

  const categoryOptions = useMemo(() => getCategoryOptions(categoryList, locale), [categoryList, locale]);
  const priceOptions = getPrices(translateFn);

  const filterStore: IFilterStore = {
    search,
    compact,
    errors: { fetchCategoriesError },
    loadings: {
      fetchCategoriesLoading,
    },
    extraFilter,
    endpoint,
    queryFilter,
    layout: {
      showExplore: layout.showExplore ?? false,
      showCategory: layout.showCategory ?? true,
      showTitle: layout.showTitle ?? true,
      showSearch: layout.showSearch ?? true,
    },
    minItemWidth,
    wrapChildren,
    t: translateFn,
    storeVersion,
    serverVersion,
    selectedCategory: search.filters.category || (layout.showExplore ? '' : 'All'),
    categoryList,
    blockletRender,
    locale,
    categoryOptions,
    priceOptions,
    storeApi,
    baseSearch,
    showResourcesSwitch,
    showCategory,
    tagFilters,
    onFilterChange,
    getCategoryLocale: (category) => {
      if (!category) return null;
      const find = allCategories.find((item) => item._id === category || item.locales.en === 'All');
      return find ? find.locales[locale] || find.locales.en : null;
    },
    get developerName() {
      return developerName;
    },
    updateDeveloperName: setDeveloperName,
  };

  useEffect(() => {
    setTimeout(fetchCategories, fetchCategoryDelay || 0);
  }, [endpoint, fetchCategories, fetchCategoryDelay]);

  return <Provider value={filterStore}>{children}</Provider>;
}

function useListContext(): IFilterStore {
  const filterStore = useContext(Filter);
  if (!filterStore) {
    return DEFAULT_FILTER_STORE;
  }
  return filterStore;
}

export { Consumer as ListConsumer, ListProvider, useListContext };
