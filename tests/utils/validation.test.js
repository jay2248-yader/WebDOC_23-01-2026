import { describe, it, expect, vi } from 'vitest';
import { sanitizeAlphanumeric, validateLength, createInputHandler, validateRequired } from '../../src/utils/validation';

describe('sanitizeAlphanumeric', () => {
  it('กรองอักขระพิเศษออก', () => {
    expect(sanitizeAlphanumeric('abc!@#123')).toBe('abc123');
  });

  it('กรองช่องว่างออก', () => {
    expect(sanitizeAlphanumeric('abc 123')).toBe('abc123');
  });

  it('ตัวอักษรและตัวเลขล้วนผ่านได้', () => {
    expect(sanitizeAlphanumeric('abc123')).toBe('abc123');
  });

  it('string ว่างคืนค่าว่าง', () => {
    expect(sanitizeAlphanumeric('')).toBe('');
  });
});

describe('validateLength', () => {
  it('คืน true เมื่อความยาวไม่เกิน maxLength', () => {
    expect(validateLength('hello', 10)).toBe(true);
  });

  it('คืน true เมื่อความยาวเท่ากับ maxLength พอดี', () => {
    expect(validateLength('hello', 5)).toBe(true);
  });

  it('คืน false เมื่อความยาวเกิน maxLength', () => {
    expect(validateLength('hello!', 5)).toBe(false);
  });

  it('string ว่างผ่านทุก maxLength', () => {
    expect(validateLength('', 0)).toBe(true);
  });
});

describe('createInputHandler', () => {
  it('เรียก setValue เมื่อค่าผ่าน filter', () => {
    const setValue = vi.fn();
    const handler = createInputHandler(setValue, { maxLength: 10, alphanumericOnly: false });
    handler('abc');
    expect(setValue).toHaveBeenCalledWith('abc');
  });

  it('ไม่เรียก setValue เมื่อค่าเกิน maxLength', () => {
    const setValue = vi.fn();
    const handler = createInputHandler(setValue, { maxLength: 3 });
    handler('abcd');
    expect(setValue).not.toHaveBeenCalled();
  });

  it('กรองอักขระพิเศษเมื่อ alphanumericOnly=true', () => {
    const setValue = vi.fn();
    const handler = createInputHandler(setValue, { maxLength: 20, alphanumericOnly: true });
    handler('abc!@#');
    expect(setValue).toHaveBeenCalledWith('abc');
  });

  it('ไม่กรองอักขระพิเศษเมื่อ alphanumericOnly=false', () => {
    const setValue = vi.fn();
    const handler = createInputHandler(setValue, { maxLength: 20, alphanumericOnly: false });
    handler('P@ss!123');
    expect(setValue).toHaveBeenCalledWith('P@ss!123');
  });
});

describe('validateRequired', () => {
  it('คืน error message เมื่อ value ว่าง', () => {
    expect(validateRequired('', 'ກະລຸນາປ້ອນຂໍ້ມູນ')).toBe('ກະລຸນາປ້ອນຂໍ້ມູນ');
  });

  it('คืน error message เมื่อ value เป็น whitespace', () => {
    expect(validateRequired('   ', 'ກະລຸນາປ້ອນຂໍ້ມູນ')).toBe('ກະລຸນາປ້ອນຂໍ້ມູນ');
  });

  it('คืน string ว่างเมื่อมีค่า', () => {
    expect(validateRequired('abc', 'ກະລຸນາປ້ອນຂໍ້ມູນ')).toBe('');
  });
});
