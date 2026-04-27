import { useImperativeHandle } from 'react';
import Dialog from '@arcblock/ux/lib/Dialog';
import PropTypes from 'prop-types';
import { useReactive } from 'ahooks';

function BlockletLicenseDialog({ ref = null }) {
  const state = useReactive({
    open: false,
  });
  useImperativeHandle(ref, () => ({
    open: () => {
      state.open = true;
    },
  }));
  return (
    <Dialog
      open={state.open}
      onClose={() => {
        state.open = false;
      }}
      title="Blocklet协议"
      fullScreen>
      <div style={{ textAlign: 'center' }}>
        <h1>这是Blocklet协议</h1>

        <h2>第一要</h2>

        <p>......</p>

        <h2>第二要</h2>

        <p>........</p>

        <h2>end</h2>
      </div>
    </Dialog>
  );
}

BlockletLicenseDialog.propTypes = {
  ref: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({ current: PropTypes.any })]),
};

export default BlockletLicenseDialog;
