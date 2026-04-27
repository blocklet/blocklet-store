import Avatar from '@mui/material/Avatar';
import PropTypes from 'prop-types';
import { joinURL } from 'ufo';

import { getVersion } from '../libs/blocklet';
import { formatLogoPath } from '../libs/util';

const storeVersion = getVersion();

export default function BlockletAvatar({ blocklet, style = {}, size = 40, ...rest }) {
  let logoUrl = '';
  const prefix = window.blocklet && window.blocklet.prefix ? `${window.blocklet.prefix}` : '/';
  let apiPrefix = prefix.replace(/^\/+/, '').replace(/\/+$/, '');
  if (apiPrefix) {
    apiPrefix = `/${apiPrefix}`;
  }
  if (blocklet.meta.logo) {
    logoUrl = joinURL(
      apiPrefix,
      formatLogoPath({
        did: blocklet.meta.did,
        asset: blocklet.meta.logo,
        version: blocklet.meta.version,
      })
    );
  } else {
    logoUrl = joinURL(apiPrefix, `/blocklet.png?v=${storeVersion}`);
  }

  const setFallBackUrl = (ev) => {
    ev.target.src = `${apiPrefix}/images/blocklet.png?v=${storeVersion}`;
  };

  return (
    <Avatar style={Object.assign({ backgroundColor: 'transparent', border: '2px solid #ddd' }, style)} {...rest}>
      <img
        src={logoUrl}
        onError={setFallBackUrl}
        alt={blocklet.meta.name}
        style={{ width: size, backgroundColor: '#fff' }}
      />
    </Avatar>
  );
}

BlockletAvatar.propTypes = {
  blocklet: PropTypes.object.isRequired,
  style: PropTypes.object,
  size: PropTypes.number,
};
