import { css } from '@emotion/react';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';

function MarkdownBody({ children, ...rest }) {
  const codeFont = 'source-code-pro, Menlo, Monaco, Consolas, Courier New, monospace !important';
  const markdownBodyCss = css`
    .highlight pre,
    pre {
      border-radius: 5px;
    }
    code {
      font-family: ${codeFont};
    }
    pre code {
      font-size: 14px;
      font-family: ${codeFont};
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      font-weight: 700 !important;
      font-size: 1.2rem !important;
      line-height: 1.5 !important;
      margin-bottom: 16px;
      margin-top: 24px;
      border-bottom: initial !important;
    }

    .CodeMirror pre {
      background: #f6f8fa !important;
    }

    .anchor {
      display: none;
    }
  `;
  return (
    <Box {...rest} css={markdownBodyCss}>
      {children}
    </Box>
  );
}

MarkdownBody.propTypes = {
  children: PropTypes.any.isRequired,
};

export default MarkdownBody;
