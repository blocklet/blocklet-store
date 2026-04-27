import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import { useListContext } from '../../contexts/list';
import { getSortOptions } from '../../libs/utils';
import CustomSelect from '../custom-select';

export default function AsideFilter() {
  const { search, t } = useListContext();
  const { filters, handleSort, handlePrice } = search;
  const sortOptions = getSortOptions(t);

  return (
    <Stack
      direction={{ xs: 'row', md: 'column' }}
      sx={{
        alignItems: { xs: 'center', md: 'flex-start' },
        gap: { xs: 1, md: 2 },
        width: { xs: '100%', md: 'auto' },
        justifyContent: 'space-between',
      }}>
      <FormControlLabel
        control={
          <Checkbox
            checked={filters.price === 'free'}
            size="small"
            sx={{ '& .MuiSvgIcon-fontSizeSmall': { fontSize: 16, color: 'text.hint' } }}
            onChange={(e) => handlePrice(e.target.checked ? 'free' : '')}
          />
        }
        label={t('blocklet.free')}
      />
      <CustomSelect
        value={filters.sortBy || sortOptions[0].value}
        options={sortOptions}
        onChange={(value) => handleSort(value as string)}
        placeholder={t('sort.sort')}
      />
    </Stack>
  );
}
