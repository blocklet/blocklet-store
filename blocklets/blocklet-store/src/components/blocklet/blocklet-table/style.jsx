import { css } from '@emotion/react';

const cssMap = {
  icon: (theme) => css`
    font-size: 18px;
    color: ${theme.palette.text.hint};
    cursor: pointer;
    &.right {
      margin-right: ${theme.spacing(0.5)};
    }
    &.left {
      margin-left: ${theme.spacing(0.5)};
    }
  `,
  title: (theme) => css`
    display: flex;
    align-items: center;
    font-size: 18px;
    white-space: nowrap;
    a {
      color: ${theme.palette.grey[700]};
      text-decoration: none !important;
    }
    a:hover,
    a:hover * {
      color: ${theme.palette.common.black};
      text-decoration: underline !important;
    }
  `,
  publishTips: () => css`
    a {
      color: inherit;
    }
  `,
};
export default cssMap;
