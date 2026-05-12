import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useLogin from '../../src/hooks/useLogin';
import { useAuthStore } from '../../src/store/authstore';

vi.mock('../../src/services/authservice', () => ({
  loginUser: vi.fn(),
}));

import { loginUser } from '../../src/services/authservice';

beforeEach(() => {
  vi.clearAllMocks();
  useAuthStore.setState({ user: null, token: null });
});

describe('useLogin — initial state', () => {
  it('เริ่มต้น fields ว่างและไม่มี error', () => {
    const { result } = renderHook(() => useLogin());
    expect(result.current.employeeId).toBe('');
    expect(result.current.password).toBe('');
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('');
  });
});

describe('useLogin — handleEmployeeIdChange', () => {
  it('กรองอักขระพิเศษออก', () => {
    const { result } = renderHook(() => useLogin());
    act(() => result.current.handleEmployeeIdChange('abc!@#'));
    expect(result.current.employeeId).toBe('abc');
  });

  it('ไม่รับเกิน 20 ตัวอักษร', () => {
    const { result } = renderHook(() => useLogin());
    act(() => result.current.handleEmployeeIdChange('a'.repeat(21)));
    expect(result.current.employeeId).toBe('');
  });
});

describe('useLogin — handlePasswordChange', () => {
  it('รับอักขระพิเศษได้ (alphanumericOnly=false)', () => {
    const { result } = renderHook(() => useLogin());
    act(() => result.current.handlePasswordChange('P@ss!123'));
    expect(result.current.password).toBe('P@ss!123');
  });

  it('ไม่รับเกิน 20 ตัวอักษร', () => {
    const { result } = renderHook(() => useLogin());
    act(() => result.current.handlePasswordChange('a'.repeat(21)));
    expect(result.current.password).toBe('');
  });
});

describe('useLogin — handleSubmit validation', () => {
  it('คืน false และ set fieldErrors เมื่อ fields ว่าง', async () => {
    const { result } = renderHook(() => useLogin());
    let success;
    await act(async () => { success = await result.current.handleSubmit(); });
    expect(success).toBe(false);
    expect(result.current.fieldErrors.employeeId).toBeTruthy();
    expect(result.current.fieldErrors.password).toBeTruthy();
  });

  it('set fieldErrors.employeeId เมื่อใส่แค่ password', async () => {
    const { result } = renderHook(() => useLogin());
    act(() => result.current.handlePasswordChange('pass123'));
    let success;
    await act(async () => { success = await result.current.handleSubmit(); });
    expect(success).toBe(false);
    expect(result.current.fieldErrors.employeeId).toBeTruthy();
    expect(result.current.fieldErrors.password).toBe('');
  });
});

describe('useLogin — handleEmployeeIdKeyDown', () => {
  it('กด Enter โฟกัสไปที่ password input', () => {
    const { result } = renderHook(() => useLogin());
    const mockFocus = vi.fn();
    // inject mock ref
    result.current.passwordInputRef.current = { focus: mockFocus };
    act(() => result.current.handleEmployeeIdKeyDown({ key: 'Enter', preventDefault: vi.fn() }));
    expect(mockFocus).toHaveBeenCalledOnce();
  });

  it('กดปุ่มอื่น ไม่โฟกัส', () => {
    const { result } = renderHook(() => useLogin());
    const mockFocus = vi.fn();
    result.current.passwordInputRef.current = { focus: mockFocus };
    act(() => result.current.handleEmployeeIdKeyDown({ key: 'Tab', preventDefault: vi.fn() }));
    expect(mockFocus).not.toHaveBeenCalled();
  });

  it('toggle showPassword ด้วย setShowPassword', () => {
    const { result } = renderHook(() => useLogin());
    expect(result.current.showPassword).toBe(false);
    act(() => result.current.setShowPassword(true));
    expect(result.current.showPassword).toBe(true);
  });
});

describe('useLogin — handleSubmit API call', () => {
  it('เรียก loginUser ด้วย usercode และ pwds ที่ถูกต้อง', async () => {
    loginUser.mockResolvedValue({ token: 'tok123', username: 'jay' });
    const { result } = renderHook(() => useLogin());
    act(() => {
      result.current.handleEmployeeIdChange('emp001');
      result.current.handlePasswordChange('pass123');
    });
    await act(async () => { await result.current.handleSubmit(); });
    expect(loginUser).toHaveBeenCalledWith({ usercode: 'emp001', pwds: 'pass123' });
  });

  it('คืน true และ setAuth เมื่อ login สำเร็จ', async () => {
    loginUser.mockResolvedValue({ token: 'tok123', username: 'jay' });
    const { result } = renderHook(() => useLogin());
    act(() => {
      result.current.handleEmployeeIdChange('emp001');
      result.current.handlePasswordChange('pass123');
    });
    let success;
    await act(async () => { success = await result.current.handleSubmit(); });
    expect(success).toBe(true);
    expect(useAuthStore.getState().token).toBe('tok123');
  });

  it('คืน false และ set error เมื่อ API fail', async () => {
    loginUser.mockRejectedValue(new Error('Unauthorized'));
    const { result } = renderHook(() => useLogin());
    act(() => {
      result.current.handleEmployeeIdChange('emp001');
      result.current.handlePasswordChange('wrong');
    });
    let success;
    await act(async () => { success = await result.current.handleSubmit(); });
    expect(success).toBe(false);
    expect(result.current.error).toBeTruthy();
    expect(useAuthStore.getState().token).toBeNull();
  });
});
