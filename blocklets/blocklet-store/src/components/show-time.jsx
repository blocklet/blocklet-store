import PropTypes from 'prop-types';
import { formatToDatetime, formatToRelativeTime } from '../libs/util';

function ShowTime({ date = '' }) {
  if (date) {
    return <span title={formatToDatetime(date)}>{formatToRelativeTime(date)}</span>;
  }
  return '';
}

ShowTime.propTypes = {
  date: PropTypes.string,
};

export default ShowTime;
