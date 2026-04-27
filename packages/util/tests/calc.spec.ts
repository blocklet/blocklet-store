import { describe, it, expect } from 'vitest';

import { calcAdd, calcPercent, removeTrailingZeros } from '../src/calc';

describe('calc', () => {
  it('calcPercent', () => {
    expect(calcPercent('100', '10')).toBe('10');
    expect(calcPercent('1', '50')).toBe('0.5');
    expect(calcPercent('100.200', '10')).toBe('10.02');
    expect(calcPercent('200.200', '10')).toBe('20.02');
    expect(calcPercent('1000000.200', '10')).toBe('100000.02');
    expect(calcPercent('50', '10')).toBe('5');
    expect(calcPercent('50123', '10')).toBe('5012.3');
    expect(calcPercent('50000000000', '10')).toBe('5000000000');
    expect(calcPercent('50000000000.1', '10')).toBe('5000000000.01');
    expect(calcPercent('50000000000.0000000000000001', '10')).toBe('5000000000.00000000000000001');
    expect(calcPercent('400000000000000000000.0000000000000001', '20')).toBe('80000000000000000000.00000000000000002');
    // 小数精度大于18位的时候, 丢失多余的
    expect(calcPercent('5.0000000000000000000000000000001', '10')).toBe('0.5');
    expect(calcPercent('5.0002000000000000000000000000001', '10')).toBe('0.50002');
    expect(calcPercent('0.0000000000000000000000000000001', '10')).toBe('0');
    expect(calcPercent('0.0000100000000000000000000000001', '10')).toBe('0.000001');
    expect(calcPercent('50', '3', '10')).toBe('15');
    expect(calcPercent('0.3', '3', '100')).toBe('0.009');
    expect(calcPercent('0.3', '3', '10')).toBe('0.09');
    expect(calcPercent('0.33333', '3', '10')).toBe('0.099999');
    expect(calcPercent('0.3330000033333333333333333333', '3', '10')).toBe('0.099900000999999999');
  });

  it('removeTrailingZeros', () => {
    expect(removeTrailingZeros('123.450000000000000000')).toBe('123.45');
    expect(removeTrailingZeros('123.000000000000000000')).toBe('123');
    expect(removeTrailingZeros('123.00123')).toBe('123.00123');
    expect(removeTrailingZeros('123')).toBe('123');
    expect(removeTrailingZeros('0.000000000000000000')).toBe('0');
    expect(removeTrailingZeros('0.')).toBe('0');
    expect(removeTrailingZeros('123.')).toBe('123');
    expect(removeTrailingZeros('0.200003000')).toBe('0.200003');
  });

  it('add', () => {
    expect(calcAdd([1, 2, 3])).toBe('6');
    expect(calcAdd(['1', '2', '3'])).toBe('6');
    expect(calcAdd(['', '2', '3'])).toBe('5');
    expect(calcAdd(['1.1', '0.2', undefined])).toBe('1.3');
    expect(calcAdd(['0.0000003', '0.2', undefined])).toBe('0.2000003');
    expect(calcAdd(['11111111110.0000003', '0.2', undefined])).toBe('11111111110.2000003');
  });
});
