import { css } from '@emotion/react';
import DOMPurify from 'dompurify';
import PropTypes from 'prop-types';

function CustomHtml({ html = '' }) {
  const style = (theme) => css`
    color: ${theme.palette.grey[700]};
    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      font-weight: 500;
      font-size: 1.2rem;
      line-height: 1.5;
      margin-bottom: 8px;
      margin-top: 8px;
      border-bottom: initial;
    }
    p {
      font-size: 1rem;
      line-height: 1.7;
      margin: 8px 0;
    }
    a {
      color: ${theme.palette.primary.main};
    }
    a:hover {
      text-decoration: none;
    }
    strong {
      font-weight: 700;
    }
    ol,
    ul {
      font-size: 1rem;
      line-height: 2rem;
      padding-left: 20px;
    }
    li {
      margin-bottom: 8px;
      line-height: 1.5;
    }
    hr {
      margin-top: 20px;
      margin-bottom: 20px;
      border: 0;
      border-top: 1px solid ${theme.palette.grey[300]};
    }
    pre {
      display: block;
      background-color: ${theme.palette.grey[100]};
      padding: 20px;
      font-size: 1rem;
      line-height: 2rem;
      border-radius: 0;
      overflow-x: auto;
      word-break: break-word;
    }
    code {
      background-color: ${theme.palette.grey[100]};
      border-radius: 0;
      padding: 3px 0;
      margin: 0;
      font-size: 1rem;
      overflow-x: auto;
      word-break: normal;
    }
    code:after,
    code:before {
      letter-spacing: 0;
    }
    blockquote {
      position: relative;
      margin: 16px 0;
      padding: 5px 8px 5px 30px;
      background: none repeat scroll 0 0 rgba(102, 128, 153, 0.05);
      border: none;
      color: ${theme.palette.grey[700]};
      border-left: 10px solid ${theme.palette.grey[300]};
    }
    img {
      max-width: 100%; // max-height: 668px;
    }
  `;

  // eslint-disable-next-line react/no-danger
  return <div css={style} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />;
}
CustomHtml.propTypes = {
  html: PropTypes.string,
};

export default CustomHtml;
