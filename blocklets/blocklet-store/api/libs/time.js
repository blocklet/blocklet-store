const dayjs = require('dayjs');
const duration = require('dayjs/plugin/duration');

dayjs.extend(duration);

/**
 *
 * @param {} timeStr
 * @returns
 */
function parseTimeToMs(timeStr) {
  const match = timeStr.match(/^(\d+)([a-z]+)$/i);
  if (!match) return null;

  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();

  // 映射时间单位到 Day.js 支持的单位
  const unitMap = {
    ms: 'millisecond',
    s: 'second',
    m: 'minute',
    h: 'hour',
    d: 'day',
    w: 'week',
    y: 'year',
  };

  if (!unitMap[unit]) return null;

  // 创建 Duration 对象并转换为毫秒
  return dayjs.duration(value, unitMap[unit]).asMilliseconds();
}

module.exports = {
  parseTimeToMs,
};
