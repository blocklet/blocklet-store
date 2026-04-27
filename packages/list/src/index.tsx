import { useTheme } from '@arcblock/ux/lib/Theme';
import { createTheme, ThemeProvider } from '@mui/material';
import { merge } from 'lodash-es';
import SelectBase from './base';
import Autocomplete from './components/autocomplete';
import CardSkeleton from './components/card-skeleton';
import Image from './components/image';
import { ListProvider } from './contexts/list';
import useSearch from './hooks/use-search';

export { Autocomplete, CardSkeleton, Image, useSearch };

export default function BlockletList(props: IListProps) {
  const { menus, children, ...rest } = props;
  const theme = useTheme();
  const baseTheme = createTheme(
    merge({}, theme, {
      typography: {
        h1: {
          fontSize: 32,
          fontWeight: 700,
          lineHeight: 1.375,
          textAlign: 'left',
        },
        h2: {
          fontSize: 24,
          fontWeight: 700,
          lineHeight: 1.3333333,
          textAlign: 'left',
        },
        h3: {
          fontSize: 18,
          fontWeight: 600,
          lineHeight: 1.5,
          textAlign: 'left',
        },

        fontWeightLight: 300,
        fontWeightRegular: 400,
        fontWeightMedium: 500,
        fontWeightBold: 700,
      },
    })
  );

  return (
    <ThemeProvider theme={baseTheme}>
      <ListProvider {...rest}>
        <SelectBase menus={menus}>{children}</SelectBase>
      </ListProvider>
    </ThemeProvider>
  );
}
