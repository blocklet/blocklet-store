import { useState } from 'react';
import Blocklet from '@arcblock/ux/lib/Blocklet';
import Button from '@arcblock/ux/lib/Button';
import Dialog from '@arcblock/ux/lib/Dialog';
import Box from '@mui/material/Box';
import styled from '@emotion/styled';
// import { MemoryRouter } from 'react-router-dom';

import BlockletList from '../src';

const meta = {
  title: 'Blocklet List/Select',
  component: BlockletList,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'fullscreen',
  },
};

export default meta;

function extraFilter(list = []) {
  return list.filter((item) => item);
}

function Template(args) {
  // eslint-disable-next-line no-unused-vars
  const [localParams, setLocalParams] = useState({});
  const [selectedBlocklets, setSelectedBlocklets] = useState([]);
  const [open, setOpen] = useState(false);
  const handleChange = (filters) => {
    setLocalParams(filters);
  };
  const onSelectBlocklet = (blocklet) => {
    setSelectedBlocklets(selectedBlocklets.concat([blocklet]));
    setOpen(false);
  };
  const handleSearchSelect = ({ blocklet }) => onSelectBlocklet(blocklet);

  const blockletRender = ({ blocklet }) => {
    const isAdded = selectedBlocklets.some((selected) => selected.did === blocklet.did);
    return (
      <Blocklet
        title={blocklet.title || blocklet.name}
        did={blocklet.did}
        description={blocklet.description}
        version={blocklet.version}
        type={blocklet.group}
        tags={blocklet.keywords || []}
        button={
          <CustomButton disabled={isAdded} onClick={() => onSelectBlocklet(blocklet)} variant="outlined">
            {isAdded ? 'Added' : 'Add'}
          </CustomButton>
        }
      />
    );
  };

  return (
    <Box>
      <Button variant="outlined" onClick={() => setOpen(true)}>
        Add Components
      </Button>
      <h3>Selected Components</h3>
      <pre>
        <code>
          {JSON.stringify(
            selectedBlocklets.map((x) => ({ name: x.name, version: x.version })),
            null,
            2
          )}
        </code>
      </pre>
      <Dialog fullWidth maxWidth="lg" title="Add Components" open={open} onClose={() => setOpen(false)}>
        <BlockletList
          {...args}
          blockletRender={blockletRender}
          filters={localParams}
          onFilterChange={handleChange}
          onSearchSelect={handleSearchSelect}
          extraFilter={extraFilter}
        />
      </Dialog>
    </Box>
  );
}

// More on interaction testing: https://storybook.js.org/docs/react/writing-tests/interaction-testing
export const Default = {
  render: (args) => <Template {...args} />,
  args: {
    locale: 'zh',
    endpoint: 'https://store.blocklet.dev/',
  },
};

const CustomButton = styled(Button)`
  &.MuiButton-root {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 86px;
    display: inline-block;
  }
`;
