import { LocaleProvider, useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import { ThemeProvider, useTheme } from '@arcblock/ux/lib/Theme';
import BlockletList from '@blocklet/list';
import Box from '@mui/material/Box';
import Cube from '@iconify-icons/tabler/cube';
import CheckList from '@iconify-icons/tabler/checklist';
import { Helmet } from 'react-helmet';
import { BrowserRouter, useLocation, useNavigate } from 'react-router-dom';
import { joinURL, withQuery } from 'ufo';
import { Icon } from '@iconify/react';
import PageLayout from '../../components/layout/page-layout';
import { SessionProvider } from '../../contexts/session';
import { getVersion } from '../../libs/blocklet';
import { translations } from '../../locales/index';
import { blockletRender } from '../blocklets/blocklet-render';
import useUser from '../../hooks/user';
import { MENU_KEY } from './constant';
import MyBlocklets from './my-blocklets';
import AllBlocklets from './all-blocklets';
import { IBlockletMeta } from '../../type';

function BlockletListPage() {
  const { locale, t } = useLocaleContext();
  const { hasDeveloper, hasOwner, isOwner, isAdmin, org } = useUser();

  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const storeVersion = getVersion();
  const prefix = window.blocklet ? window.blocklet.prefix : '/';

  const queryParams = Object.fromEntries(new URLSearchParams(location.search).entries());

  const onFilterChange = (filters) => {
    navigate(joinURL(prefix, withQuery('/search', filters)));
  };
  const onSearchSelect = (blocklet: Partial<IBlockletMeta>) => {
    navigate(joinURL(prefix, `/blocklets/${blocklet.did}`));
  };
  // blockletRender 组件中用到的 context 需要单独传递进来
  const wrapChildren = (children) => {
    return (
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <SessionProvider>
            <LocaleProvider
              translations={translations}
              // 动态获取到的 languages
              fallbackLocale="en">
              {children}
            </LocaleProvider>
          </SessionProvider>
        </ThemeProvider>
      </BrowserRouter>
    );
  };

  const menus: { key: string; title: string; icon: React.ReactNode }[] = [];
  if (hasDeveloper || hasOwner) {
    menus.push({
      key: MENU_KEY.MY_BLOCKLETS,
      title: t('common.blocklet'),
      icon: <Icon icon={Cube} width={18} height={18} />,
    });
  }
  if (isOwner || isAdmin || org) {
    // 如果有 OrgId 也应该显示
    menus.push({
      key: MENU_KEY.ALL_BLOCKLETS,
      title: t('common.blocklets'),
      icon: <Icon icon={CheckList} width={18} height={18} />,
    });
  }
  return (
    <PageLayout>
      <Helmet title={t('common.storeTitle')} />
      <Box sx={{ aside: { height: 'calc(100vh - 100px)' } }}>
        <BlockletList
          filters={queryParams}
          menus={menus}
          showResourcesSwitch
          onSearchSelect={onSearchSelect}
          onFilterChange={onFilterChange}
          blockletRender={blockletRender}
          layout={{ showExplore: true, showSearch: false }}
          type="page"
          locale={locale}
          wrapChildren={wrapChildren}
          endpoint={prefix}
          storeVersion={storeVersion}>
          {(menu: string) => {
            if (menu === MENU_KEY.MY_BLOCKLETS) {
              return <MyBlocklets />;
            }
            if (menu === MENU_KEY.ALL_BLOCKLETS) {
              return <AllBlocklets />;
            }
            return null;
          }}
        </BlockletList>
      </Box>
    </PageLayout>
  );
}

export default BlockletListPage;
