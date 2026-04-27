import type { TBlockletMeta, TEngine } from '@blocklet/meta/lib/types';
import { EVersionStatus } from './constants';
import { ButtonProps } from '@mui/material';

interface Window {
  blocklet?: {
    appUrl: string;
    prefix: string;
    version: string;
    preferences: {
      passportStakeCurrency: string;
    };
  };
}

interface IVersion {
  id: string;
  version: string;
  createdAt: string;
  changeLog: string;
  deleted?: boolean;
  pendingAt?: string;
  inReviewAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  canceledAt?: string;
  publishedAt: string;
  note?: string;
  status: EVersionStatus;
  operations?: Partial<Record<EVersionStatus, string>>;
}

interface IBlockletInfo {
  readme: { en: string; zh: string };
  version: IVersion;
  deps: IBlockletMeta[];
  authorBlocklets: IBlockletMeta[];
  categoriesBlocklets: IBlockletMeta[];
  extensions: IBlockletMeta[];
}

interface IBlocklet {
  id: string;
  did: string;
  blockReason?: string;
  meta: IBlockletMeta;
  currentVersion?: IVersion;
  latestVersion: IVersion;
  delegationToken?: {
    autoPublish?: string;
  };
  reviewVersion?: IVersion;
  lastPublishedAt: string;
  createdAt: string;
  updatedAt: string;
  source: string;
  ownerDid: string;
  permission: string;
  remark?: string;
  reviewType: string;
  status: string;
  actions?: WaitActions[];
  specifiedVersion?: IVersion;
  inOrg?: boolean;
}

interface IBlockletMeta extends Omit<TBlockletMeta, 'repository'> {
  /** @deprecated 等待新功能稳定后，统一删除 */
  _id: string;
  id: string;
  did: string;
  category?: ICategory;
  owner: IOwner;
  stats: {
    downloads: number;
  };
  repository?: {
    parsedUrl?: string;
    type?: string;
    url?: string;
  };
  docker?: {
    image?: string;
    runBaseScript?: string;
  };
  blocklet?: Omit<IBlocklet, 'meta'>;
  isOfficial?: boolean;
}

interface ICategory {
  _id: string;
  id: string;
  name: string;
  locales: ILocales;
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

interface SafeButtonRefProps {
  onClick: (e: any) => void;
  content: React.ReactNode;
  title: React.ReactNode;
}

interface IBlockletButton extends Omit<ButtonProps, 'onClick' | 'ref'> {
  ref?: React.RefObject<SafeButtonRefProps | null>;
  blocklet: IBlocklet;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
  onSuccess?: () => void | Promise<void>;
}
