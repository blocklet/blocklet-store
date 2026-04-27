import { useContext } from 'react';
import PropTypes from 'prop-types';
import { LocaleContext } from '@arcblock/ux/lib/Locale/context';
import Button from '@arcblock/ux/lib/Button';
import CodeBlock from '@arcblock/ux/lib/CodeBlock';
import { Box, Typography, Checkbox, FormControlLabel } from '@mui/material';
import { joinURL, withoutTrailingSlash } from 'ufo';

import { useSessionContext } from '../../contexts/session';
import { getUrlPrefix } from '../../libs/util';

function AccessTokenInfo({ state = {} }) {
  const { t } = useContext(LocaleContext);
  const { session } = useSessionContext();
  const onChangeSwitch = () => {
    state.hideAccessToken = !state.hideAccessToken;
  };
  const handleChange = (event) => {
    state.read = event.target.checked;
  };

  const { prefix } = getUrlPrefix();
  const storeUrl = withoutTrailingSlash(joinURL(window.blocklet.appUrl, prefix));
  return (
    <>
      {state.saveTokenTip && <Typography>{t('setting.accessToken.saveTokenTip')}</Typography>}
      <Box
        sx={{
          marginBottom: '24px',
        }}>
        {state.hideAccessToken ? (
          <Button color="primary" onClick={onChangeSwitch} data-cy="access-token-reveal">
            {t('setting.accessToken.showToken')}
          </Button>
        ) : (
          <>
            {state.showSecretKey && (
              <>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '16px',
                    marginBottom: '6px',
                    marginTop: '10px',
                  }}>
                  {t('common.accessToken')}
                </Box>
                <CodeBlock language="shell" data-cy="access-token-secret">
                  {state.secretKey}
                </CodeBlock>
              </>
            )}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '16px',
                marginBottom: '6px',
                marginTop: '20px',
              }}>
              {t('common.setCommand')}
            </Box>
            <CodeBlock language="json" data-cy="access-token-code">
              {`blocklet config set accessToken ${state.secretKey} --profile ${window.location.origin}
blocklet config set store ${storeUrl} --profile ${window.location.origin}
blocklet config set developerDid ${session.user.did} --profile ${window.location.origin}
`}
            </CodeBlock>
          </>
        )}
      </Box>
      <div>
        <FormControlLabel
          value="end"
          data-cy="access-token-saved"
          disabled={state.hideAccessToken}
          control={<Checkbox checked={state.read} onChange={handleChange} />}
          label={state.showSecretKey ? t('setting.accessToken.iKnow') : t('setting.accessToken.iConfig')}
          labelPlacement="end"
        />
      </div>
    </>
  );
}

AccessTokenInfo.propTypes = {
  state: PropTypes.object,
};

export default AccessTokenInfo;
