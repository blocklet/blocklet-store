/* eslint-disable no-alert */
import { useState } from 'react';
import Blocklet, { ActionButton } from '@arcblock/ux/lib/Blocklet';
import Button from '@arcblock/ux/lib/Button';
import Dialog from '@arcblock/ux/lib/Dialog';
import styled from '@emotion/styled';
import { parsePaymentPriceLabel, isFreeBlocklet } from '@blocklet/util';

import BlockletList from '../src';

const meta = {
  title: 'Blocklet List/FixHeight',
  component: BlockletList,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

const handleSearchSelect = ({ blocklet }) =>
  window.alert(`View blocklet ${blocklet.title || blocklet.name}@${blocklet.version} from search`);

function blockletRender({ blocklet }) {
  const price = parsePaymentPriceLabel(blocklet.pricing) || '0';
  const isFree = isFreeBlocklet(blocklet);
  const handleView = () => window.alert(`View blocklet ${blocklet.title || blocklet.name}@${blocklet.version}`);
  const handleLaunch = () => window.alert(`Launch blocklet ${blocklet.title || blocklet.name}@${blocklet.version}`);
  return (
    <Blocklet
      title={blocklet.title || blocklet.name}
      did={blocklet.did}
      description={blocklet.description}
      version={blocklet.version}
      type={blocklet.group}
      tags={blocklet.keywords || []}
      onMainClick={handleView}
      button={
        <ActionButton>
          <Button variant="outlined" onClick={handleLaunch}>
            {isFree ? '启动' : `${price}`}
          </Button>
        </ActionButton>
      }
    />
  );
}

function FixSelectComponent(args) {
  const [localParams, setLocalParams] = useState({});

  const handleChange = (filters) => {
    setLocalParams(filters);
  };
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Button variant="outlined" onClick={() => setOpen(true)}>
        Add Components
      </Button>
      <StyledDialog
        PaperProps={{ style: { height: 500 } }}
        fullWidth
        maxWidth="lg"
        title="Add Components"
        open={open}
        onClose={() => setOpen(false)}>
        <BlockletList
          {...args}
          filters={localParams}
          onFilterChange={handleChange}
          onSearchSelect={handleSearchSelect}
        />
      </StyledDialog>
    </div>
  );
}
const StyledDialog = styled(Dialog)``;

export const FixSelect = {
  render: (args) => <FixSelectComponent {...args} />,
  args: {
    blockletRender,
    locale: 'zh',
    endpoint: 'https://store.blocklet.dev/',
  },
};
