import { EFilterKeys, EConditionType, ESortKeys } from '../constants';

export interface IUrlState {
  page?: number;
  q?: string;
  filters?: Record<string, string[]>;
  sort?: {
    name: string;
    direction: string;
  };
}

// URL 中的简化格式
interface IUrlFilter extends Partial<Record<string, string | string[] | EConditionType>> {
  [EFilterKeys.CONDITION_TYPE]?: EConditionType;
  [EFilterKeys.REVIEW_STATUS]?: string[];
}

const defaultSort = { name: ESortKeys.UPDATED_AT, direction: 'desc' };

/**
 * Expands a simplified URL filter into a standardized array-based format.
 *
 * @remarks
 * Converts filter parameters from a potentially mixed input format to a consistent
 * array representation, ensuring each filter key has an array of values.
 *
 * @param filter - The input filter object with potentially mixed value types
 * @returns A normalized filter object where each key maps to an array of values
 *
 * @example
 * ```typescript
 * const input = { status: 'active', tags: ['web', 'mobile'] };
 * const expanded = expandFilter(input);
 * // Result: { status: ['active'], tags: ['web', 'mobile'] }
 * ```
 */
function expandFilter(filter: IUrlFilter): Record<string, string[]> {
  const result: Record<string, string[]> = {};

  Object.entries(filter).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      result[key] = value;
    } else if (value != null) {
      result[key] = [value];
    }
  });

  return result;
}

/**
 * Parses URL search parameters into a structured URL state object.
 *
 * @remarks
 * This function converts URLSearchParams into a comprehensive IUrlState object,
 * handling nested keys, multiple values, and providing default values.
 *
 * @param searchParams - The URLSearchParams object to parse
 * @returns A fully populated IUrlState object with parsed and default values
 *
 * @example
 * ```typescript
 * const params = new URLSearchParams('page=2&filters.status=active&sort.key=name');
 * const state = parseUrlState(params);
 * // Returns: { page: 2, q: '', filters: {...}, sort: {...} }
 * ```
 */
export function parseUrlState(searchParams: URLSearchParams): IUrlState {
  const state: IUrlState = {};

  // 遍历查询参数的键值对
  for (const [key, value] of searchParams.entries()) {
    // 将键按点分割成数组
    const keys = key.split('.');
    let current = state;

    // 遍历分割后的键数组
    for (let i = 0; i < keys.length; i++) {
      const currentKey = keys[i];
      if (i === keys.length - 1) {
        // 最后一个键，直接赋值
        if (current[currentKey]) {
          current[currentKey] = Array.isArray(current[currentKey])
            ? [...current[currentKey], value]
            : [current[currentKey], value];
        } else {
          current[currentKey] = value;
        }
      } else {
        // 不是最后一个键，若对应对象不存在则创建
        if (!current[currentKey]) {
          current[currentKey] = {};
        }
        // 进入下一级对象
        current = current[currentKey];
      }
    }
  }

  if (state.filters) {
    state.filters = expandFilter(state.filters);
  }

  return {
    page: 1,
    q: '',
    ...state,
    filters: {
      [EFilterKeys.CONDITION_TYPE]: [EConditionType.OR],
      ...state.filters,
    },
    sort: {
      ...defaultSort,
      ...state.sort,
    },
  };
}

/**
 * Updates URL search parameters with a given key and value, handling various data types and nested structures.
 *
 * @remarks
 * This function manages the complex process of updating URL parameters, supporting:
 * - Primitive values
 * - Nested objects
 * - Arrays
 * - Deletion of parameters
 *
 * @param key - The parameter key to update
 * @param value - The value to set for the parameter
 * @param newParams - The URLSearchParams object to modify
 * @param append - Whether to append the value instead of setting it (default: false)
 * @param depth - Current recursion depth to prevent excessive nesting (default: 0)
 *
 * @returns void
 *
 * @throws Will log a warning if maximum nesting depth is exceeded
 */
function updateUrl(key: string, value: any, newParams: URLSearchParams, append = false, depth = 0) {
  const MAX_DEPTH = 3;
  if (depth > MAX_DEPTH) {
    console.warn(`Maximum nesting depth exceeded for key: ${key}`);
    return;
  }
  if (value === null || value === undefined) {
    newParams.delete(key);
    return;
  }
  if (typeof value !== 'object') {
    if (append) {
      newParams.append(key, value);
    } else {
      newParams.set(key, value);
    }
    return;
  }
  if (Array.isArray(value)) {
    newParams.delete(key);
    // 对数组中的每个值使用相同的 key
    value.forEach((item, index) => {
      updateUrl(key, item, newParams, index !== 0);
    });
    return;
  }
  if (typeof value === 'object') {
    Object.entries(value as Record<string, string[]>).forEach(([subKey, subValues]) => {
      updateUrl(`${key}.${subKey}`, subValues, newParams, append);
    });
  }
}

/**
 * Generates an updated URLSearchParams object by merging current URL state with new updates and removing specified keys.
 *
 * @param currentParams - The current URL search parameters
 * @param updates - Partial updates to be applied to the URL state
 * @param delKeys - Array of keys to be deleted from the current URL state
 * @returns A new URLSearchParams object with updated parameters
 *
 * @throws {Error} If delKeys is not an array of strings
 *
 * @remarks
 * This function allows for selective updating and deletion of URL parameters while preserving the existing state.
 * It first validates the deletion keys, then parses the current URL state, removes specified keys,
 * and applies any provided updates before generating a new URLSearchParams object.
 */
export function getUpdatedSearchParams(
  currentParams: URLSearchParams,
  updates: Partial<IUrlState>,
  delKeys: string[]
): URLSearchParams {
  // Validate delKey array
  if (!Array.isArray(delKeys) || !delKeys.every((k) => typeof k === 'string')) {
    throw new Error('delKeys must be an array of strings');
  }

  const newParams = new URLSearchParams('');

  const currentState = parseUrlState(new URLSearchParams(currentParams));
  delKeys.forEach((key) => {
    delete currentState[key];
  });

  Object.entries({ ...currentState, ...updates }).forEach(([key, value]) => {
    updateUrl(key, value, newParams);
  });

  return newParams;
}
