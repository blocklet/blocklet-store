import { styled } from '@arcblock/ux/lib/Theme';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import { uniqBy } from 'lodash-es';
import { memo } from 'react';
import PropTypes from 'prop-types';
import { joinURL, withQuery } from 'ufo';

import Blocklet from '@arcblock/ux/lib/Blocklet';
import Center from '@arcblock/ux/lib/Center';
import Empty from '@arcblock/ux/lib/Empty';
import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';

import { useRequest } from 'ahooks';

import api from '../../../libs/api';
import { parseBlockletStoreUrl } from '../../../libs/blocklet';
import { formatLogoPath } from '../../../libs/util';

async function patchStoreUrl(component) {
  const bundleSource = component?.bundleSource;
  if (bundleSource?.store) {
    return;
  }

  const installUrl = bundleSource?.url;
  if (installUrl) {
    const storeUrl = await parseBlockletStoreUrl(installUrl);
    if (storeUrl) {
      bundleSource.store = storeUrl;
    }
  }
}

export default function BlockletComponents({ did }) {
  const { t } = useLocaleContext();
  const state = useRequest(async () => {
    const prefix = window.blocklet ? window.blocklet.prefix : '/';
    const url = withQuery(joinURL(window.location.origin, prefix, '/api/blocklets', did, '/blocklet.json'), {
      source: 'webapp',
    });
    const { data } = await api.get(`/api/blocklets/resolve?url=${encodeURIComponent(url)}`);
    const promiseList = data.filter((x) => x.meta.did !== did).map((x) => patchStoreUrl(x));
    await Promise.all(promiseList);
    return data;
  });

  if (state.loading) {
    return (
      <Center relative="parent">
        <CircularProgress />
      </Center>
    );
  }

  if (state.error) {
    return (
      <Center relative="parent">
        <Empty>{state.error.message}</Empty>
      </Center>
    );
  }

  const components = uniqBy(
    state.data.filter((x) => x.meta.did !== did),
    'meta.did'
  );
  if (!components.length) {
    return (
      <Center relative="parent">
        <Empty>{t('blocklet.noComponents')}</Empty>
      </Center>
    );
  }

  return (
    <StyledGrid container>
      {components.map((x) => {
        // 1. 如果 bundleSource.store 存在，则使用 bundleSource.store
        // 2. 如果 bundleSource.url 存在，则使用 bundleSource.url 解析的 storeUrl
        // 2.1 如果解析失败，则使用 bundleSource.url
        // 3. 认为当前 blocklet 属于该商店，使用当前商店的地址
        let coverUrl = null;
        let detailUrl = joinURL(window.location.origin, window.blocklet.prefix, '/blocklets', x.meta.did);
        const storeUrl = x.bundleSource.store;
        if (storeUrl) {
          coverUrl = formatLogoPath({
            did: x.meta.did,
            asset: 'logo',
            version: x.meta.version,
            size: 160,
            target: joinURL(storeUrl, '/api/blocklets'),
            // HACK: 由于 imageFilter 参数会被 service 拦截，需要避免使用该参数（使用其他名字来代替）
          }).replace('imageFilter=', '_imageFilter=');
          detailUrl = joinURL(storeUrl, '/blocklets', x.meta.did);
        } else if (x.bundleSource.url) {
          detailUrl = x.bundleSource.url;
        }

        const onView = () => window.open(detailUrl, '_blank');

        return (
          <StyledGridItem key={x.meta.did} item lg={4} md={6} sm={6} xs={12}>
            <Blocklet
              title={x.meta.title}
              description={x.meta.description}
              cover={coverUrl}
              buttonText={t('common.view')}
              onButtonClick={onView}
              onMainClick={onView}
              version={x.meta.version}
              did={x.meta.did}
            />
          </StyledGridItem>
        );
      })}
    </StyledGrid>
  );
}

BlockletComponents.propTypes = {
  did: PropTypes.string.isRequired,
};

const StyledGrid = styled(Grid)`
  &.MuiGrid-root {
    width: 100%;
    margin: 0 -16px;
  }
`;

const StyledGridItem = memo(styled(Grid)`
  @media (max-width: ${(props) => props.theme.breakpoints.values.sm}px) {
    &.MuiGrid-item {
      padding-bottom: 0px;
    }
  }
  @media (min-width: ${(props) => props.theme.breakpoints.values.sm}px) {
    &.MuiGrid-item {
      margin-bottom: ${(props) => props.theme.spacing(2)};
    }
  }
`);
