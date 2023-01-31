import { Target, TargetType } from './type';

export const objectToString = Object.prototype.toString;
export const toTypeString = (value: unknown): string =>
  objectToString.call(value);
export const toRawType = (value: unknown): string => {
  // extract "RawType" from strings like "[object RawType]"
  const res = toTypeString(value).slice(8, -1);
  // 如果是proxy则还是无法确定是否RawType
  if (res === 'Object') {
    if (value instanceof WeakMap) {
      return 'WeakMap';
    }
    if (value instanceof WeakSet) {
      return 'WeakSet';
    }
    if (value instanceof Map) {
      return 'Map';
    }
    if (value instanceof Set) {
      return 'Set';
    }
  }
  return res;
};

export const isObject = (val: unknown): val is Record<any, any> =>
  val !== null && typeof val === 'object';

function targetTypeMap(rawType: string) {
  switch (rawType) {
    case 'Object':
    case 'Array':
      return TargetType.COMMON;
    case 'Map':
    case 'Set':
    case 'WeakMap':
    case 'WeakSet':
      return TargetType.COLLECTION;
    default:
      return TargetType.INVALID;
  }
}

export function getTargetType(value: Target) {
  // isExtensible 对象是否可扩展 ， Object.seal() 或者 Object.freeze() 包裹后就会不可扩展
  return !Object.isExtensible(value)
    ? TargetType.INVALID
    : targetTypeMap(toRawType(value));
}

// Edit an assertion and save to see HMR in action
export const wait = (time = 0): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
};
