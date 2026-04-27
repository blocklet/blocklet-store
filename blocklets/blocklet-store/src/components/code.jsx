import PropTypes from 'prop-types';
import { get } from 'lodash-es';

import CodeBlock from '@arcblock/ux/lib/CodeBlock';

export default function CodeBlockWrapper({ children }) {
  if (!Array.isArray(get(children, '[0].props.children'))) {
    return null;
  }

  const {
    className,
    children: [code],
  } = children[0].props;
  const language = (className || '').split('-').pop();

  if (!code) {
    return null;
  }

  return <CodeBlock language={language || 'shell'} code={code} />;
}

CodeBlockWrapper.propTypes = {
  children: PropTypes.node.isRequired,
};
