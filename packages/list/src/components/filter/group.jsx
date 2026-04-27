import PropTypes from 'prop-types';
// import styled from '@emotion/styled';
import { styled } from '@arcblock/ux/lib/Theme';

function FilterGroup({ options, onChange, title, value = null }) {
  return (
    <StyledDiv>
      <div className="title">{title}</div>
      <div className="list">
        {options.map((item) => {
          return (
            <div
              title={item.name}
              key={item.value}
              data-cy="filter"
              className={value === item.value ? 'select item' : 'item'}
              onClick={() => onChange(item.value)}>
              {item.name}
            </div>
          );
        })}
      </div>
    </StyledDiv>
  );
}

const StyledDiv = styled('div')`
  .title {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: ${(props) => props.theme.spacing(1)};
  }
  .list {
  }
  .item {
    font-size: 16px;
    padding: ${(props) => props.theme.spacing(1)};
    color: #9397a1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-transform: capitalize;
    cursor: pointer;
    &:hover {
      background-color: ${(props) => props.theme.palette.grey[50]};
      color: initial;
      font-weight: bold;
    }
  }
  .select {
    color: ${(props) => props.theme.palette.primary.main};
    font-weight: bold;
  }
`;

FilterGroup.propTypes = {
  title: PropTypes.string.isRequired,
  options: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
export default FilterGroup;
