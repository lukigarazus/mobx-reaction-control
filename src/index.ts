import {
  makeAutoObservable,
  makeObservable,
  runInAction,
  AnnotationsMap,
  CreateObservableOptions,
} from "mobx";

export type IReactionControl<T> = {
  pauseKey: (...keys: (keyof T)[]) => void;
  resumeKey: (...keys: (keyof T)[]) => void;
  pauseAll: () => void;
  resumeAll: () => void;
} & T;

type NoInfer<T> = [T][T extends any ? 0 : never];

type IControlFunction = <
  T extends object,
  AdditionalKeys extends string | number | symbol = never
>(
  obj: T,
  overrides?: AnnotationsMap<T, NoInfer<AdditionalKeys>> | undefined,
  options?: CreateObservableOptions | undefined,
  reactOnUnfreeze?: boolean
) => IReactionControl<T>;

const control = <T extends object, K extends (keyof T)[]>(
  obj: T,
  keys: K,
  f: (obj: T) => T,
  reactOnUnfreeze: boolean = false
): IReactionControl<T> => {
  const entries = keys.map((k) => [k, obj[k]]) as [keyof T, T[keyof T]][];
  const reactive = new Set(keys);
  const reactiveCopy = f(Object.fromEntries(entries) as T);
  const nonReactiveCopy = {} as T;
  entries.forEach(([k]) => {
    delete obj[k];
    Object.defineProperty(obj, k, {
      get() {
        const value = reactiveCopy[k];
        if (nonReactiveCopy.hasOwnProperty(k)) return nonReactiveCopy[k];
        return value;
      },
      set(v) {
        if (!reactive.has(k)) {
          nonReactiveCopy[k] = v;
        } else {
          delete nonReactiveCopy[k];
          runInAction(() => {
            reactiveCopy[k] = v;
          });
        }
        return true;
      },
    });
  });
  // @ts-ignore
  obj.pauseKey = (...ks: (keyof T)[]) => {
    ks.forEach((k) => {
      reactive.delete(k);
    });
  };
  // @ts-ignore
  obj.resumeKey = (...ks: (keyof T)[]) => {
    ks.forEach((k) => {
      reactive.add(k);
      if (reactOnUnfreeze && nonReactiveCopy.hasOwnProperty(k)) {
        obj[k] = nonReactiveCopy[k];
      }
    });
  };
  // @ts-ignore
  obj.pauseAll = () => {
    reactive.clear();
  };
  // @ts-ignore
  obj.resumeAll = () => {
    keys.forEach((k) => {
      reactive.add(k);
      if (reactOnUnfreeze && nonReactiveCopy.hasOwnProperty(k)) {
        obj[k] = nonReactiveCopy[k];
      }
    });
  };
  return obj as IReactionControl<T>;
};

const makeAutoObservableWithControl: IControlFunction = (
  obj,
  overrides,
  options,
  reactOnUnfreeze
) => {
  return control(
    obj,
    Object.keys(obj) as (keyof typeof obj)[],
    (obj2) => makeAutoObservable(obj2, overrides, options),
    reactOnUnfreeze
  );
};

const makeObservableWithControl: IControlFunction = (
  obj,
  config = {} as AnnotationsMap<any, any>,
  options,
  reactOnUnfreeze
) => {
  return control(
    obj,
    Object.keys(config) as (keyof typeof obj)[],
    (obj2) => makeObservable(obj2, config, options),
    reactOnUnfreeze
  );
};

export { makeAutoObservableWithControl, makeObservableWithControl };
