import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import SortAscending from '@iconify-icons/tabler/sort-ascending-2';
import SortDescending from '@iconify-icons/tabler/sort-descending-2';
import { Icon } from '@iconify/react';
import { Box, Button, ClickAwayListener, Grow, IconButton, Paper, Popper, Stack, Typography } from '@mui/material';
import { useCallback, useRef, useState } from 'react';
import Tooltip from '../../../components/tooltip';
import { ESortDirection } from '../../../constants';

export default function BlockletSort({
  sort,
  onSortChange,
  groups,
}: {
  sort: { name: string; direction: ESortDirection };
  groups: { key: string; title: string }[];
  onSortChange: (sort: { name: string; direction: ESortDirection }) => void;
}) {
  const { t } = useLocaleContext();
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);

  const closeMenu = useCallback(() => {
    setOpen(false);
  }, []);
  const openMenu = useCallback(() => {
    setOpen(true);
  }, []);

  const activeTitle = groups.find((g) => g.key === sort.name)?.title;

  return (
    <>
      <Tooltip title={t(sort.direction === 'desc' ? 'blocklet.sortDesc' : 'blocklet.sortAsc', { name: activeTitle })}>
        <Button
          ref={anchorRef}
          onClick={openMenu}
          variant="outlined"
          sx={{
            p: 1.5,
            minWidth: 40,
            height: 40,
            color: 'primary.main',
          }}>
          <Icon icon={sort.direction === 'desc' ? SortDescending : SortAscending} width={22} height={22} />
          <Typography variant="body1" sx={{ cursor: 'pointer', userSelect: 'none', color: 'text.secondary' }}>
            {activeTitle}
          </Typography>
        </Button>
      </Tooltip>
      <Popper open={open} placement="bottom-end" anchorEl={anchorRef.current} transition sx={{}}>
        {({ TransitionProps }) => (
          <Grow {...TransitionProps} style={{ transformOrigin: 'top right' }}>
            <Paper elevation={2} sx={{ mt: 1 }}>
              <ClickAwayListener onClickAway={closeMenu}>
                <Box
                  sx={{
                    position: 'relative',
                  }}>
                  <Stack sx={{ p: 2, color: 'text.hint' }} spacing={2}>
                    {groups.map(({ key, title }) => (
                      <SortItem name={key} title={title} sort={sort} onSortChange={onSortChange} />
                    ))}
                  </Stack>
                </Box>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
}

function SortItem({
  title,
  name,
  sort,
  onSortChange,
}: {
  title: string;
  name: string;
  sort: { name: string; direction: ESortDirection };
  onSortChange: (sort: { name: string; direction: ESortDirection }) => void;
}) {
  const { t } = useLocaleContext();
  const isActive = sort.name === name;
  const isDesc = isActive ? sort.direction === 'desc' : true;
  return (
    <Box
      onClick={() => {
        if (isActive) {
          onSortChange({ name, direction: isDesc ? ESortDirection.ASC : ESortDirection.DESC });
        } else {
          onSortChange({ name, direction: ESortDirection.DESC });
        }
      }}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
      }}>
      <Tooltip placement="top" disableInteractive title={t('blocklet.sortDesc', { name: title })}>
        <IconButton size="large" sx={{ p: 0, mr: 0.5, ...(isActive ? { color: 'primary.main' } : {}) }}>
          <Icon icon={isDesc ? SortDescending : SortAscending} width={20} height={20} />
        </IconButton>
      </Tooltip>
      <Typography
        variant="body1"
        sx={{ cursor: 'pointer', userSelect: 'none', ...(isActive ? { color: 'text.primary' } : {}) }}>
        {title}
      </Typography>
    </Box>
  );
}
