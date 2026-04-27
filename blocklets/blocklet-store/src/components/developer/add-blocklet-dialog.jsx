import { useRef, useContext, useImperativeHandle, useMemo, useCallback } from 'react';
import { useReactive } from 'ahooks';
import PropTypes from 'prop-types';
import { css } from '@emotion/react';
import Dialog from '@arcblock/ux/lib/Dialog';
import { LocaleContext } from '@arcblock/ux/lib/Locale/context';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import Box from '@mui/material/Box';
import StepLabel from '@mui/material/StepLabel';
import Button from '@arcblock/ux/lib/Button';
import Toast from '@arcblock/ux/lib/Toast';

import { StepOne, StepTwo, StepThree, NewBlocklet } from './add-step';
import api from '../../libs/api';

const cssMap = {
  root: () => css`
    width: 100%;
    .MuiStepper-root {
      padding-top: 0px;
    }
  `,
};

function getStepContent(state, formRef) {
  switch (state.activeStep) {
    case 0:
      return <StepOne state={state} />;
    case 1:
      return <StepTwo state={state} ref={formRef} />;
    case 2:
      return <StepThree state={state} />;
    default:
      return 'Unknown stepIndex';
  }
}

/**
 * @typedef {Object} AddBlockletDialogProps
 * @property {React.RefObject} [ref] - 组件的 ref 引用
 */

/**
 * 添加 Blocklet 对话框组件
 * @param {AddBlockletDialogProps} props - 组件属性
 * @returns {JSX.Element} 对话框组件
 */
function AddBlockletDialog({ ref = null }) {
  const dataTmp = {
    open: false,
    loading: false,
    activeStep: 0,
    hideAccessToken: false,
    secretKey: '',
    read: false, // step2 中用户是否按提示操作
    isEdit: false, // step2 中表单是否是编辑模式
    step1: NewBlocklet,
    name: '',
    did: '',
    onConfirm: () => {},
  };

  const { t } = useContext(LocaleContext);

  const formRef = useRef(null);
  const state = useReactive({ ...dataTmp });
  const steps = useMemo(
    () => [
      t('blocklet.selectAddBlocklet'),
      state.step1 === NewBlocklet ? t('blocklet.createBlocklet') : t('blocklet.configBlockletCli'),
      t('blocklet.result'),
    ],
    [state.step1, t]
  );
  const nextDisabled = useMemo(() => {
    if (!!state.secretKey && !state.read) return true;
    return false;
  }, [state.read, state.secretKey]);

  const handleClose = useCallback(() => {
    state.open = false;
  }, [state]);

  useImperativeHandle(ref, () => ({
    open: ({ onConfirm = () => undefined } = {}) => {
      Object.assign(state, dataTmp, { open: true, onConfirm });
    },
    close: handleClose,
  }));

  const handleNext = async () => {
    if (state.activeStep === 0 && state.step1 === 'existing-blocklet') {
      try {
        state.loading = true;
        const { data } = await api.post('/api/developer/access-tokens', { remark: 'create on add blocklet' });
        state.secretKey = data?.secretKey;
      } catch (error) {
        state.open = false;
        Toast.error(error?.response?.data?.error);
      } finally {
        state.loading = false;
      }
    }
    if (state.activeStep === 1 && state.step1 === NewBlocklet) {
      await formRef.current.submit();
    }
    // 判断step1的值，如果是新创建的，需要调用 onConfirm
    if (state.activeStep === 2 && state.step1 === NewBlocklet) {
      state.onConfirm();
      state.open = false;
    }
    if (state.activeStep === 2) {
      state.open = false;
      return;
    }
    state.activeStep += 1;
  };

  return (
    <Dialog
      title={t('form.add', { name: 'Blocklet' })}
      fullWidth
      open={state.open}
      onClose={handleClose}
      actions={
        <Button
          loading={state.loading}
          disabled={nextDisabled}
          variant="contained"
          color="primary"
          onClick={handleNext}>
          {state.activeStep === steps.length - 1 ? t('common.confirm') : t('common.next')}
        </Button>
      }>
      <div css={cssMap.root}>
        <Stepper activeStep={state.activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box
          sx={{
            pl: '24px',
          }}>
          {getStepContent(state, formRef)}
        </Box>
      </div>
    </Dialog>
  );
}

AddBlockletDialog.propTypes = {
  ref: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({ current: PropTypes.any })]),
};

export default AddBlockletDialog;
