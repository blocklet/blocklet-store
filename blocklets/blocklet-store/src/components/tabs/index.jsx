import PropTypes from 'prop-types';
import { css } from '@emotion/react';
import clsx from 'clsx';

const cssMeta = {
  root: (theme) => css`
    width: 100%;
    padding: 16px 0;
    overflow-x: auto;
    @media (min-width: ${theme.breakpoints.values.sm}px) {
      display: flex;
      justify-content: center;
    }
    @media (max-width: ${theme.breakpoints.values.sm}px) {
      display: block;
      white-space: nowrap;
    }
    .tab {
      margin: 0 10px;
      padding: 6px 18px;
      font-weight: ${theme.typography.fontWeightBold};
      cursor: pointer;
    }
    @media (min-width: ${theme.breakpoints.values.sm}px) {
      .tab {
        flex-shrink: 0;
      }
    }
    @media (max-width: ${theme.breakpoints.values.sm}px) {
      .tab {
        margin: 0;
        display: inline-block;
      }
    }
    .tabActive {
      border-radius: 100px;
      background: none;
      color: ${theme.palette.primary.main};
    }
    .tab:hover {
      color: ${theme.palette.primary.main};
    }
  `,
};
function StoreTabs({ tabs, current, onChange, ...rest }) {
  return (
    <div {...rest} css={cssMeta.root}>
      {tabs.map((x) => (
        <div
          key={x.value}
          className={clsx({ tab: true, tabActive: current === x.value })}
          onClick={() => {
            onChange(x.value);
          }}>
          {x.label}
        </div>
      ))}
    </div>
  );
}

function StoreTabPanel(props) {
  const { children, value, index, ...other } = props;

  return value === index && <div {...other}>{children}</div>;
}

StoreTabPanel.propTypes = {
  children: PropTypes.node.isRequired,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

StoreTabs.propTypes = {
  tabs: PropTypes.array.isRequired,
  current: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export { StoreTabs, StoreTabPanel };
