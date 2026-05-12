/**
 * Login Flow — Integration Test
 *
 * ทดสอบ flow ทั้งหมดของหน้า login:
 *   LoginForm → useLogin → authservice → authstore
 *
 * ไม่ได้ยิง API จริง แต่ทดสอบว่า component + hook + store ทำงานร่วมกันถูกต้อง
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginForm from '../../src/components/auth/LoginForm';
import { useAuthStore } from '../../src/store/authstore';

// mock เฉพาะ API call — ส่วนที่เหลือ (hook, store, component) ทำงานจริง
vi.mock('../../src/services/authservice', () => ({
  loginUser: vi.fn(),
}));

// mock navigate เพราะไม่มี real router ใน test
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

import { loginUser } from '../../src/services/authservice';

const renderLoginForm = () =>
  render(<MemoryRouter><LoginForm /></MemoryRouter>);

beforeEach(() => {
  vi.clearAllMocks();
  useAuthStore.setState({ user: null, token: null });
});

// ─── Flow 1: Login สำเร็จ ─────────────────────────────────────────────────────

describe('Login Flow — สำเร็จ', () => {
  it('กรอกข้อมูลครบ กด submit → token ถูก set ใน store', async () => {
    loginUser.mockResolvedValue({ token: 'tok123', username: 'jay' });
    renderLoginForm();

    await userEvent.type(screen.getByPlaceholderText('ກະລຸນາປ້ອນລະຫັດພະນັກງານ'), 'emp001');
    await userEvent.type(screen.getByPlaceholderText('ກະລຸນາປ້ອນລະຫັດຜ່ານ'), 'pass123');
    await userEvent.click(screen.getByRole('button', { name: /ເຂົ້າສູ່ລະບົບ/ }));

    await waitFor(() => {
      expect(useAuthStore.getState().token).toBe('tok123');
    });
  });

  it('login สำเร็จ → navigate ไป /dashboard', async () => {
    loginUser.mockResolvedValue({ token: 'tok123', username: 'jay' });
    renderLoginForm();

    await userEvent.type(screen.getByPlaceholderText('ກະລຸນາປ້ອນລະຫັດພະນັກງານ'), 'emp001');
    await userEvent.type(screen.getByPlaceholderText('ກະລຸນາປ້ອນລະຫັດຜ່ານ'), 'pass123');
    await userEvent.click(screen.getByRole('button', { name: /ເຂົ້າສູ່ລະບົບ/ }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('login สำเร็จ → loginUser ถูกเรียกด้วย usercode และ pwds', async () => {
    loginUser.mockResolvedValue({ token: 'tok123', username: 'jay' });
    renderLoginForm();

    await userEvent.type(screen.getByPlaceholderText('ກະລຸນາປ້ອນລະຫັດພະນັກງານ'), 'emp001');
    await userEvent.type(screen.getByPlaceholderText('ກະລຸນາປ້ອນລະຫັດຜ່ານ'), 'pass123');
    await userEvent.click(screen.getByRole('button', { name: /ເຂົ້າສູ່ລະບົບ/ }));

    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledWith({ usercode: 'emp001', pwds: 'pass123' });
    });
  });
});

// ─── Flow 2: Validation ───────────────────────────────────────────────────────

describe('Login Flow — Validation', () => {
  it('กด submit โดยไม่กรอกข้อมูล → แสดง error ทั้ง 2 field', async () => {
    renderLoginForm();

    await userEvent.click(screen.getByRole('button', { name: /ເຂົ້າສູ່ລະບົບ/ }));

    await waitFor(() => {
      expect(screen.getByText('ກະລຸນາປ້ອນລະຫັດພະນັກງານ')).toBeInTheDocument();
      expect(screen.getByText('ກະລຸນາປ້ອນລະຫັດຜ່ານ')).toBeInTheDocument();
    });
  });

  it('กรอกแค่ employeeId → error เฉพาะ password field', async () => {
    renderLoginForm();

    await userEvent.type(screen.getByPlaceholderText('ກະລຸນາປ້ອນລະຫັດພະນັກງານ'), 'emp001');
    await userEvent.click(screen.getByRole('button', { name: /ເຂົ້າສູ່ລະບົບ/ }));

    await waitFor(() => {
      expect(screen.getByText('ກະລຸນາປ້ອນລະຫັດຜ່ານ')).toBeInTheDocument();
      expect(screen.queryByText('ກະລຸນາປ້ອນລະຫັດພະນັກງານ')).not.toBeInTheDocument();
    });
  });

  it('validation error → ไม่เรียก API', async () => {
    renderLoginForm();

    await userEvent.click(screen.getByRole('button', { name: /ເຂົ້າສູ່ລະບົບ/ }));

    await waitFor(() => {
      expect(loginUser).not.toHaveBeenCalled();
    });
  });

  it('validation error → ไม่ navigate', async () => {
    renderLoginForm();

    await userEvent.click(screen.getByRole('button', { name: /ເຂົ້າສູ່ລະບົບ/ }));

    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});

// ─── Flow 3: API Error ────────────────────────────────────────────────────────

describe('Login Flow — API Error', () => {
  it('API fail → แสดง error message บนฟอร์ม', async () => {
    loginUser.mockRejectedValue(new Error('Unauthorized'));
    renderLoginForm();

    await userEvent.type(screen.getByPlaceholderText('ກະລຸນາປ້ອນລະຫັດພະນັກງານ'), 'emp001');
    await userEvent.type(screen.getByPlaceholderText('ກະລຸນາປ້ອນລະຫັດຜ່ານ'), 'wrongpass');
    await userEvent.click(screen.getByRole('button', { name: /ເຂົ້າສູ່ລະບົບ/ }));

    await waitFor(() => {
      expect(screen.getByText('ລະຫັດພະນັກງານ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ')).toBeInTheDocument();
    });
  });

  it('API fail → token ยังเป็น null', async () => {
    loginUser.mockRejectedValue(new Error('Unauthorized'));
    renderLoginForm();

    await userEvent.type(screen.getByPlaceholderText('ກະລຸນາປ້ອນລະຫັດພະນັກງານ'), 'emp001');
    await userEvent.type(screen.getByPlaceholderText('ກະລຸນາປ້ອນລະຫັດຜ່ານ'), 'wrongpass');
    await userEvent.click(screen.getByRole('button', { name: /ເຂົ້າສູ່ລະບົບ/ }));

    await waitFor(() => {
      expect(useAuthStore.getState().token).toBeNull();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});

// ─── Flow 4: UX ───────────────────────────────────────────────────────────────

describe('Login Flow — UX', () => {
  it('ระหว่าง loading → button แสดงข้อความ loading', async () => {
    // ให้ loginUser ค้างเพื่อจับสถานะ loading
    loginUser.mockImplementation(() => new Promise(() => {}));
    renderLoginForm();

    await userEvent.type(screen.getByPlaceholderText('ກະລຸນາປ້ອນລະຫັດພະນັກງານ'), 'emp001');
    await userEvent.type(screen.getByPlaceholderText('ກະລຸນາປ້ອນລະຫັດຜ່ານ'), 'pass123');
    await userEvent.click(screen.getByRole('button', { name: /ເຂົ້າສູ່ລະບົບ/ }));

    await waitFor(() => {
      expect(screen.getByText('ກຳລັງເຂົ້າສູ່ລະບົບ...')).toBeInTheDocument();
    });
  });

  it('password input รับอักขระพิเศษได้', async () => {
    renderLoginForm();
    const passwordInput = screen.getByPlaceholderText('ກະລຸນາປ້ອນລະຫັດຜ່ານ');
    await userEvent.type(passwordInput, 'P@ss!123');
    expect(passwordInput).toHaveValue('P@ss!123');
  });

  it('employeeId input กรองอักขระพิเศษออก', async () => {
    renderLoginForm();
    const empInput = screen.getByPlaceholderText('ກະລຸນາປ້ອນລະຫັດພະນັກງານ');
    await userEvent.type(empInput, 'emp!@#001');
    expect(empInput).toHaveValue('emp001');
  });
});
