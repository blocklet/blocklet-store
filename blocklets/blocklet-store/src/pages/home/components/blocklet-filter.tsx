import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import Filter from '@iconify-icons/tabler/filter';
import FilterPlus from '@iconify-icons/tabler/filter-plus';
import { Icon } from '@iconify/react';
import {
  Box,
  Button,
  ClickAwayListener,
  Grow,
  Paper,
  Popper,
  Stack,
  Dialog,
  useMediaQuery,
  useTheme,
  ButtonProps,
} from '@mui/material';
import { omit } from 'lodash-es';
import { useCallback, useRef, useState } from 'react';
import { CheckGroup } from '../../../components/check-group';
import Tooltip from '../../../components/tooltip';
import { EConditionType, EFilterKeys } from '../../../constants';

export default function BlockletFilter({
  filters,
  groups,
  onFilterChange,
}: {
  filters: Record<string, string[]>;
  groups: {
    key: string;
    title: string;
    items: { value: string; label: string; tips?: string }[];
    isCheckboxGroup?: boolean;
  }[];
  onFilterChange: (filters: Record<string, string[]>) => void;
}) {
  const { t } = useLocaleContext();
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const closeMenu = useCallback(() => {
    setOpen(false);
  }, []);
  const openMenu = useCallback(() => {
    setOpen(true);
  }, []);

  const isAndCondition = filters[EFilterKeys.CONDITION_TYPE]?.includes(EConditionType.AND);

  const filterContent = Object.keys(filters)
    .flatMap((groupKey) =>
      groupKey !== EFilterKeys.CONDITION_TYPE
        ? filters[groupKey].map((value) => {
            const filterItem = groups
              .find((group) => group.key === groupKey)
              ?.items.find((item) => item.value === value);
            return filterItem?.tips || filterItem?.label || '';
          })
        : []
    )
    .join(isAndCondition ? ' AND ' : ' OR ');
  const hasFilter = !!filterContent;

  function renderResetButton(props?: ButtonProps) {
    return (
      <Button
        disabled={!hasFilter}
        onClick={() => onFilterChange({ [EFilterKeys.CONDITION_TYPE]: [EConditionType.OR] })}
        sx={{
          maxWidth: 'fit-content',
          color: 'primary.main',
          position: 'absolute',
          right: 10,
          top: 15,
        }}
        {...props}>
        {t('button.reset')}
      </Button>
    );
  }

  function renderFilterContent(showResetButton = true) {
    return (
      <Box
        sx={{
          position: 'relative',
        }}>
        <Stack
          spacing={3}
          sx={{
            maxWidth: 400,
            p: 3,
          }}>
          {showResetButton && renderResetButton()}
          {groups.map(({ key, ...rest }) => (
            <CheckGroup
              key={key}
              values={filters[key] || []}
              {...rest}
              showAllLabel={isAndCondition || !hasFilter}
              onChange={(value) => {
                if (value.length === 0) {
                  onFilterChange(omit(filters, key));
                } else {
                  onFilterChange({ ...filters, [key]: value });
                }
              }}
            />
          ))}
        </Stack>
      </Box>
    );
  }

  return (
    <>
      <Tooltip title={`${t('common.filter')}${filterContent ? ` ( ${filterContent} )` : ''}`}>
        <Button
          ref={anchorRef}
          onClick={openMenu}
          variant="outlined"
          sx={{
            minWidth: 40,
            height: 40,
            ...(hasFilter && { color: 'primary.main' }),
          }}
          style={{ padding: 1 }}>
          <Icon icon={hasFilter ? FilterPlus : Filter} width={20} height={20} />
        </Button>
      </Tooltip>

      {isMobile ? (
        <Dialog open={open} onClose={closeMenu} fullScreen>
          <Box sx={{ pb: '72px', height: '100vh', overflow: 'auto' }}>{renderFilterContent(false)}</Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 2,
              gap: 2,
              borderTop: '1px solid',
              borderColor: 'divider',
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: 'background.paper',
              boxShadow: '0px -2px 4px rgba(0, 0, 0, 0.1)',
              zIndex: 1,
            }}>
            {renderResetButton({
              variant: 'outlined',
              sx: { flex: 1, position: 'static' },
            })}
            <Button variant="contained" onClick={closeMenu} sx={{ flex: 1 }}>
              {t('common.confirm')}
            </Button>
          </Box>
        </Dialog>
      ) : (
        <Popper open={open} placement="bottom" anchorEl={anchorRef.current} transition>
          {({ TransitionProps }) => (
            <Grow {...TransitionProps} style={{ transformOrigin: 'top center' }}>
              <Paper elevation={2} sx={{ mt: 1, mr: 1 }}>
                <ClickAwayListener onClickAway={closeMenu}>{renderFilterContent()}</ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      )}
    </>
  );
}
