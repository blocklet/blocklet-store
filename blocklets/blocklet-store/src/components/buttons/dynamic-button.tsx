import { IBlockletButton } from '../../type';
import usePermissionButton, { EButtons } from '../../hooks/use-permission-button';
import MoreButton from './more-button';

export default function DynamicButton(props: IBlockletButton & { showCount?: number; showButtons?: EButtons[] }) {
  const { blocklet, showCount = 2, showButtons = Object.values(EButtons), onSuccess } = props;
  const { buttons } = usePermissionButton(props, { pickCount: showCount, showButtons });

  return [
    <MoreButton blocklet={blocklet} skipCount={showCount} showButtons={showButtons} onSuccess={onSuccess} />,
    buttons.map((button) => button.component),
  ];
}
