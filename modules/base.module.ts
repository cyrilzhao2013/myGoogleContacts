import { cloneDeep, isNil } from "lodash-es";

export abstract class BaseModule<T, WritableKeys extends keyof T> {
  protected _data: T;

  constructor(data: T) {
    this._data = data;
  }

  getRawData() {
    return this._data;
  }

  get<K extends keyof T>(
    key: K,
    options?: {
      original?: boolean;
    }
  ): T[K] {
    const result = this._data[key];

    if (isNil(result)) {
      return result as any;
    }

    if (
      typeof result === "object" &&
      result instanceof CanvasRenderingContext2D === false &&
      !options?.original
    ) {
      return cloneDeep(result);
    }

    return result;
  }

  set<K extends WritableKeys>(key: K, value: T[K]): void {
    this._data[key] = value;
  }
}
