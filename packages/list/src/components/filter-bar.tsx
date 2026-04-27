import SquareIcon from '@iconify-icons/tabler/square';
import CheckedIcon from '@iconify-icons/tabler/square-check-filled';
import { Icon } from '@iconify/react';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material';
import { useListContext } from '../contexts/list';
import { getSortOptions } from '../libs/utils';
import Autocomplete from './autocomplete';
import BaseSearch from './base-search';
import CustomSelect from './custom-select';

export default function FilterBar() {
  const {
    search,
    t,
    endpoint,
    locale,
    getCategoryLocale,
    developerName,
    showResourcesSwitch,
    layout,
    baseSearch,
    categoryOptions,
    compact,
  } = useListContext();
  const {
    filters,
    handleSort,
    handlePrice,
    handleDeveloper,
    handleSwitchShowResources,
    cleanFilter,
    handleCategory,
    handleSwitchIsOfficial,
  } = search;
  const sortOptions = getSortOptions(t);

  return (
    <Stack
      className="filter-bar"
      direction={{ xs: 'column', md: 'row' }}
      spacing={{ xs: 1, md: 0 }}
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        alignItems: { xs: 'flex-start', md: 'center' },
        justifyContent: 'space-between',
        gap: 2,
        pt: { xs: 2, md: 0 },
        px: 0,
        pb: compact ? 2 : 3,
        backgroundColor: 'background.default',
      }}>
      {!compact && (
        <Typography
          variant="h2"
          sx={{
            textTransform: 'capitalize',
          }}>
          {getCategoryLocale(filters.category!)}
        </Typography>
      )}
      <Stack
        direction="row"
        sx={{
          flex: 1,
          alignItems: 'center',
          flexWrap: { xs: 'wrap', md: 'nowrap' },
          width: '100%',
          justifyContent: { xs: 'flex-start', md: 'flex-end' },
          gap: 2,
        }}>
        {layout.showSearch ? (
          <Box
            sx={{
              flex: 1,
              flexBasis: { xs: '100%', md: 'auto' },
            }}>
            {baseSearch ? (
              <BaseSearch />
            ) : (
              <Autocomplete
                locale={locale!}
                endpoint={endpoint}
                sx={{
                  display: { md: 'block', xs: 'none' },
                  flex: 1,
                  mr: 1,
                  width: '350px',
                }}
                t={t}
                filters={search.filters}
                handleKeyword={search.handleKeyword}
                handleSearchSelect={search.handleSearchSelect}
              />
            )}
          </Box>
        ) : null}
        {filters.owner && developerName && (
          <Chip
            label={t('blocklet.authorTag', { name: developerName })}
            size="small"
            onDelete={() => handleDeveloper('')}
          />
        )}
        {filters.resourceDid && filters.resourceBlocklet && (
          <Chip
            label={t('blocklet.resourceTag', { name: filters.resourceBlocklet })}
            size="small"
            onDelete={() => cleanFilter(['resourceDid', 'resourceBlocklet', 'showResources'])}
          />
        )}
        <CheckButton
          checked={filters.isOfficial === 'true'}
          onChange={(checked) => handleSwitchIsOfficial(checked ? 'true' : 'false')}
          label={t('common.official')}
        />
        {showResourcesSwitch ? (
          <CheckButton
            checked={filters.showResources !== 'false'}
            onChange={(checked) => handleSwitchShowResources(checked ? 'true' : 'false')}
            label={t('common.showResources')}
          />
        ) : null}
        <CheckButton
          checked={filters.price === 'free'}
          onChange={(checked) => handlePrice(checked ? 'free' : '')}
          label={t('blocklet.free')}
        />
        {compact && (
          <Box>
            <CustomSelect
              value={filters.category || categoryOptions[0]?.value}
              options={categoryOptions}
              placeholder={t('common.category')}
              onChange={(value) => handleCategory(value)}
            />
          </Box>
        )}
        <CustomSelect
          value={filters.sortBy || sortOptions[0].value}
          options={sortOptions}
          placeholder={t('sort.sort')}
          onChange={(value) => handleSort(value)}
        />
      </Stack>
    </Stack>
  );
}

function CheckButton({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  const theme = useTheme();

  return (
    <FormControlLabel
      sx={{ m: 0, p: 0 }}
      className="check-button"
      control={
        <Checkbox
          checked={checked}
          icon={<Icon style={{ padding: 0, color: theme.palette.text.secondary }} icon={SquareIcon} />}
          checkedIcon={<Icon style={{ padding: 0, color: theme.palette.primary.main }} icon={CheckedIcon} />}
          size="large"
          sx={{ p: 0, mr: 1 }}
          onChange={(e) => onChange(e.target.checked)}
        />
      }
      label={label}
    />
  );
}
