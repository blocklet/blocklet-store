import { useTheme } from '@arcblock/ux/lib/Theme';
import ActionButton, { ILaunchButtonProps } from '../launch-button/launch-button';

export default function LaunchButton(props: ILaunchButtonProps) {
  const theme = useTheme();

  return (
    <ActionButton
      size="small"
      style={{ width: 'auto', borderColor: theme.palette.grey['300'], borderRadius: 8 }}
      {...props}
    />
  );
}
