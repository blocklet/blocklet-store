/* eslint-disable no-alert */
import { useState } from 'react';
import { styled } from '@arcblock/ux/lib/Theme';
import Blocklet, { ActionButton } from '@arcblock/ux/lib/Blocklet';
import Button from '@arcblock/ux/lib/Button';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { parsePaymentPriceLabel } from '@blocklet/util';
import { expect, within, userEvent, waitFor } from '@storybook/test';

import BlockletList from '../src';

const meta = {
  title: 'Blocklet List/Page',
  component: BlockletList,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'fullscreen',
  },
  // decorators: [(Story) => <Story />],
};

export default meta;

const ThemedBlocklet = styled(Blocklet)`
  .ms-highlight {
    color: ${(props) => props.theme.palette.primary.main};
  }
`;
const isFreeBlocklet = (meta) => {
  return meta?.pricing?.paymentType === 'free';
};
/**
 * 属性中含有搜索关键词高亮是 meilisearch 提供的能力，我们需要做兼容，当meilisearch 不存在时，nedb 返回的数据就不含有高亮字段
 * @param {*} param0
 * @returns
 */
const displayAttributes = ({ blocklet, attribute, value }) => {
  if (blocklet._formatted) {
    return blocklet._formatted[attribute];
  }
  return value;
};

function blockletRender({ blocklet }) {
  const price = parsePaymentPriceLabel(blocklet.pricing);
  const isFree = isFreeBlocklet(blocklet);
  const handleView = () => window.alert(`View blocklet ${blocklet.title || blocklet.name}@${blocklet.version}`);
  const handleLaunch = () => window.alert(`Launch blocklet ${blocklet.title || blocklet.name}@${blocklet.version}`);
  return (
    <ThemedBlocklet
      title={displayAttributes({ blocklet, attribute: 'title', value: blocklet.title || blocklet.name })}
      did={blocklet.did}
      description={displayAttributes({ blocklet, attribute: 'description', value: blocklet.description })}
      version={blocklet.version}
      type={blocklet.group}
      tags={blocklet.keywords || []}
      onMainClick={handleView}
      data-testid="blocklet-item"
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

function BlockletStore(args) {
  const [localParams, setLocalParams] = useState({});
  const handleChange = (filters) => {
    setLocalParams(filters);
  };
  return <BlockletList {...args} filters={localParams} onFilterChange={handleChange} />;
}

function BlockletServer(args) {
  // eslint-disable-next-line no-unused-vars
  const [localParams, setLocalParams] = useState({});
  const [endpoint, setEndpoint] = useState('https://store.blocklet.dev/');
  const handleChange = (filters) => {
    setLocalParams(filters);
  };
  const handleStoreChange = (event) => {
    // 清空搜索条件
    setLocalParams({});
    setEndpoint(event.target.value);
  };
  const handleSearchSelect = ({ detailUrl }) => {
    const tmp = new URL(detailUrl);
    tmp.searchParams.set('server-url', 'https://your-node.example.com/admin');
    window.open(tmp.href);
  };

  return (
    <>
      <Box
        sx={{
          marginBottom: 2,
          maxWidth: 300,
        }}>
        <FormControl fullWidth>
          <InputLabel>切换商店</InputLabel>
          <Select value={endpoint} label="switch store" onChange={handleStoreChange} id="demo-simple-select">
            <MenuItem value="https://store.blocklet.dev/">Official Store</MenuItem>
            <MenuItem value="https://store.blocklet.dev/">Example Store</MenuItem>
            <MenuItem value="https://unavailable-store.example.com/">Unavailable Store</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <BlockletList
        {...args}
        filters={localParams}
        onFilterChange={handleChange}
        endpoint={endpoint}
        onSearchSelect={handleSearchSelect}
      />
    </>
  );
}

// More on interaction testing: https://storybook.js.org/docs/react/writing-tests/interaction-testing
export const Default = {
  render: (args) => <BlockletStore {...args} />,
  args: {
    blockletRender,
    locale: 'zh',
    endpoint: 'https://store.blocklet.dev/',
    baseSearch: false,
  },
  play: async ({ canvasElement }) => {
    // Starts querying the component from its root element
    const canvas = within(canvasElement);
    const autocompleteInput = canvas.getByPlaceholderText('搜索 Blocklet');
    await userEvent.clear(autocompleteInput);
    // 通过 搜索框搜索 blocklet
    await userEvent.type(autocompleteInput, 'meilisearch{enter}');
    await waitFor(
      () => {
        // // 👇 Assert DOM structure
        expect(within(canvasElement).getByTestId('blocklet-item')).toBeInTheDocument();
      },
      {
        interval: 1000,
        timeout: 8000,
      }
    );
  },
};

export const ServerPage = {
  render: (args) => <BlockletServer {...args} />,
  args: {
    blockletRender,
    locale: 'zh',
    endpoint: 'https://store.blocklet.dev/',
  },
};

export const ErrorPage1 = {
  render: (args) => <BlockletStore {...args} />,
  args: {
    blockletRender,
    locale: 'zh',
    endpoint: 'https://unavailable-store.example.com/',
  },
};

export const ErrorPage2 = {
  render: (args) => <BlockletStore {...args} />,
  args: {
    blockletRender,
    locale: 'zh',
    endpoint: 'https://store.blocklet.dev/invalid-path',
  },
};
