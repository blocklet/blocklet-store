import Blocklet from '@arcblock/ux/lib/BlockletV2';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { joinURL } from 'ufo';
import { Icon } from '@iconify/react';
import BrandDocker from '@iconify-icons/tabler/brand-docker';
import OfficialTooltip from '../../components/official-tootip';
import { displayAttributes } from '../../libs/util';
import { getBlockletLogoAndPrefix } from '../../libs/utils';
import LaunchButton from '../../components/buttons/launch-button';
import I18n from '../../components/i18n';

// eslint-disable-next-line import/prefer-default-export
export function blockletRender({ blocklet: meta, autocompleteSetters }: { blocklet: any; autocompleteSetters: any }) {
  const { logoUrl, prefix } = getBlockletLogoAndPrefix(meta);

  const onClickLink = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!e.currentTarget.contains(e.target as Node)) {
      e.preventDefault();
      return false;
    }
    return true;
  };

  return (
    <Link
      key={meta.did}
      to={joinURL(prefix, 'blocklets', meta.did)}
      data-cy="blocklet-item"
      style={{ color: 'initial', textDecoration: 'none' }}
      onClick={onClickLink}>
      <Blocklet
        data-cy="bl-autocomplete-item"
        did={meta.did}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: 0,
          transition: 'transform 0.2s ease-in-out',
          '&:hover': {
            transform: { xs: 'none', sm: 'translateY(-2px)' },
            boxShadow: 2,
          },
          '.ms-highlight': { color: 'secondary.main' },
        }}
        title={displayAttributes({
          blocklet: meta,
          attribute: 'title',
          value: `${meta.title || meta.name || ''}`,
        })}
        description={displayAttributes({ blocklet: meta, attribute: 'description', value: meta.description || '' })}
        icons={
          meta.docker?.image
            ? [
                {
                  key: 'docker',
                  icon: <Icon icon={BrandDocker} width={16} height={16} style={{ color: '#1C60EC' }} />,
                  title: <I18n translateKey="blocklet.dockerImage" />,
                },
              ]
            : []
        }
        official={meta.isOfficial ? { tooltip: <OfficialTooltip /> } : undefined}
        cover={logoUrl}
        avatar={meta.owner.avatar}
        author={meta.owner.fullName}
        download={meta.stats.downloads}
        // TODO: 需要更新 Blocklet 的类型，之前有默认值，导致这里有问题
        onButtonClick={null as any}
        button={<LaunchButton blocklet={meta} autocompleteSetters={autocompleteSetters} />}
      />
    </Link>
  );
}
