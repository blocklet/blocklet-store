import PropTypes from 'prop-types';
import noFound from './no-found';
import serverError from './server-error';
import unauthorized from './unauthorized';

const ExceptionMap = {
  404: noFound,
  500: serverError,
  403: unauthorized,
};

const ExceptionStatus = Object.keys(ExceptionMap);

const renderIcon = ({ status }) => {
  if (ExceptionStatus.includes(`${status}`)) {
    const SVGComponent = ExceptionMap[status];
    return (
      <div style={{ marginBottom: '24px', textAlign: 'center', width: '250px', height: '295px', margin: 'auto' }}>
        <SVGComponent />
      </div>
    );
  }
  return null;
};

const renderExtra = ({ extra }) => extra && <div style={{ margin: '24px 0 0', textAlign: 'center' }}>{extra}</div>;
/**
 * 服务端下发 http status code的响应结果 404 500 403
 * @param {*} param0
 * @returns
 */
function Result({ style = {}, children = null, subTitle = null, status, extra = null }) {
  return (
    <div style={style}>
      {renderIcon({ status })}
      <div style={{ color: '#000000d9', fontSize: '24px', lineHeight: '1.8', textAlign: 'center' }}>{status}</div>
      {subTitle && (
        <div style={{ color: '#00000073', fontSize: '14px', lineHeight: '1.6', textAlign: 'center' }}>{subTitle}</div>
      )}
      {renderExtra({ extra })}
      {children && <div style={{ margin: '24px 0 0', textAlign: 'center' }}>{children}</div>}
    </div>
  );
}
Result.propTypes = {
  style: PropTypes.object,
  children: PropTypes.node,
  subTitle: PropTypes.string,
  status: PropTypes.string.isRequired,
  extra: PropTypes.node,
};

export default Result;
