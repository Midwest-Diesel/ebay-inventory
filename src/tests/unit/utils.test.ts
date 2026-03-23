import { describe, expect, test } from 'vitest';
import { filterNullObjValuesArr, generateClasses, isObjectNull, parseClasses } from "@/scripts/tools/utils";


describe('Generate classes', () => {
  test('should return a string with the class name and the variants', () => {
    const className = '';
    const variantList = ['primary', 'secondary'];
    const result = generateClasses(className, variantList, 'button');
    expect(result).toBe('button button--primary button--secondary');
  });
});

describe('Parse classes', () => {
  test('should return an object with the classes', () => {
    const classes = 'button button--primary button--secondary';
    const result = parseClasses(classes);
    expect(result).toEqual({ className: 'button button--primary button--secondary' });
  });

  test('should return an empty object', () => {
    const classes = '';
    const result = parseClasses(classes);
    expect(result).toEqual({});
  });
});

describe('IsObjectNull', () => {
  test('should return true', () => {
    const obj = { a: '', b: null };
    const result = isObjectNull(obj);
    expect(result).toBe(true);
  });

  describe('should return false', () => {
    test('1)', () => {
      const obj = { a: 'test', b: null };
      const result = isObjectNull(obj);
      expect(result).toBe(false);
    });

    test('2)', () => {
      const obj = { a: 0 };
      const result = isObjectNull(obj);
      expect(result).toBe(false);
    });
  });
});

describe('filterNullObjValuesArr', () => {
  test('should return empty array', () => {
    const arr = [{ a: '', b: null }, { a: '', b: null }];
    const result = filterNullObjValuesArr(arr);
    expect(result).toEqual([]);
  });

  test('should return one element', () => {
    const arr = [{ a: 'test', b: null }, { a: '', b: null }];
    const result = filterNullObjValuesArr(arr);
    expect(result).toEqual([{ a: 'test', b: null }]);
  });
});
