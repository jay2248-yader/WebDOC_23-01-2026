import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import Button from '../../../src/components/common/Button';

describe('Button', () => {
  it('แสดงข้อความที่ส่งมา', () => {
    render(<Button>ເພີ່ມ</Button>);
    expect(screen.getByText('ເພີ່ມ')).toBeInTheDocument();
  });

  it('เรียก onClick เมื่อกด', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>ກົດ</Button>);
    await userEvent.click(screen.getByText('ກົດ'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('ไม่เรียก onClick เมื่อ disabled=true', async () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>ກົດ</Button>);
    await userEvent.click(screen.getByText('ກົດ'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('ไม่เรียก onClick เมื่อ loading=true', async () => {
    const handleClick = vi.fn();
    render(<Button loading onClick={handleClick}>ກຳລັງໂຫລດ</Button>);
    await userEvent.click(screen.getByText('ກຳລັງໂຫລດ'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('มี attribute type="submit" เมื่อส่ง type="submit"', () => {
    render(<Button type="submit">ສົ່ງ</Button>);
    expect(screen.getByText('ສົ່ງ')).toHaveAttribute('type', 'submit');
  });
});
