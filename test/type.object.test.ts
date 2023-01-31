import { Traceable } from '../src';
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
