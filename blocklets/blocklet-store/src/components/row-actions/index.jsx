import { useState } from 'react';
import PropTypes from 'prop-types';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SvgIcon from '@mui/material/SvgIcon';

function RowActions({ actions }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton size="large" data-cy="row-actions" onClick={handleClick}>
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}>
        {actions.map((item) => {
          return (
            <MenuItem key={item.name} {...item.props} onClick={() => item.handler(handleClose)}>
              <ListItemIcon style={{ minWidth: 24 }}>
                <SvgIcon component={item.icon} fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}

RowActions.propTypes = {
  actions: PropTypes.array.isRequired,
};

export default RowActions;
