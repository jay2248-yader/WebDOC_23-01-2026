import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ErrorMessage from '../../../src/components/common/ErrorMessage';

describe('ErrorMessage', () => {
  it('แสดง error message เมื่อมี message', () => {
    render(<ErrorMessage message="ເກີດຂໍ້ຜິດພາດ" />);
    expect(screen.getByText('ເກີດຂໍ້ຜິດພາດ')).toBeInTheDocument();
  });

  it('ไม่ render อะไรเมื่อ message ว่าง', () => {
    const { container } = render(<ErrorMessage message="" />);
    expect(container.firstChild).toBeNull();
  });

  it('ไม่ render อะไรเมื่อไม่ส่ง message', () => {
    const { container } = render(<ErrorMessage />);
    expect(container.firstChild).toBeNull();
  });
});
