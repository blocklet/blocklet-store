import { BN } from '@ocap/util';

export function removeTrailingZeros(numStr: string) {
  if (!numStr.includes('.')) {
    return numStr;
  }

  return numStr.replace(/(\.\d*?[1-9])0+$|\.0*$/, '$1');
}

/**
 * 计算给定价格的比例, 默认使用百分制，使用 18 位精度进行高精度计算。
 * @example
 */
export function calcPercent(input: string | number, percent: string, points = '100') {
  let price = typeof input === 'number' ? input.toString() : input;

  // 如果 price 小数点后面比18位多, 则只取18位
  price = price.replace(/(\.\d{18})\d+/, '$1');
  let bnWatchPrice = new BN(price.replace('.', '')); // 把 watchPrice 的小数转成整数
  let decimalPlaces = price.split('.')[1] ? price.split('.')[1].length : 0;
  if (decimalPlaces > 18) {
    decimalPlaces = 0;
  }
  const times = 18;
  // 把 watchPrice 转成整数, 放大18 - decimalPlaces 位
  const precision = new BN(10).pow(new BN(times - decimalPlaces));

  bnWatchPrice = bnWatchPrice.mul(precision);
  const percentBN = new BN(percent);
  const pointsBN = new BN(points);
  const finalResultBN = bnWatchPrice.mul(percentBN).div(pointsBN);

  // 获取 finalResultBN 的值
  let finalResultStr = finalResultBN.toString();
  // 根据 precision 的值, 缩小 finalResultStr
  // 在第 minDecimalPlaces 位, 插入小数点, 最终小于0的话, 要向前补齐 0
  const finalResultStrLen = finalResultStr.length;
  if (finalResultStrLen <= times) {
    return removeTrailingZeros(`0.${'0'.repeat(times - finalResultStrLen)}${finalResultStr}`);
  }
  finalResultStr = [
    finalResultStr.slice(0, finalResultStr.length - times),
    finalResultStr.slice(finalResultStr.length - times),
  ].join('.');

  // 去除尾部多余的 0
  return removeTrailingZeros(finalResultStr);
}

// 扩大18位
function inputToBN(input: string | number) {
  const precision = new BN(10).pow(new BN(18));
  if (typeof input === 'number') {
    // eslint-disable-next-line no-param-reassign
    input = input.toString();
  }

  if (input.includes('.')) {
    const parts = input.split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1];
    const decimalPrecision = new BN(10).pow(new BN(decimalPart.length));

    // 转换为整数
    const integerBN = new BN(integerPart + decimalPart);
    const adjustedInteger = integerBN.mul(precision).div(decimalPrecision);

    return adjustedInteger;
  }
  return new BN(input).mul(precision);
}

// 缩小 18 位
function bnToInput(bn: BN) {
  const s = bn.toString();
  const decimalPlaces = 18;

  if (s.length <= decimalPlaces) {
    return removeTrailingZeros(`0.${s.padStart(decimalPlaces, '0')}`);
  }
  const index = s.length - decimalPlaces;
  return removeTrailingZeros(`${s.substring(0, index)}.${s.substring(index)}`);
}

export function calcAdd(inputs: (string | number)[]) {
  let res = new BN(0);
  inputs.forEach((input) => {
    if (input !== '' && input !== undefined) {
      const bn = inputToBN(input);
      res = res.add(bn);
    }
  });
  return bnToInput(res);
}
