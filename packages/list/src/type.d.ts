interface IBlockletMeta {
  _id: string;
  did: string;
  name: string;
  title: string;
  description: string;
  version: string;
  logo: string;
  components: any[];
  files: string[];
  screenshots: string[];
  specVersion: string;
  community: string;
  documentation: string;
  homepage: string;
  license: string;
  nftFactory: string;
  payment: IPayment;
  timeout: ITimeout;
  requirements: IRequirements;
  interfaces: IInterface[];
  environments: IEnvironment[];
  capabilities: ICapabilities;
  dist: IDist;
  signatures: ISignature[];
  stats: IStats;
  category: ICategory;
  owner: IOwner;
  lastPublishedAt: string;
  paymentShares: any[];
  gitHash: string;
  group: string;
  keywords: string[];
  main: string;
  repository: IRepository;
  scripts: IScripts;
}

interface IPayment {
  price: IPrice[];
}

interface IPrice {
  value: number;
}

interface ITimeout {
  start: number;
}

interface IRequirements {
  server: string;
  os: string;
  cpu: string;
}

interface IInterface {
  type: string;
  name: string;
  path: string;
  prefix: string;
  port: string;
  protocol: string;
}

interface IEnvironment {
  name: string;
  description: string;
  required: boolean;
  default: string;
  secure: boolean;
  shared: boolean;
}

interface ICapabilities {
  navigation: boolean;
}

interface IDist {
  tarball: string;
  integrity: string;
  size: number;
}

interface ISignature {
  type: string;
  name: string;
  signer: string;
  pk: string;
  excludes: string[];
  appended: string[];
  created: string;
  sig: string;
  delegatee?: string;
  delegateePk?: string;
  delegation?: string;
}

interface IStats {
  downloads: number;
}

interface ICategory {
  name: string;
  locales: ILocales;
  _id: string;
  createdAt: string;
  updatedAt: string;
}

interface ILocales {
  en: string;
  zh: string;
}

interface IOwner {
  did: string;
  fullName: string;
  avatar: string;
}

interface IAuthor {
  name: string;
  url: string;
}

interface IRepository {
  type: string;
  url: string;
}

interface IScripts {
  preStart: string;
  dev: string;
}

interface IBaseListProps {
  errors: {
    fetchBlockletsError: any;
    fetchCategoriesError: any;
  };
  compact?: boolean;
  loadings: {
    fetchBlockletsLoading: boolean;
    fetchCategoriesLoading: boolean;
    loadingMore: boolean;
  };
  extraFilter?: (list: any[]) => any[];
  endpoint: string;
  blockletRender: ({
    blocklet,
    autocompleteSetters,
    blocklets,
    serverVersion,
  }: {
    blocklet: IBlockletMeta;
    autocompleteSetters?: any;
    blocklets: IBlockletMeta[];
    serverVersion?: string;
  }) => React.ReactNode;
  wrapChildren: (children: React.ReactNode) => React.ReactNode;
  queryFilter?: boolean;
  layout?: {
    showExplore?: boolean;
    showCategory?: boolean;
    showTitle?: boolean;
    showSearch?: boolean;
  };
  minItemWidth?: number;
  storeApi?: any;
  categoryOptions?: Partial<ICategory[]>;
  priceOptions?: Partial<IPrice[]>;
  onFilterChange?: (data: Record<string, any>) => void;
  locale?: 'zh' | 'en';
  serverVersion?: string;
  baseSearch?: boolean;
  showCategory?: boolean;
  tagFilters?: any[];
  storeVersion: string;
  showResourcesSwitch?: boolean;
}

type RequireProps<T, K extends keyof T> = T & { [P in K]-?: T[P] };

interface ISearch {
  filters: IFilters;
  cleanFilter: (keys?: (keyof IFilters)[]) => void;
  handleActiveMenu: (key: string) => void;
  handleSort: (sort: IFilters['sortBy'], sortDirection?: IFilters['sortDirection']) => void;
  handleKeyword: (keyWord: IFilters['keyword']) => void;
  handlePrice: (price: IFilters['price']) => void;
  handleCategory: (category: IFilters['category']) => void;
  handleDeveloper: (owner: IFilters['owner']) => void;
  handlePage: (page: IFilters['currentPage']) => void;
  handleSwitchShowResources: (showResources: IFilters['resourceType']) => void;
  handleSwitchIsOfficial: (isOfficial: IFilters['isOfficial']) => void;
  handleSearchSelect: (selected: Partial<IBlockletMeta>) => void;
}

interface IFilterStore extends RequireProps<IBaseListProps, 'layout' | 'minItemWidth'> {
  errors: {
    fetchCategoriesError: any;
  };
  loadings: {
    fetchCategoriesLoading: boolean;
  };
  t: (key: string, data?: any) => string;
  selectedCategory?: string;
  developerName: string;
  updateDeveloperName: (name: string) => void;
  categoryList: { name: string; value: string }[];
  categoryOptions: { name: string; value: string }[];
  priceOptions: { name: string; value: string }[];
  getCategoryLocale: (category?: string) => string | null;
  search: ISearch;
}

interface IFilters {
  currentPage?: number;
  keyword?: string;
  sortBy?: string;
  sortDirection?: string;
  menu?: string;
  price?: string;
  category?: string;
  developer?: string;
  resourceType?: string;
  showResources?: string;
  isOfficial?: string;
  owner?: string;
  page?: number;
  pageSize?: number;
  resourceDid?: string;
  resourceBlocklet?: string;
}

interface IAsideMenu {
  key: string;
  title: string;
  icon: string | React.ReactNode;
  onClick?: () => void;
}

interface IListProps extends Omit<IBaseListProps, 'children'> {
  filters: IFilters;
  fetchCategoryDelay?: number;
  menus?: IAsideMenu[];
  children?: (key: string) => React.ReactNode;
  onSearchSelect?: (selected: Partial<IBlockletMeta>) => void;
}

interface Window {
  blocklet?: {
    preferences?: {
      homeBanner?: IHomeBanner[];
      officialAccounts?: IBlockletMeta[];
    };
    prefix?: string;
    navigation?: {
      section: string;
      items: {
        name: string;
      }[];
    }[];
  };
}

interface IHomeBanner {
  baseNum: number;
  cover: string;
  desc: string;
  did: string;
  link: string;
  name: string;
}
