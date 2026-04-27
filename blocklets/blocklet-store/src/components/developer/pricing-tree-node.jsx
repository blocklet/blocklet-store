import styled from '@emotion/styled';
import PropTypes from 'prop-types';

function TreeNode({ node, isFirst = false, isLast = false }) {
  let className;
  if (isLast) {
    className = 'tree-node-last';
  } else if (isFirst) {
    className = '';
  } else {
    className = 'tree-node';
  }
  return (
    <div className={className}>
      <div className={isFirst ? '' : 'tree-node-content'}>{node.label}</div>
      {node.children && (
        <div className={isFirst ? '' : 'tree-node-children'}>
          {node.children.map((child, index) => (
            <TreeNode key={child.id || index} node={child} isLast={index === node.children.length - 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function PricingTreeNode({ data, ...rest }) {
  return (
    <TreeStyled {...rest}>
      {data.map((node, index) => (
        <TreeNode key={node.id || index} node={node} isFirst />
      ))}
    </TreeStyled>
  );
}

export default PricingTreeNode;

const TreeStyled = styled('div')`
  .tree-node,
  .tree-node-last {
    position: relative;
    padding-left: 20px;
  }

  .tree-node::before {
    content: '';
    position: absolute;
    top: 0;
    left: 10px;
    bottom: 0;
    width: 1px;
    background: #ccc;
  }
  .tree-node-last::before {
    content: '';
    position: absolute;
    top: 0;
    left: 10px;
    bottom: 0;
    width: 1px;
    height: 50%;
    background: #ccc;
  }

  .tree-node-content {
    position: relative;
    padding: 5px 10px;
    background: #fff;
  }

  .tree-node-content::before {
    content: '';
    position: absolute;
    top: 50%;
    left: -10px;
    width: 20px;
    height: 1px;
    background: #ccc;
  }

  .tree-node-children {
    margin-left: 20px;
    padding-left: 10px;
  }
`;

TreeNode.propTypes = {
  node: PropTypes.shape({
    label: PropTypes.string.isRequired,
    children: PropTypes.array,
  }).isRequired,
  isFirst: PropTypes.bool,
  isLast: PropTypes.bool,
};

PricingTreeNode.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      children: PropTypes.array,
    })
  ).isRequired,
};
