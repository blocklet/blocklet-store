import { styled } from '@arcblock/ux/lib/Theme';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput, { OutlinedInputProps } from '@mui/material/OutlinedInput';
import { useDebounceFn } from 'ahooks';
import { useEffect, useState } from 'react';
import { useListContext } from '../contexts/list';

function BaseSearch({ placeholder, ...props }: OutlinedInputProps) {
  const { search, t } = useListContext();
  const { filters, handleKeyword } = search;
  const [searchStr, setSearchStr] = useState(filters.keyword || '');

  const debouncedSearch = useDebounceFn(handleKeyword, { wait: 300 });
  const handleChange = (event) => {
    const { value } = event.target;
    setSearchStr(value);
    debouncedSearch.run(value);
  };
  const handleClose = () => {
    setSearchStr('');
    handleKeyword('');
  };
  useEffect(() => {
    setSearchStr(filters.keyword || '');
  }, [filters.keyword]);

  const inputPlaceholder = placeholder || t('common.searchPlaceholder');

  return (
    <StyledSearch
      inputProps={{
        'data-cy': 'search-blocklet',
      }}
      startAdornment={
        <InputAdornment position="start">
          <StyledSearchIcon sx={{ fontSize: 18, ml: -0.5 }} />
        </InputAdornment>
      }
      onChange={handleChange}
      placeholder={inputPlaceholder}
      value={searchStr}
      title={inputPlaceholder}
      data-cy="search"
      endAdornment={
        searchStr && (
          <InputAdornment position="end">
            <StyledCloseIcon data-cy="search-delete" onClick={handleClose} />
          </InputAdornment>
        )
      }
      {...props}
    />
  );
}

const StyledSearch = styled(OutlinedInput)`
  background-color: ${(props) => props.theme.palette.grey[50]};
  font-size: 14px;
  border-radius: 6px;
  width: 100%;
  .MuiInputBase-input {
    padding: 8px 0 8px 0px;
  }
  .MuiOutlinedInput-notchedOutline {
    border: none;
  }
  .Mui-focused {
    background-color: #f6f6f6;
    .MuiInputBase-input::placeholder {
      color: transparent;
    }
  }
`;

const StyledSearchIcon = styled(SearchIcon)`
  color: ${(props) => props.theme.palette.grey[500]};
`;

const StyledCloseIcon = styled(CloseIcon)`
  color: ${(props) => props.theme.palette.grey[500]};
  font-size: 16px;
  cursor: pointer;
`;

export default BaseSearch;
