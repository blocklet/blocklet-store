import { Comments as DiscussKitComments } from '@blocklet/discuss-kit';
import { Suspense } from 'react';
import DotLoading from '../pages/blocklets/components/dot-loading';

export interface ICommentsProps {
  target: {
    id: string;
    title?: string;
    desc?: string;
    owner?: string;
  };
  displayConnectButton?: boolean;
  displayReaction?: boolean;
  onChange?: (...args: any[]) => void;
  flatView?: boolean;
  showTopbar?: boolean;
  autoCollapse?: boolean;
  autoLoadComments?: boolean;
  allowCopyLink?: boolean;
  disabledSend?: boolean;
  commentInputPosition?: 'top' | 'bottom' | 'none';
  showProfileCard?: boolean;
  order?: 'asc' | 'desc';
  interactive?: boolean;
  renderComments?: ({
    comments,
    renderComment,
  }: {
    comments: any[];
    renderComment: (...args: any[]) => React.ReactNode;
  }) => React.ReactNode;
  renderDonation?: React.ReactNode;
  renderActions?: React.ReactNode;
  renderEditorPlugins?: React.ReactNode;
  renderInnerFooter?: ({
    content,
    submit,
    loading,
  }: {
    content: string;
    submit: () => Promise<void>;
    loading: boolean;
  }) => React.ReactNode;
  sendComment?: (...args: any[]) => void;
}

export function Comments({ ...props }: ICommentsProps) {
  return (
    <Suspense
      fallback={
        <div>
          <DotLoading height={20} />
        </div>
      }>
      <DiscussKitComments {...props} />
    </Suspense>
  );
}
