import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import LayoutList from '@iconify-icons/tabler/layout-list';
import X from '@iconify-icons/tabler/x';
import { Icon } from '@iconify/react';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { Box, IconButton, OutlinedInput, Typography } from '@mui/material';
import { useDebounceFn } from 'ahooks';
import { useEffect, useState } from 'react';
import Tooltip from '../../../components/tooltip';
import { EConditionType, EFilterKeys, ESortDirection } from '../../../constants';
import DotLoading from '../../blocklets/components/dot-loading';
import BlockletFilter from './blocklet-filter';
import BlockletSort from './blocklet-sort';

export default function ToolBar({
  sortGroups,
  filterGroups,
  freeText,
  filters,
  onFreeTextChange,
  onFilterChange,
  sort,
  onSortChange,
  total = 0,
  loading = false,
  displayCount = 0,
  hasFilter,
  checkedActionFilter,
  onCheckedActionFilterChange,
}: {
  sortGroups: { key: string; title: string }[];
  filterGroups: { key: string; title: string; items: { value: string; label: string }[]; isCheckboxGroup?: boolean }[];
  freeText: string;
  filters: Record<string, string[]>;
  onFreeTextChange: (text: string) => void;
  onFilterChange: (filters: Record<string, string[]>) => void;
  sort: { name: string; direction: ESortDirection };
  onSortChange: (sort: { name: string; direction: ESortDirection }) => void;
  total: number;
  loading: boolean;
  displayCount: number;
  hasFilter: boolean;
  checkedActionFilter: boolean;
  onCheckedActionFilterChange: (checked: boolean) => void;
}) {
  const { t } = useLocaleContext();
  const [text, setText] = useState(freeText);
  const { run: handleFreeTextChange } = useDebounceFn(
    (value) => {
      onFreeTextChange(value);
    },
    { wait: 300 }
  );

  useEffect(() => {
    if (freeText !== text) {
      setText(freeText);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [freeText]);

  function renderFilterInfo() {
    return (
      <>
        {(hasFilter || freeText || checkedActionFilter) && (
          <>
            <Typography
              variant="subtitle2"
              sx={{
                color: 'text.hint',
                display: 'flex',
                alignItems: 'center',

                '.clear-icon': {
                  color: 'primary.main',
                  cursor: 'pointer',
                },
              }}>
              <Tooltip title={t('blocklet.clearTip')}>
                <Icon
                  className="clear-icon"
                  icon={X}
                  width={18}
                  height={18}
                  onClick={() => onFilterChange({ [EFilterKeys.CONDITION_TYPE]: [EConditionType.OR] })}
                  style={{ cursor: 'pointer', marginRight: 4, marginTop: -2 }}
                />
              </Tooltip>
              {loading ? <DotLoading width={60} dotSize={8} /> : t('common.filterCount', { count: displayCount })}
            </Typography>
            <Typography
              variant="subtitle2"
              sx={{
                color: 'text.hint',
                display: 'flex',
                alignItems: 'center',
              }}>
              /
            </Typography>
          </>
        )}
        <Typography
          variant="subtitle2"
          sx={{
            color: 'text.hint',
            display: 'flex',
            alignItems: 'center',
          }}>
          {t('common.totalCount', { count: total })}
        </Typography>
      </>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 1,
        flexDirection: { xs: 'column', md: 'row' },
      }}>
      <OutlinedInput
        fullWidth
        sx={{
          bgcolor: 'grey.50',
          px: 1,
          py: 0.5,
          width: { xs: '100%', md: '350px' },
          '.MuiInputBase-input': { p: 1 },
          '.MuiOutlinedInput-notchedOutline': {
            borderRadius: '8px',
            borderColor: 'transparent',
          },
          '&&:hover .MuiOutlinedInput-notchedOutline, &&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'divider',
            borderWidth: '1px',
          },
        }}
        autoFocus
        placeholder={t('common.search', { name: t('blockletList.placeholder') })}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          handleFreeTextChange(e.target.value);
        }}
        startAdornment={<SearchIcon sx={{ fontSize: 16, cursor: 'default', color: 'text.hint' }} />}
        endAdornment={
          freeText ? (
            <CloseIcon
              sx={{ fontSize: 20, cursor: 'pointer', color: 'text.hint' }}
              onClick={() => onFreeTextChange('')}
            />
          ) : null
        }
      />
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      />
      <Box
        sx={{
          display: 'flex',
          flexGrow: 0,
          justifyContent: { xs: 'flex-end', md: 'space-between' },
          alignItems: 'center',
          gap: 1,
          width: { xs: '100%', md: 'auto' },
        }}>
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
          }}>
          {renderFilterInfo()}
        </Box>
        <IconButton
          sx={{
            minWidth: 40,
            height: 40,
            ...(checkedActionFilter && { color: 'primary.main' }),
          }}
          onClick={() => onCheckedActionFilterChange(!checkedActionFilter)}>
          <Tooltip title={t('blocklet.actionFilter')}>
            <Icon icon={LayoutList} width={20} height={20} />
          </Tooltip>
        </IconButton>
        <BlockletSort groups={sortGroups} sort={sort} onSortChange={onSortChange} />
        <BlockletFilter groups={filterGroups} filters={filters} onFilterChange={onFilterChange} />
      </Box>
      <Box
        sx={{
          display: { xs: 'flex', md: 'none' },
          justifyContent: 'flex-end',
          width: '100%',
        }}>
        {renderFilterInfo()}
      </Box>
    </Box>
  );
}
