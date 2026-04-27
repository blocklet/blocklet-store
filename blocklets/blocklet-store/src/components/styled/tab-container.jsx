import styled from '@emotion/styled';
import PropTypes from 'prop-types';

function TabContainer({ children, ...rest }) {
  return <StyledDiv {...rest}>{children}</StyledDiv>;
}

TabContainer.propTypes = {
  children: PropTypes.any.isRequired,
};

const StyledDiv = styled.div`
  padding: 0 20px 20px 20px;
  border: 1px solid ${(props) => props.theme.palette.divider};
  .MuiToolbar-gutters {
    padding-left: 16px;
  }
  .MuiPaper-root {
    box-shadow: none;
    background-color: transparent;
  }
  /* store 中的表格都带有 border 但是 paginator 上的 border 需要移除 */
  .MuiTableCell-footer {
    border-bottom: none;
  }
  /* 始终展示 sort 按钮的宽度 */
  .MuiTableSortLabel-root {
    width: 20px;
    height: 20px;
  }
  /* 展示下载量之类的数字时靠右 */
  @media (min-width: ${(props) => props.theme.breakpoints.values.md}px) {
    .righted-tablehead {
      & > span {
        justify-content: right;
        button {
          margin-right: -8px;
        }
      }
    }
    .righted-tablecell {
      text-align: right;
    }
  }
`;

export default TabContainer;
