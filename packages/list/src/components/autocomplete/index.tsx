import Avatar from '@arcblock/ux/lib/Avatar';
import SearchIcon from '@iconify-icons/tabler/search';
import CloseIcon from '@iconify-icons/tabler/x';
import { Icon } from '@iconify/react';
import MuiAutocomplete, { AutocompleteProps } from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import OutlinedInput from '@mui/material/OutlinedInput';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useDebounceFn, useRequest } from 'ahooks';
import { useEffect, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { joinURL, withQuery } from 'ufo';
import useStoreApi from '../../hooks/use-store-api';
import constant from '../../libs/constant';
import { formatImagePath } from '../../libs/utils';

const DEFAULT_FREE_TEXT = '__FREE_TEXT__';
const NO_RESULT_TEXT = '__NO_RESULT__';
const ICON_SIZE = 40;

export default function Autocomplete({
  endpoint,
  t,
  locale,
  filters,
  handleKeyword,
  handleSearchSelect,
  ...rest
}: {
  endpoint: string;
  t: any;
  locale: string;
  placeholder?: string;
  filters: IFilters;
  handleKeyword: (keyword: string) => void;
  handleSearchSelect: (option: Partial<IBlockletMeta>) => void;
} & Omit<
  AutocompleteProps<any, boolean, boolean, boolean>,
  | 'renderInput'
  | 'renderOption'
  | 'onInputChange'
  | 'onChange'
  | 'value'
  | 'options'
  | 'inputValue'
  | 'getOptionLabel'
  | 'getOptionKey'
  | 'isOptionEqualToValue'
  | 'noOptionsText'
  | 'loading'
  | 'forcePopupIcon'
  | 'slotProps'
  | 'filterOptions'
>) {
  const autocompleteRef = useRef<HTMLDivElement>(null);
  const isSelectedOption = useRef(false);
  const [open, setOpen] = useState(false);
  const [freeText, setFreeText] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const storeApi = useStoreApi();
  const [loading, setIsLoading] = useState(false);

  const placeholder = rest?.placeholder || t('common.searchStore');

  const getBlocklets = async (params: Partial<IFilters>) => {
    setIsLoading(true);
    const data = await storeApi.get(joinURL(endpoint, withQuery(constant.blockletsPath, params)));
    setIsLoading(false);
    return data.dataList || [];
  };

  const { data, run } = useRequest<IBlockletMeta[], any>(
    (keyword) => {
      if (!keyword) return Promise.resolve([]);
      return getBlocklets({
        sortBy: constant.nameDesc,
        page: 1,
        pageSize: 10,
        keyword,
        showResources: 'true',
      });
    },
    {
      manual: true,
    }
  );

  useEffect(() => {
    setIsLoading(true);
    run(filters.keyword);
    setFreeText(filters.keyword || '');
  }, [filters.keyword, run]);

  useHotkeys(
    'ctrl + k, command + k',
    (e) => {
      e.stopPropagation();
      e.preventDefault();
      autocompleteRef.current?.querySelector('input')?.focus();
      return false;
    },
    { enableOnTags: ['INPUT'] }
  );

  const query = useDebounceFn((text) => run(text), { wait: 300 });
  const firstOption = { name: DEFAULT_FREE_TEXT, title: freeText, did: '' };

  let options: Partial<IBlockletMeta>[] = [];
  if (freeText) {
    if (loading) {
      options = [firstOption];
    } else if (data?.length) {
      options = [firstOption, ...data];
    } else {
      options = [{ name: NO_RESULT_TEXT, title: t('blocklet.noResults'), did: '' }];
    }
  }

  return (
    <>
      <Dialog fullScreen open={openModal} sx={{ display: { md: 'none' } }}>
        <Box
          sx={{
            p: 2,
            pb: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}>
          <OutlinedInput
            fullWidth
            sx={{
              bgcolor: 'grey.50',
              px: 1,
              py: 0.5,
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
            placeholder={placeholder}
            className="bl-autocomplete-input"
            value={freeText}
            onChange={(e) => handleInputChange(e.target.value)}
            startAdornment={renderStartAdornment(openModal)}
            endAdornment={renderEndAdornment()}
          />
          <Button
            variant="outlined"
            onClick={() => {
              setOpenModal(false);
              setFreeText(filters.keyword || '');
            }}>
            {t('common.cancel')}
          </Button>
        </Box>
        <MenuList sx={{ p: 0.5 }}>{options.map((option) => renderOption(option))}</MenuList>
      </Dialog>
      <Box sx={{ display: { sx: 'block', md: 'none' }, paddingTop: 1, opacity: 0.5 }}>
        <Icon icon={SearchIcon} style={{ fontSize: 22, color: 'inherit' }} onClick={() => setOpenModal(true)} />
      </Box>
      <MuiAutocomplete
        ref={autocompleteRef}
        open={!!freeText && open}
        size="small"
        onOpen={() => setOpen(true)}
        onClose={(_, reason) => {
          setOpen(false);
          if (reason === 'selectOption' && !isSelectedOption.current) {
            handleKeyword(freeText);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !freeText) {
            handleClear();
          }
        }}
        disableClearable
        inputValue={freeText}
        onInputChange={(_, value) => handleInputChange(value)}
        isOptionEqualToValue={(option, value) => option.name === value.name}
        getOptionLabel={(option) => option.title}
        getOptionKey={(option) => option.name}
        noOptionsText={t('blocklet.noResults')}
        autoHighlight
        forcePopupIcon={false}
        slotProps={{
          paper: {
            sx: {
              mt: 0.5,
              minWidth: '100%',
              width: 'fit-content',
              '& > ul': { p: 0.5 },
            },
          },
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            InputProps={{
              ...params.InputProps,
              autoFocus: true,
              placeholder,
              className: 'bl-autocomplete-input',
              value: freeText,
              startAdornment: renderStartAdornment(open),
              endAdornment: renderEndAdornment(),
            }}
          />
        )}
        filterOptions={(x) => x}
        {...rest}
        options={options}
        renderOption={(_props, option) => renderOption(option)}
        value={firstOption}
        sx={[
          {
            bgcolor: 'grey.50',
            borderRadius: '8px',
            overflow: 'hidden',
            '.MuiOutlinedInput-notchedOutline': {
              borderRadius: '8px',
              borderColor: 'transparent',
            },
            '&&:hover .MuiOutlinedInput-notchedOutline, &&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: 'divider',
              borderWidth: '1px',
            },
          },
          ...(Array.isArray(rest.sx) ? rest.sx : [rest.sx]),
        ]}
      />
    </>
  );

  function handleInputChange(value: string) {
    setIsLoading(true);

    setFreeText(value);
    isSelectedOption.current = false;
    query.run(value);
  }

  function handleClear() {
    setOpenModal(false);
    setFreeText('');
    handleInputChange('');
    handleKeyword('');
  }

  function handleSelect(option: Partial<IBlockletMeta>) {
    if (option?.did) {
      setOpenModal(false);
      isSelectedOption.current = true;
      setFreeText('');
      handleSearchSelect(option);
    } else if (option.name === DEFAULT_FREE_TEXT) {
      setOpenModal(false);
      handleKeyword(freeText);
    }
  }

  function renderOption(option: Partial<IBlockletMeta>) {
    return (
      <MenuItem
        key={option.did}
        sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, borderRadius: '8px' }}
        onClick={() => handleSelect(option)}>
        {renderOptionIcon(option)}
        <Typography variant="body1">
          <Typography
            sx={{
              fontWeight: 'fontWeightMedium',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}>
            {option.title}
          </Typography>
          <Typography
            sx={{
              fontSize: '13px',
              color: 'text.hint',
            }}>
            {option.category?.locales?.[locale || 'en'] || ''}
          </Typography>
        </Typography>
      </MenuItem>
    );
  }
  function renderOptionIcon(option: Partial<IBlockletMeta>) {
    if ([DEFAULT_FREE_TEXT, NO_RESULT_TEXT].includes(option.name!)) {
      return (
        <Box
          sx={{
            width: ICON_SIZE,
            p: '6px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'text.hint',
            bgcolor: 'grey.100',
            borderRadius: '8px',
          }}>
          <Icon icon={SearchIcon} style={{ fontSize: 28 }} />
        </Box>
      );
    }
    let logoUrl: string = '';
    if (option.logo) {
      logoUrl = joinURL(endpoint, 'assets', option.did!, formatImagePath(option.logo, ICON_SIZE, option.version));
    }
    return <Avatar src={logoUrl} size={ICON_SIZE} style={{ borderRadius: '8px', overflow: 'hidden' }} />;
  }

  function renderStartAdornment(showLoading = true) {
    return (
      <Box sx={{ display: 'flex', pl: 0.5, alignItems: 'center', color: 'text.hint' }}>
        {showLoading && freeText && loading ? (
          <CircularProgress color="inherit" size={16} />
        ) : (
          <Icon icon={SearchIcon} style={{ fontSize: 16, cursor: 'default' }} />
        )}
      </Box>
    );
  }

  function renderEndAdornment() {
    return freeText ? (
      <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.hint' }}>
        <Icon
          icon={CloseIcon}
          style={{ fontSize: 20, cursor: 'pointer', color: 'inherit' }}
          onClick={() => handleClear()}
        />
      </Box>
    ) : null;
  }
}
