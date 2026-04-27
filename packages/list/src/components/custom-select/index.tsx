import { styled, useTheme } from '@arcblock/ux/lib/Theme';
import CheckIcon from '@mui/icons-material/Check';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { ButtonProps } from '@mui/material/Button';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import SvgIcon from '@mui/material/SvgIcon';
import useMediaQuery from '@mui/material/useMediaQuery';

import { isEmpty } from 'lodash-es';
import { useCallback, useEffect, useRef, useState } from 'react';
import Button from './button';

function CustomSelect({ value, options, onChange, placeholder = '', ...buttonProps }: ICustomSelectProps) {
  const anchorRef = useRef<HTMLButtonElement | null>(null);
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [currentValue, setCurrentValue] = useState(value !== null ? value : '');
  const isSm = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    setCurrentValue(value !== null ? value : '');
  }, [value]);

  const closeMenu = useCallback(() => {
    setOpen(false);
  }, []);
  const openMenu = useCallback(() => {
    setOpen(true);
  }, []);

  function toggle(option) {
    setCurrentValue(option.value);
    onChange(option.value);
    if (isSm) {
      closeMenu();
    }
  }
  function containsValue(optionValue) {
    return optionValue === currentValue;
  }

  return (
    <>
      <StyledButton
        ref={anchorRef}
        onClick={openMenu}
        variant="outlined"
        size="medium"
        className={['my-select__selector', isEmpty(currentValue) ? '' : 'my-select__selector--active'].join(' ')}
        sx={{ minWidth: { xs: '100px', md: 'auto' }, color: 'text.primary', borderRadius: '8px' }}
        {...buttonProps}>
        {options.find((option) => option.value === currentValue)?.name || placeholder}
        <SvgIcon className="my-select__arrowdown" component={KeyboardArrowDownIcon} sx={{ width: 18, height: 18 }} />
      </StyledButton>
      <Popper open={open} anchorEl={anchorRef.current} transition sx={{ zIndex: '9999' }}>
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}>
            <Paper>
              <ClickAwayListener onClickAway={closeMenu}>
                <StyledMenuList autoFocusItem={open} onMouseEnter={openMenu} onMouseLeave={closeMenu}>
                  {options.map((option) => (
                    <MenuItem key={option.value} onClick={() => toggle(option)} sx={{ fontSize: 14 }}>
                      <CheckIcon
                        sx={{ mr: 1, fontSize: 16, visibility: containsValue(option.value) ? 'visible' : 'hidden' }}
                      />
                      {option.name}
                    </MenuItem>
                  ))}
                </StyledMenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
}

interface IOption {
  name: string;
  value: string;
}
interface ICustomSelectProps extends Omit<ButtonProps, 'onChange' | 'children'> {
  options: IOption[];
  value: IOption['value'];
  onChange: (value: IOption['value']) => void;
  placeholder?: string;
}

const StyledButton = styled(Button)<ButtonProps>`
  border: 1px solid ${(props) => props.theme.palette.divider};
  padding: 6px 8px 6px 12px;
  font-weight: ${(props) => props.theme.typography.fontWeightRegular};
  font-size: 14px;
  color: ${(props) => props.theme.palette.text.secondary};
  line-height: 1;
  text-transform: none;
  & + & {
    margin-left: 10px;
  }
  .my-select__arrowdown {
    color: ${(props) => props.theme.palette.grey[400]};
    font-size: 14px;
    margin-left: 6px;
  }
  .my-select__icon {
    font-size: 0;
    svg {
      color: ${(props) => props.theme.palette.grey[400]};
      font-size: 18px;
      margin-right: 3px;
    }
  }
`;

const StyledMenuList = styled(MenuList)`
  .my-select__option__icon {
    color: transparent;
    font-size: 14px;
    margin: 0 3px 0 -5px;
  }
  .my-select__option {
    font-size: 14px;
    color: #999;
  }
  .my-select__option--active {
    &,
    .my-select__option__icon {
      color: ${(props) => props.theme.palette.primary.main};
    }
  }
`;

export default CustomSelect;
