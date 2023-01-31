import { Traceable } from '../src';
import { assert, expect, test } from 'vitest';
import { wait } from '../src/utils';
import { reactive as reactive2 } from 'vue-2';
import { reactive as reactive3 } from 'vue-3';
const testFn = async (reactive: <T>(t: T) => T = (t) => t) => {
  const traceable = new Traceable<any>(
    reactive({ array: [1, 2, 3, 4, 5, 6, 7] })
  );
  traceable.data.array.splice(2, 4);
  traceable.data.array.push('push');
  traceable.data.array.push('push');
  traceable.data.array.unshift('unshift');
  traceable.data.array.unshift('unshift');
  traceable.data.array.pop();
  traceable.data.array.shift();
  traceable.data.array.reverse();

  expect(JSON.stringify(traceable.data.array)).eq(
    JSON.stringify(['push', 7, 2, 1, 'unshift'])
  );
  expect(traceable.data.array.length).eq(5);
  await wait();
  traceable.backward();
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
