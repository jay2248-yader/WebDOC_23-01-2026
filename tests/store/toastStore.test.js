import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useToastStore, toast } from '../../src/store/toastStore';

beforeEach(() => {
  useToastStore.setState({ toasts: [] });
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('toastStore — show', () => {
  it('เพิ่ม toast เข้า list', () => {
    useToastStore.getState().show('success', 'ບັນທຶກສຳເລັດ');
    expect(useToastStore.getState().toasts).toHaveLength(1);
    expect(useToastStore.getState().toasts[0]).toMatchObject({ type: 'success', message: 'ບັນທຶກສຳເລັດ' });
  });

  it('เพิ่มหลาย toast ได้', () => {
    useToastStore.getState().show('success', 'ອັນທີ 1');
    useToastStore.getState().show('error', 'ອັນທີ 2');
    expect(useToastStore.getState().toasts).toHaveLength(2);
  });

  it('toast หายอัตโนมัติหลัง duration หมด', () => {
    useToastStore.getState().show('info', 'ລໍຖ້າ', 1000);
    expect(useToastStore.getState().toasts).toHaveLength(1);
    vi.advanceTimersByTime(1000);
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });
});

describe('toastStore — dismiss', () => {
  it('ลบ toast ตาม id', () => {
    useToastStore.getState().show('success', 'test');
    const id = useToastStore.getState().toasts[0].id;
    useToastStore.getState().dismiss(id);
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });

  it('dismiss id ที่ไม่มีไม่ throw', () => {
    expect(() => useToastStore.getState().dismiss(9999)).not.toThrow();
  });
});

describe('toast helpers', () => {
  it('toast.success เพิ่ม toast ประเภท success', () => {
    toast.success('ສຳເລັດ');
    expect(useToastStore.getState().toasts[0]).toMatchObject({ type: 'success', message: 'ສຳເລັດ' });
  });

  it('toast.error เพิ่ม toast ประเภท error', () => {
    toast.error('ຜິດພາດ');
    expect(useToastStore.getState().toasts[0]).toMatchObject({ type: 'error', message: 'ຜິດພາດ' });
  });

  it('toast.info เพิ่ม toast ประเภท info', () => {
    toast.info('ຂໍ້ມູນ');
    expect(useToastStore.getState().toasts[0]).toMatchObject({ type: 'info', message: 'ຂໍ້ມູນ' });
  });
});
