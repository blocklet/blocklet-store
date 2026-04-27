import { memo, useContext } from 'react';
import PropTypes from 'prop-types';
import { Pencil, Delete } from 'mdi-material-ui';
import { LocaleContext } from '@arcblock/ux/lib/Locale/context';

import RowActions from '../row-actions';

function TableActions({ rowData, openEditDialog, onDelete }) {
  const { t } = useContext(LocaleContext);

  const handleEdit = (handleClose) => {
    handleClose();
    openEditDialog(rowData);
  };

  const handleDelete = (handleClose) => {
    handleClose();
    onDelete(rowData);
  };

  const actions = [
    {
      name: 'category-edit',
      text: t('common.edit'),
      icon: Pencil,
      handler: handleEdit,
      props: { 'data-cy': 'category-edit' },
    },
    {
      name: 'category-delete',
      text: t('common.delete'),
      icon: Delete,
      handler: handleDelete,
      props: { 'data-cy': 'category-delete' },
    },
  ];

  return <RowActions actions={actions} />;
}
TableActions.propTypes = {
  rowData: PropTypes.object.isRequired,
  openEditDialog: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default memo(TableActions);
