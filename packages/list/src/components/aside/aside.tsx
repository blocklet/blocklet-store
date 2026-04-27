import CompassIcon from '@iconify-icons/tabler/compass';
import { Icon } from '@iconify/react';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect } from 'react';
import { useAsideContext } from '../../contexts/aside';
import { useListContext } from '../../contexts/list';
import { showFilterBar } from '../../libs/utils';
import IconButton from '../icon-button';
import Media from '../media';
import AsideDrawer from './aside-drawer';
import AsideFilter from './aside-filter';

interface IAsideProps {
  menus?: IAsideMenu[];
}

export default function Aside({ menus = [] }: IAsideProps) {
  const { selectedCategory, search, t, categoryOptions, loadings, layout, baseSearch, compact } = useListContext();
  const { filters, handleActiveMenu, handleCategory, cleanFilter } = search;
  const { toggleOpen } = useAsideContext();

  useEffect(() => {
    toggleOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Object.values(filters).join('')]);

  const showBar = showFilterBar(baseSearch, layout.showSearch, filters.keyword);

  return layout.showCategory && !compact ? (
    <AsideDrawer>
      <Media
        xs={
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            p={2}
            mb={0.5}
            gap={2}
            borderBottom={1}
            borderColor="divider">
            <IconButton onClick={() => toggleOpen(false)}>
              <CloseIcon />
            </IconButton>
            <Typography flex={1} variant="body1" fontWeight="fontWeightMedium">
              {t('common.category')}
            </Typography>
          </Stack>
        }
        md={null}
      />
      <Stack
        visibility={loadings.fetchCategoriesLoading ? 'hidden' : 'visible'}
        width={{ xs: 268, md: 200 }}
        boxSizing="content-box"
        p={{ xs: 2, md: 0 }}
        pr={{ md: 6 }}>
        {!showBar ? (
          <AsideFilter />
        ) : (
          <>
            {layout.showExplore && (
              <Box mb={3} pb={3} borderBottom={1} borderColor="divider">
                <Box display="flex" alignItems="center" gap={1}>
                  <Icon icon={CompassIcon} width={20} height={20} />
                  <Typography
                    variant="body1"
                    color={!selectedCategory && !filters.menu ? 'text.primary' : 'grey.400'}
                    fontWeight={!selectedCategory && !filters.menu ? 'fontWeightMedium' : undefined}
                    sx={{ cursor: 'pointer' }}
                    onClick={() => {
                      toggleOpen(false);
                      cleanFilter();
                    }}>
                    {t('explore.title')}
                  </Typography>
                </Box>
                {menus.map((menu) => (
                  <Box display="flex" alignItems="center" mt={2} gap={1} key={menu.key}>
                    {typeof menu.icon === 'string' ? <Icon icon={menu.icon} width={20} height={20} /> : menu.icon}
                    <Typography
                      variant="body1"
                      color={filters.menu === menu.key ? 'text.primary' : 'grey.400'}
                      fontWeight={filters.menu === menu.key ? 'fontWeightMedium' : undefined}
                      sx={{ cursor: 'pointer' }}
                      onClick={() => {
                        toggleOpen(false);
                        handleActiveMenu(menu.key);
                        menu.onClick?.();
                      }}>
                      {menu.title}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
            {!!categoryOptions.length && (
              <Stack gap={2}>
                {categoryOptions.map((item) => (
                  <Typography
                    key={item.value}
                    variant="body1"
                    title={item.name}
                    sx={{ cursor: 'pointer' }}
                    data-cy="filter"
                    color={selectedCategory === item.value ? 'text.primary' : 'grey.400'}
                    textTransform="capitalize"
                    onClick={() => {
                      if (selectedCategory === item.value) {
                        cleanFilter();
                      } else {
                        handleCategory(item.value);
                      }
                      toggleOpen(false);
                    }}>
                    {item.name}
                  </Typography>
                ))}
              </Stack>
            )}
          </>
        )}
      </Stack>
    </AsideDrawer>
  ) : null;
}
