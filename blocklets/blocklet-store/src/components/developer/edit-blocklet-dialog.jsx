import { useRef, useContext, useImperativeHandle, useCallback } from 'react';
import { useReactive } from 'ahooks';
import PropTypes from 'prop-types';
import Dialog from '@arcblock/ux/lib/Dialog';
import Button from '@arcblock/ux/lib/Button';
import { LocaleContext } from '@arcblock/ux/lib/Locale/context';

import BlockletForm from './blocklet-form';

/**
 * BlockletFormDialog 组件
 * @param {Object} props - 组件属性
 * @param {React.RefObject} props.ref - 组件引用，用于调用 edit 方法
 * @returns {JSX.Element} 返回编辑 Blocklet 的对话框组件
 */
function BlockletFormDialog({ ref = null }) {
  const formRef = useRef(null);
  const dataTmp = {
    isEdit: false,
    open: false,
    loading: false,
    onConfirm: () => {},
  };

  const { t } = useContext(LocaleContext);
  const state = useReactive({ ...dataTmp });

  const handleClose = useCallback(() => {
    state.open = false;
  }, [state]);
  const handleSubmit = useCallback(async () => {
    await formRef.current?.onSubmit();
  }, []);

  useImperativeHandle(ref, () => ({
    edit: (data = {}, onConfirm = () => undefined) => {
      Object.assign(state, dataTmp, { open: true, onConfirm, isEdit: true });
      setTimeout(() => {
        formRef.current?.edit(data);
      });
    },
  }));

  return (
    <Dialog
      title={t('form.edit', { name: 'Blocklet' })}
      fullWidth
      open={state.open}
      onClose={handleClose}
      actions={
        <Button loading={state.loading} onClick={handleSubmit} color="primary" autoFocus variant="contained">
          {t('common.confirm')}
        </Button>
      }>
      <BlockletForm state={state} ref={formRef} />
    </Dialog>
  );
}

BlockletFormDialog.propTypes = {
  ref: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({ current: PropTypes.any })]),
};

export default BlockletFormDialog;
