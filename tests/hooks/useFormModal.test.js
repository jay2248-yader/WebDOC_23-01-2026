import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useFormModal from '../../src/hooks/useFormModal';

const defaultOpts = (overrides = {}) => ({
  isOpen: true,
  initialData: { name: '', note: '' },
  onSubmit: vi.fn().mockResolvedValue(),
  onClose: vi.fn(),
  validate: undefined,
  ...overrides,
});

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

// ─── initial state ────────────────────────────────────────────────────────────

describe('useFormModal — initial state', () => {
  it('formData เริ่มต้นตาม initialData', () => {
    const { result } = renderHook(() => useFormModal(defaultOpts()));
    expect(result.current.formData).toEqual({ name: '', note: '' });
  });

  it('รองรับ initialData เป็น function', () => {
    const { result } = renderHook(() =>
      useFormModal(defaultOpts({ initialData: () => ({ name: 'ທົດສອບ' }) }))
    );
    expect(result.current.formData.name).toBe('ທົດສອບ');
  });

  it('errors เริ่มต้นเป็น object ว่าง', () => {
    const { result } = renderHook(() => useFormModal(defaultOpts()));
    expect(result.current.errors).toEqual({});
  });

  it('submitDialog เริ่มต้น open=false, status=confirm', () => {
    const { result } = renderHook(() => useFormModal(defaultOpts()));
    expect(result.current.submitDialog).toEqual({ open: false, status: 'confirm' });
  });
});

// ─── handleChange ─────────────────────────────────────────────────────────────

describe('useFormModal — handleChange', () => {
  it('อัปเดต field ที่ระบุจาก e.target.value', () => {
    const { result } = renderHook(() => useFormModal(defaultOpts()));
    act(() => result.current.handleChange('name')({ target: { value: 'ທົດສອບ' } }));
    expect(result.current.formData.name).toBe('ທົດສອບ');
  });

  it('อัปเดต field จาก value ตรงๆ (ไม่มี e.target)', () => {
    const { result } = renderHook(() => useFormModal(defaultOpts()));
    act(() => result.current.handleChange('name')('ທົດສອບ'));
    expect(result.current.formData.name).toBe('ທົດສອບ');
  });

  it('ล้าง error ของ field นั้นเมื่อพิมพ์', () => {
    const validate = () => ({ name: 'ກະລຸນາປ້ອນຊື່' });
    const { result } = renderHook(() => useFormModal(defaultOpts({ validate })));
    act(() => result.current.handleSubmit({ preventDefault: vi.fn() }));
    expect(result.current.errors.name).toBeTruthy();
    act(() => result.current.handleChange('name')({ target: { value: 'ທົດສອບ' } }));
    expect(result.current.errors.name).toBe('');
  });

  it('ใช้ filter function แปลง value ก่อน set', () => {
    const { result } = renderHook(() => useFormModal(defaultOpts()));
    act(() => result.current.handleChange('name', (v) => v.toUpperCase())({ target: { value: 'abc' } }));
    expect(result.current.formData.name).toBe('ABC');
  });
});

// ─── handleSubmit ─────────────────────────────────────────────────────────────

describe('useFormModal — handleSubmit', () => {
  it('เปิด confirm dialog เมื่อไม่มี validation error', () => {
    const { result } = renderHook(() => useFormModal(defaultOpts()));
    act(() => result.current.handleSubmit({ preventDefault: vi.fn() }));
    expect(result.current.submitDialog.open).toBe(true);
  });

  it('set errors และไม่เปิด dialog เมื่อ validate ไม่ผ่าน', () => {
    const validate = () => ({ name: 'ກະລຸນາປ້ອນ' });
    const { result } = renderHook(() => useFormModal(defaultOpts({ validate })));
    act(() => result.current.handleSubmit({ preventDefault: vi.fn() }));
    expect(result.current.errors.name).toBe('ກະລຸນາປ້ອນ');
    expect(result.current.submitDialog.open).toBe(false);
  });

  it('ไม่ set errors และเปิด dialog เมื่อ validate ผ่าน', () => {
    const validate = (data) => (data.name ? {} : { name: 'ກະລຸນາປ້ອນ' });
    const { result } = renderHook(() =>
      useFormModal(defaultOpts({ validate, initialData: { name: 'ທົດສອບ' } }))
    );
    act(() => result.current.handleSubmit({ preventDefault: vi.fn() }));
    expect(result.current.errors).toEqual({});
    expect(result.current.submitDialog.open).toBe(true);
  });
});

// ─── handleConfirmSubmit ──────────────────────────────────────────────────────

describe('useFormModal — handleConfirmSubmit', () => {
  it('เรียก onSubmit ด้วย formData', async () => {
    const onSubmit = vi.fn().mockResolvedValue();
    const { result } = renderHook(() =>
      useFormModal(defaultOpts({ onSubmit, initialData: { name: 'ທົດສອບ' } }))
    );
    await act(async () => { await result.current.handleConfirmSubmit(); });
    expect(onSubmit).toHaveBeenCalledWith({ name: 'ທົດສອບ' });
  });

  it('ใช้ transformData ก่อนส่ง onSubmit', async () => {
    const onSubmit = vi.fn().mockResolvedValue();
    const transformData = (d) => ({ ...d, extra: true });
    const { result } = renderHook(() =>
      useFormModal(defaultOpts({ onSubmit, transformData, initialData: { name: 'ທົດສອບ' } }))
    );
    await act(async () => { await result.current.handleConfirmSubmit(); });
    expect(onSubmit).toHaveBeenCalledWith({ name: 'ທົດສອບ', extra: true });
  });

  it('status เป็น success หลัง onSubmit สำเร็จ', async () => {
    const onSubmit = vi.fn().mockResolvedValue();
    const { result } = renderHook(() => useFormModal(defaultOpts({ onSubmit })));
    await act(async () => { await result.current.handleConfirmSubmit(); });
    expect(result.current.submitDialog.status).toBe('success');
  });

  it('ปิด dialog และ status กลับเป็น confirm เมื่อ onSubmit fail', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('ຜິດພາດ'));
    const { result } = renderHook(() => useFormModal(defaultOpts({ onSubmit })));
    await act(async () => { await result.current.handleConfirmSubmit(); });
    expect(result.current.submitDialog.open).toBe(false);
    expect(result.current.submitDialog.status).toBe('confirm');
  });
});

// ─── handleCancelSubmit ───────────────────────────────────────────────────────

describe('useFormModal — handleCancelSubmit', () => {
  it('ปิด confirm dialog', () => {
    const { result } = renderHook(() => useFormModal(defaultOpts()));
    act(() => result.current.handleSubmit({ preventDefault: vi.fn() }));
    expect(result.current.submitDialog.open).toBe(true);
    act(() => result.current.handleCancelSubmit());
    expect(result.current.submitDialog.open).toBe(false);
  });
});

// ─── handleClose ─────────────────────────────────────────────────────────────

describe('useFormModal — handleClose', () => {
  it('เรียก onClose หลัง animation 300ms', () => {
    const onClose = vi.fn();
    const { result } = renderHook(() => useFormModal(defaultOpts({ onClose })));
    act(() => result.current.handleClose());
    expect(onClose).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(300));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('isClosing=true ระหว่าง animation', () => {
    const { result } = renderHook(() => useFormModal(defaultOpts()));
    act(() => result.current.handleClose());
    expect(result.current.isClosing).toBe(true);
    act(() => vi.advanceTimersByTime(300));
    expect(result.current.isClosing).toBe(false);
  });
});

// ─── shouldRender ─────────────────────────────────────────────────────────────

describe('useFormModal — shouldRender', () => {
  it('true เมื่อ isOpen=true', () => {
    const { result } = renderHook(() => useFormModal(defaultOpts({ isOpen: true })));
    expect(result.current.shouldRender).toBe(true);
  });

  it('false เมื่อ isOpen=false และไม่ได้ closing', () => {
    const { result } = renderHook(() => useFormModal(defaultOpts({ isOpen: false })));
    expect(result.current.shouldRender).toBe(false);
  });

  it('true ระหว่าง closing animation แม้ isOpen=false', () => {
    const { result, rerender } = renderHook(
      ({ isOpen }) => useFormModal(defaultOpts({ isOpen })),
      { initialProps: { isOpen: true } }
    );
    rerender({ isOpen: false });
    act(() => result.current.handleClose());
    expect(result.current.shouldRender).toBe(true);
  });
});

// ─── setFormData / setErrors (updater function branch) ───────────────────────

describe('useFormModal — setFormData', () => {
  it('รับ object ตรงๆ', () => {
    const { result } = renderHook(() => useFormModal(defaultOpts()));
    act(() => result.current.setFormData({ name: 'ໃໝ່', note: 'xxx' }));
    expect(result.current.formData).toEqual({ name: 'ໃໝ່', note: 'xxx' });
  });

  it('รับ updater function', () => {
    const { result } = renderHook(() => useFormModal(defaultOpts()));
    act(() => result.current.setFormData((prev) => ({ ...prev, name: 'ທົດສອບ' })));
    expect(result.current.formData.name).toBe('ທົດສອບ');
  });
});

describe('useFormModal — setErrors', () => {
  it('รับ object ตรงๆ', () => {
    const { result } = renderHook(() => useFormModal(defaultOpts()));
    act(() => result.current.setErrors({ name: 'ກະລຸນາປ້ອນ' }));
    expect(result.current.errors.name).toBe('ກະລຸນາປ້ອນ');
  });

  it('รับ updater function', () => {
    const { result } = renderHook(() => useFormModal(defaultOpts()));
    act(() => result.current.setErrors((prev) => ({ ...prev, note: 'ຜິດ' })));
    expect(result.current.errors.note).toBe('ຜິດ');
  });
});

// ─── handleCloseSubmit ────────────────────────────────────────────────────────

describe('useFormModal — handleCloseSubmit', () => {
  it('ปิด dialog และเริ่ม close animation', () => {
    const onClose = vi.fn();
    const { result } = renderHook(() => useFormModal(defaultOpts({ onClose })));
    act(() => result.current.handleSubmit({ preventDefault: vi.fn() }));
    expect(result.current.submitDialog.open).toBe(true);
    act(() => result.current.handleCloseSubmit());
    expect(result.current.submitDialog.open).toBe(false);
    expect(result.current.isClosing).toBe(true);
    act(() => vi.advanceTimersByTime(300));
    expect(onClose).toHaveBeenCalledOnce();
  });
});

// ─── reset on reopen ──────────────────────────────────────────────────────────

describe('useFormModal — reset เมื่อเปิดใหม่', () => {
  it('reset formData กลับเป็น initialData เมื่อเปิดอีกครั้ง', () => {
    const { result, rerender } = renderHook(
      ({ isOpen }) => useFormModal(defaultOpts({ isOpen, initialData: { name: '' } })),
      { initialProps: { isOpen: true } }
    );
    act(() => result.current.handleChange('name')({ target: { value: 'ທົດສອບ' } }));
    expect(result.current.formData.name).toBe('ທົດສອບ');
    rerender({ isOpen: false });
    rerender({ isOpen: true });
    expect(result.current.formData.name).toBe('');
  });
});
