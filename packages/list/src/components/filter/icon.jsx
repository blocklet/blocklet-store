import { useState } from 'react';
// import styled from '@emotion/styled';
import { styled } from '@arcblock/ux/lib/Theme';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import Dialog from '@arcblock/ux/lib/Dialog';
import Button from '@mui/material/Button';

import { useListContext } from '../../contexts/list';
import FilterGroup from './group';

function FilterIcon() {
  const { selectedCategory, handleCategory, t, handlePrice, filters, categoryOptions, priceOptions } = useListContext();
  const [open, setOpen] = useState(false);

  const handelChange = (type, value) => {
    if (type === 'category') {
      handleCategory(value);
    }
    if (type === 'price') {
      handlePrice(value);
    }
    setOpen(false);
  };

  return (
    <StyledDiv>
      <Button variant="outlined" className="filter-button" onClick={() => setOpen(true)}>
        <FilterAltOutlinedIcon className="filter-icon" fontSize="small" />
      </Button>
      <Dialog fullWidth title="" open={open} onClose={() => setOpen(false)}>
        <FilterGroup
          title={t('common.price')}
          options={priceOptions}
          value={filters.price}
          onChange={(v) => {
            handelChange('price', v);
          }}
        />
        {categoryOptions.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            <FilterGroup
              title={t('common.category')}
              options={categoryOptions}
              value={selectedCategory}
              onChange={(v) => {
                handelChange('category', v);
              }}
            />
          </div>
        )}
      </Dialog>
    </StyledDiv>
  );
}

const StyledDiv = styled('div')`
  .filter-button {
    border-color: rgb(240, 240, 240);
    padding: 5px 8px;
    min-width: initial;
  }
  .filter-icon {
    cursor: pointer;
    color: ${(props) => props.theme.palette.grey[500]};
  }
`;

FilterIcon.propTypes = {};
export default FilterIcon;
