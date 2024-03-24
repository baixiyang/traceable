wittyna-traceable
## 简介
###### wittyna-traceable可以为复杂结构的js对象的操作提供修改日志，回退、前进等功能。

## 支持的数据
* 普通对象数据
* vue2 格式对象数据
* vue3 格式对象数据

## 安装
```bash
npm install wittyna-traceable
```
## 特性
* 默认在修改开始后的 microtask 结束后会记录一次操作
* 通过start， end 可以自定义一次操作的开始和结束
* 通过 forward， backward 可以进行回退、前进操作
* 通过 history 可以拿到操作历史记录
* 可以设置最大历史记录数

## 使用
以下是几个测试用例的例子
* start，end
```ts
import { Traceable } from 'wittyna-traceable';
import { assert, expect, test } from 'vitest';
import { wait } from '../src/utils';
import { reactive as reactive2 } from 'vue-2';
import { reactive as reactive3 } from 'vue-3';

const testFn = async (reactive: <T>(t: T) => T = (t) => t) => {
  const traceable = new Traceable<any>(reactive({ a: 1, b: 2, c: 3 }));
  traceable.start();
  traceable.data.a = 111;
  await wait(500);
  traceable.data.b = 222;
  await wait(500);
  traceable.data.c = 333;
  traceable.backward();
  expect(JSON.stringify(traceable.data)).eq(
    JSON.stringify({ a: 1, b: 2, c: 3 })
  );
};
test('basic:start-end', () => testFn());
test('vue2:start-end', () => testFn(reactive2 as unknown as <T>(t: T) => T));
test('vue3:start-end', () => testFn(reactive3 as unknown as <T>(t: T) => T));

```
* 数组情况
```ts
import { Traceable } from 'wittyna-traceable';
import { assert, expect, test } from 'vitest';
import { wait } from '../src/utils';
import { reactive as reactive2 } from 'vue-2';
import { reactive as reactive3 } from 'vue-3';
const testFn = async (reactive: <T>(t: T) => T = (t) => t) => {
  const traceable = new Traceable<any>(
    reactive({ array: [1, 2, 3, 4, 5, 6, 7] })
  );
  console.log("原始数据", JSON.stringify(traceable.data))
  traceable.data.array.splice(2, 4);
  traceable.data.array.push('push');
  traceable.data.array.push('push');
  traceable.data.array.unshift('unshift');
  traceable.data.array.unshift('unshift');
  traceable.data.array.pop();
  traceable.data.array.shift();
  traceable.data.array.reverse();
  console.log("操作后的数据", JSON.stringify(traceable.data))
  expect(JSON.stringify(traceable.data.array)).eq(
    JSON.stringify(['push', 7, 2, 1, 'unshift'])
  );
  expect(traceable.data.array.length).eq(5);
  await wait();
  traceable.backward();
  console.log("回退后数据", JSON.stringify(traceable.data))
  expect(JSON.stringify(traceable.data.array)).eq(
    JSON.stringify([1, 2, 3, 4, 5, 6, 7])
  );
  expect(traceable.data.array.length).eq(7);
  await wait();
  traceable.forward();
  expect(JSON.stringify(traceable.data.array)).eq(
    JSON.stringify(['push', 7, 2, 1, 'unshift'])
  );
  expect(traceable.data.array.length).eq(5);
  traceable.backward();
  await wait();

  traceable.data.array.push('push1', 'push2');
  expect(JSON.stringify(traceable.data.array)).eq(
    JSON.stringify([1, 2, 3, 4, 5, 6, 7, 'push1', 'push2'])
  );
  expect(traceable.data.array.length).eq(9);
  await wait();
  traceable.backward();
  expect(JSON.stringify(traceable.data.array)).eq(
    JSON.stringify([1, 2, 3, 4, 5, 6, 7])
  );
  expect(traceable.data.array.length).eq(7);
  await wait();
  traceable.forward();
  expect(JSON.stringify(traceable.data.array)).eq(
    JSON.stringify([1, 2, 3, 4, 5, 6, 7, 'push1', 'push2'])
  );
  expect(traceable.data.array.length).eq(9);
};
test('basic:type:array', () => testFn());
test('vue2:type:array', () => testFn(reactive2 as unknown as <T>(t: T) => T));
test('vue3:type:array', () => testFn(reactive3 as unknown as <T>(t: T) => T));

```
* 对象情况
```ts
import { Traceable } from 'wittyna-traceable';
import { assert, expect, test } from 'vitest';
import { wait } from '../src/utils';
import { reactive as reactive2 } from 'vue-2';
import { reactive as reactive3 } from 'vue-3';
const testFn = async (reactive: <T>(t: T) => T = (t) => t) => {
  const traceable = new Traceable<any>(
    reactive({ object: { a: 1, b: 2, c: 3 } })
  );
  traceable.data.object.a = 'a';
  traceable.data.object.b = 'b';
  delete traceable.data.object.c;
  Object.assign(traceable.data.object);

  expect(JSON.stringify(traceable.data.object)).eq(
    JSON.stringify({ a: 'a', b: 'b' })
  );
  expect('c' in traceable.data.object).eq(false);
  await wait();
  traceable.backward();
  expect(JSON.stringify(traceable.data.object)).eq(
    JSON.stringify({ a: 1, b: 2, c: 3 })
  );
  expect('c' in traceable.data.object).eq(true);
  await wait();
  traceable.forward();
  expect(JSON.stringify(traceable.data.object)).eq(
    JSON.stringify({ a: 'a', b: 'b' })
  );
  expect('c' in traceable.data.object).eq(false);
};
test('basic:type:object', () => testFn());
test('vue2:type:object', () => testFn(reactive2 as unknown as <T>(t: T) => T));
test('vue3:type:object', () => testFn(reactive3 as unknown as <T>(t: T) => T));
```






