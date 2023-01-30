export interface Target {
  [key: string | symbol]: unknown;
}

export const enum TargetType {
  INVALID,
  COMMON,
  COLLECTION,
}
