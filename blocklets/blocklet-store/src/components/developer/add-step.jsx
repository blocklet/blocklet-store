import { useRef, useContext, useImperativeHandle } from 'react';
import PropTypes from 'prop-types';
import { LocaleContext } from '@arcblock/ux/lib/Locale/context';
import Radio from '@mui/material/Radio';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import colors from '@arcblock/ux/lib/Colors';

import BlockletForm from './blocklet-form';
import { NoneBlocklet, ExistBlocklet } from './what-next';
import AccessTokenInfo from '../access-token/info';

const NewBlocklet = 'new-blocklet';

function StepOne({ state }) {
  const { t } = useContext(LocaleContext);
  return (
    <Box
      sx={{
        pl: '24px',
      }}>
      <RadioGroup
        aria-label="gender"
        name="gender1"
        value={state.step1}
        onChange={(v) => {
          state.step1 = v.target.value;
        }}>
        <FormControlLabel value="new-blocklet" control={<Radio />} label={t('blocklet.noBlocklet')} />
        <FormControlLabel value="existing-blocklet" control={<Radio />} label={t('blocklet.developedBlocklet')} />
      </RadioGroup>
    </Box>
  );
}

function StepTwo({ ref = null, ...props }) {
  const { t } = useContext(LocaleContext);
  const { state } = props;
  const formRef = useRef(null);
  useImperativeHandle(ref, () => ({
    submit: async () => {
      await formRef.current?.onSubmit();
    },
  }));
  const onChangeSwitch = () => {
    state.hideAccessToken = !state.hideAccessToken;
  };

  if (state.step1 === NewBlocklet)
    return (
      <Box>
        <BlockletForm state={state} ref={formRef} />
      </Box>
    );
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t('blocklet.autoCreateAccessToken')}
      </Typography>
      <AccessTokenInfo onChangeSwitch={onChangeSwitch} state={state} />
    </Box>
  );
}

StepTwo.propTypes = {
  ref: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({ current: PropTypes.any })]),
};

function StepThree({ state }) {
  const { t } = useContext(LocaleContext);
  if (state.step1 === NewBlocklet)
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          <Box
            sx={{
              color: 'success.main',
            }}>
            {t('blocklet.waiteDevelop')}
          </Box>
        </Typography>
        <NoneBlocklet name={state.name} did={state.did} />
      </Box>
    );
  return (
    <Box>
      <Typography variant="h6" gutterBottom style={{ color: colors.success.main }}>
        {t('blocklet.waiteUpload')}
      </Typography>
      <ExistBlocklet />
    </Box>
  );
}
StepOne.propTypes = {
  state: PropTypes.object.isRequired,
};
StepTwo.propTypes = {
  state: PropTypes.object.isRequired,
};
StepThree.propTypes = {
  state: PropTypes.object.isRequired,
};
export { StepOne, StepTwo, StepThree, NewBlocklet };
