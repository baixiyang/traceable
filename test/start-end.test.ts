import { Traceable } from '../src';
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
