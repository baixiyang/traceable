import { Target, TargetType } from './type';
import { getTargetType, isObject } from './utils';
const ABSENT = Symbol();
const VUE_READONLY = '__v_isReadonly';

interface Mutation<T = Target> {
  target: T;
  p: string | symbol;
  newValue: unknown;
  oldValue: unknown;
}
type MutationGroup<T = Target> = { desc: string; mutations: Mutation<T>[] };
export class Traceable<T extends Target = Target> {
  data: T;
  start(autoEnd = false, desc = '') {
    this.startTransaction(autoEnd, desc);
  }
  end() {
    this.currentMutationGroup = undefined;
  }
  private correctTarget(mutationGroup: MutationGroup) {
    const targetSet = new Set();
    for (const mutation of mutationGroup.mutations) {
      targetSet.add(mutation.target);
    }
    for (const target of targetSet) {
      // correct length of array
      if (target instanceof Array) {
        while (target.length > 0 && !target.hasOwnProperty(target.length - 1)) {
          target.length = target.length - 1;
        }
      }
    }
  }
  forward() {
    if (this.pointer >= this.history.length - 1) {
      return;
    }
    const mutationGroup = this.history[this.pointer + 1];
    for (const mutation of mutationGroup.mutations) {
      if (mutation.newValue === ABSENT) {
        delete mutation.target[mutation.p];
      } else {
        mutation.target[mutation.p] = mutation.newValue;
      }
    }
    this.correctTarget(mutationGroup);
    this.currentMutationGroup = undefined;
    this.pointer++;
  }
  backward() {
    if (this.pointer <= -1) {
      return;
    }
    const mutationGroup = this.history[this.pointer];
    for (const mutation of [...mutationGroup.mutations].reverse()) {
      if (mutation.oldValue === ABSENT) {
        delete mutation.target[mutation.p];
      } else {
        mutation.target[mutation.p] = mutation.oldValue;
      }
    }
    this.correctTarget(mutationGroup);
    this.currentMutationGroup = undefined;
    this.pointer--;
  }
  get canForward() {
    return this.pointer < this.history.length - 1;
  }
  get canBackward() {
    return this.pointer > -1;
  }
  jump(pointer: number) {
    if (pointer > this.pointer) {
      while (pointer > this.pointer && this.pointer < this.history.length - 1) {
        this.forward();
      }
    }
    if (pointer < this.pointer) {
      while (pointer < this.pointer && this.pointer > -1) {
        this.backward();
      }
    }
  }
  private proxyMap = new WeakMap<T, T>();
  history: MutationGroup[] = [];
  private pointer = -1;
  private limit: number;
  private currentMutationGroup?: MutationGroup;
  private getCurrentMutationGroup() {
    if (!this.currentMutationGroup) {
      this.startTransaction();
    }
    return this.currentMutationGroup!;
  }
  private addMutation(mutation: Mutation) {
    this.getCurrentMutationGroup().mutations.push(mutation);
    if (this.currentMutationGroup!.mutations.length === 1) {
      this.history.splice(this.pointer + 1);
      this.history.push(this.currentMutationGroup!);
      this.pointer = this.history.indexOf(this.currentMutationGroup!);
    }
  }
  private startTransaction(autoEnd = true, desc = '') {
    this.currentMutationGroup = { desc, mutations: [] };
    cancelReactive(this.currentMutationGroup.mutations);
    if (autoEnd) {
      queueMicrotask(() => {
        this.currentMutationGroup = undefined;
      });
    }
  }
  private toTraceable(target: T): T {
    const existingProxy = this.proxyMap.get(target);
    if (existingProxy) {
      return existingProxy;
    }
    const proxy = new Proxy(target, {
      get: (target: T, p: string | symbol, receiver: T): unknown => {
        // Prevent vue reactive
        if (p === VUE_READONLY) {
          return true;
        }
        // todo fix vue3:RangeError: Maximum call stack size exceeded
        const res = Reflect.get(target, p, receiver);
        if (isObject(res)) {
          return this.toTraceable(res as T);
        }
        return res;
      },
      set: (
        target: T,
        p: string | symbol,
        newValue: unknown,
        receiver: T
      ): boolean => {
        this.addMutation({
          target,
          p,
          newValue,
          // 此处个人觉得应该用反射
          oldValue: target.hasOwnProperty(p) ? target[p] : ABSENT,
        });
        return Reflect.set(target, p, newValue, receiver);
      },
      deleteProperty: (target: T, p: string | symbol): boolean => {
        this.addMutation({
          target,
          p,
          // 此处个人觉得应该用反射
          oldValue: target[p],
          newValue: ABSENT,
        });
        return Reflect.deleteProperty(target, p);
      },
    });
    this.proxyMap.set(target, proxy);
    return proxy;
  }
  constructor(
    target: T,
    {
      limit = 10,
    }: {
      limit: number;
    } = {
      limit: 10,
    }
  ) {
    this.limit = limit;
    const targetType = getTargetType(target);
    if (targetType === TargetType.INVALID) {
      throw new Error('Traceable target: invalid!');
    }
    // todo supported collection object
    if (targetType === TargetType.COLLECTION) {
      throw new Error(
        'Traceable target: collection object is temporarily not supported'
      );
    }
    this.data = this.toTraceable(target);
  }
}

// Prevent vue reactive
function cancelReactive(v: Target | unknown[]) {
  (v as unknown as { [VUE_READONLY]: boolean })[VUE_READONLY] = true;
}
