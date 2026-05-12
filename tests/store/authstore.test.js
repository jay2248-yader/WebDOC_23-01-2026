import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../../src/store/authstore';

beforeEach(() => {
  useAuthStore.setState({ user: null, token: null });
});

describe('authstore — setAuth', () => {
  it('แยก token ออกจาก user และเก็บแยกกัน', () => {
    useAuthStore.getState().setAuth({ token: 'abc123', username: 'jay', role: 'admin' });
    const { user, token } = useAuthStore.getState();
    expect(token).toBe('abc123');
    expect(user).toEqual({ username: 'jay', role: 'admin' });
    expect(user.token).toBeUndefined();
  });

  it('setAuth(null) ล้าง user และ token', () => {
    useAuthStore.getState().setAuth({ token: 'abc', username: 'jay' });
    useAuthStore.getState().setAuth(null);
    const { user, token } = useAuthStore.getState();
    expect(user).toBeNull();
    expect(token).toBeNull();
  });
});

describe('authstore — setAuth without token', () => {
  it('token เป็น null เมื่อ data ไม่มี token field', () => {
    useAuthStore.getState().setAuth({ username: 'jay' });
    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().user).toEqual({ username: 'jay' });
  });
});

describe('authstore — logout', () => {
  it('logout ล้าง user และ token', () => {
    useAuthStore.getState().setAuth({ token: 'abc', username: 'jay' });
    useAuthStore.getState().logout();
    const { user, token } = useAuthStore.getState();
    expect(user).toBeNull();
    expect(token).toBeNull();
  });
});

describe('authstore — isAuthed', () => {
  it('คืน false เมื่อยังไม่ login', () => {
    expect(useAuthStore.getState().isAuthed()).toBe(false);
  });

  it('คืน true หลัง login สำเร็จ', () => {
    useAuthStore.getState().setAuth({ token: 'abc', username: 'jay' });
    expect(useAuthStore.getState().isAuthed()).toBe(true);
  });

  it('คืน false หลัง logout', () => {
    useAuthStore.getState().setAuth({ token: 'abc', username: 'jay' });
    useAuthStore.getState().logout();
    expect(useAuthStore.getState().isAuthed()).toBe(false);
  });
});
