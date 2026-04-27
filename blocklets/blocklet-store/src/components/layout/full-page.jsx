import FullPage from '@arcblock/did-connect-react/lib/Connect/fullpage';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';

export default function Wrapper({ children = null, containerRef = null }) {
  return (
    <FullPage did={window?.blocklet?.appPid}>
      <Box
        sx={{
          maxWidth: '100%',
          height: '100%',
        }}
        ref={containerRef}>
        {children}
      </Box>
    </FullPage>
  );
}

Wrapper.propTypes = {
  children: PropTypes.node,
  containerRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({ current: PropTypes.any })]),
};
