import Blocklet, { ActionButton } from '@arcblock/ux/lib/Blocklet';
import Button from '@arcblock/ux/lib/Button';
import Empty from '@arcblock/ux/lib/Empty';
import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import BlockletList from '@blocklet/list';
import AddComponent from '@blocklet/ui-react/lib/ComponentManager/components/add-component';
import CheckCircleRoundedIcon from '@iconify-icons/material-symbols/check-circle-rounded';
import UpgradeRoundedIcon from '@iconify-icons/material-symbols/upgrade-rounded';
import { Icon } from '@iconify/react';
import Box from '@mui/material/Box';

import { useCreation, useMemoizedFn, useUpdate } from 'ahooks';
import { MouseEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { QueryObject, joinURL, withQuery } from 'ufo';

import PageLayout from '../components/page-layout';
import { displayAttributes, formatLogoPath, getCurrentVersion, getInstallOrUpgrade } from '../libs/util';

type TagItem = {
  id: string;
  title: string;
  description?: string;
  hidden?: boolean;
  params: {
    [key: string]: any;
  };
};

function formatTagFilters(list = []) {
  return list
    .filter((x: TagItem) => x.hidden !== true)
    .map((x: TagItem & { paramList?: Array<{ name: string; value: string }> }) => {
      const item = {
        ...x,
        params: (x.paramList || []).reduce((acc: { [key: string]: any }, { name, value }) => {
          acc[name] = value;
          return acc;
        }, {}),
      };
      delete item.paramList;
      return item;
    });
}

const endpoint = window.blocklet?.preferences?.endpoint || '';
const tagFilters: TagItem[] = formatTagFilters(window.blocklet?.preferences?.tagFilters || []);

function BlockletRender({ blocklet }: any) {
  const { t, locale } = useLocaleContext();
  let logoUrl = null;
  const onClickLink = (e: MouseEvent) => {
    if (!e.currentTarget.contains(e.target as Node)) {
      e.preventDefault();
      return false;
    }
    return true;
  };

  const actionType = getInstallOrUpgrade(blocklet);

  if (blocklet.logo) {
    logoUrl = joinURL(
      endpoint,
      formatLogoPath({
        did: blocklet.did,
        asset: blocklet.logo,
        version: blocklet.version,
        size: 160,
      }),
    );
  }

  const findButtonText = useMemoizedFn((buttonId) => {
    const buttons = window.blocklet?.preferences?.buttons || [];
    const findButton = buttons.find((x: any) => x.id === buttonId);
    if (findButton) {
      const translations = findButton.translations || [];
      const translation = translations.find((x: any) => x.locale === locale);
      if (translation?.value) {
        return translation.value;
      }
    }
    return undefined;
  });

  const buttonText = useCreation(() => {
    if (actionType === 'upgrade') {
      return findButtonText('upgrade') || t('common.upgrade');
    }
    if (actionType === 'installed') {
      return findButtonText('installed') || t('common.installed');
    }
    return findButtonText('launch') || t('common.launch');
  }, [actionType, locale]);

  const disabled = actionType === 'installed';

  const update = useUpdate();

  const refreshBlocklet = useMemoizedFn(() => {
    return new Promise<void>((resolve, reject) => {
      const blockletScript = document.createElement('script');
      let basename = '/';
      if (window.blocklet && window.blocklet.prefix) {
        basename = window.blocklet.prefix;
      }
      blockletScript.src = withQuery(joinURL(basename, '__blocklet__.js'), {
        t: Date.now(),
      });
      blockletScript.onload = () => {
        resolve();
      };
      blockletScript.onerror = () => {
        reject();
      };
      document.head.append(blockletScript);
    });
  });

  const handleComplete = useMemoizedFn(async () => {
    await refreshBlocklet();
    update();
  });
  const handleClose = useMemoizedFn(() => {});

  const selectMeta = {
    ...blocklet,
    homepage: blocklet.homepage || endpoint,
  };

  return (
    <Box
      component="a"
      href={joinURL(endpoint, 'blocklets', blocklet.did)}
      target="_blank"
      sx={{
        color: 'initial',
        textDecoration: 'none',
        '.ms-highlight': {
          color: (theme) => theme.palette.primary.main,
        },
        '&>.arcblock-blocklet': {
          borderRadius: 2,
          '.arcblock-blocklet__info': {
            borderBottom: disabled ? 'none' : '',
          },
          '&:hover': {
            backgroundColor: (theme) => theme.palette.grey[50],
            '.arcblock-blocklet__info': {
              borderBottom: 'none',
            },
          },
        },
        '.arcblock-blocklet': {
          color: 'text.primary',
        },
      }}
      title={actionType === 'upgrade' ? `${getCurrentVersion(blocklet)} -> ${blocklet.version}` : ''}
      onClick={onClickLink}>
      <Blocklet
        title={displayAttributes({ blocklet, attribute: 'title', value: blocklet.title || blocklet.name })}
        did={blocklet.did}
        description={displayAttributes({ blocklet, attribute: 'description', value: blocklet.description })}
        cover={logoUrl || ''}
        version={blocklet.version}
        button={
          <ActionButton>
            <AddComponent
              componentDid={window.blocklet.appId}
              selectedMeta={selectMeta}
              storeUrl={endpoint}
              onClose={handleClose}
              onComplete={handleComplete}
              autoClose={false}
              render={({ onClick, loading }) => {
                return (
                  <Button
                    size="small"
                    color="primary"
                    variant="outlined"
                    style={{
                      cursor: disabled ? 'not-allowed' : 'pointer',
                    }}
                    loading={loading}
                    disabled={disabled}
                    onClick={onClick}>
                    {disabled ? (
                      <Icon icon={CheckCircleRoundedIcon} style={{ fontSize: '1rem', marginRight: '4px' }} />
                    ) : null}
                    {buttonText}
                    {actionType === 'upgrade' ? (
                      <Icon icon={UpgradeRoundedIcon} style={{ fontSize: '1.2rem' }} />
                    ) : null}
                  </Button>
                );
              }}
            />
          </ActionButton>
        }
      />
    </Box>
  );
}

function BlockletListPage() {
  const { t, locale } = useLocaleContext();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = Object.fromEntries(new URLSearchParams(location.search).entries());
  // @ts-ignore
  queryParams.showResources = 'true';

  const onFilterChange = (filters: QueryObject) => {
    navigate(withQuery('/search', filters));
  };

  return (
    <PageLayout>
      {endpoint ? (
        <BlockletList
          tagFilters={tagFilters}
          filters={queryParams}
          onFilterChange={onFilterChange}
          // eslint-disable-next-line react/no-unstable-nested-components
          blockletRender={(props: any) => <BlockletRender {...props} />}
          type="page"
          locale={locale}
          wrapChildren={(children: any) => children}
          endpoint={endpoint}
          showResourcesSwitch={false}
          baseSearch
          showCategory={false}
        />
      ) : (
        <Empty>{t('emptyEndpoint')}</Empty>
      )}
    </PageLayout>
  );
}

export default BlockletListPage;
