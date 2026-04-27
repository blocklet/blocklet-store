import PropTypes from 'prop-types';

function Ellipsis({ value = '', children = null, ...rest }) {
  const { style: paramsStyle, other } = rest;
  return (
    <span
      style={{ ...paramsStyle, overflow: 'hidden', maxWidth: '200px', whiteSpace: 'pre', textOverflow: 'ellipsis' }}
      title={value}
      {...other}>
      {children || value}
    </span>
  );
}

Ellipsis.propTypes = {
  value: PropTypes.string,
  children: PropTypes.node,
};
export default Ellipsis;
