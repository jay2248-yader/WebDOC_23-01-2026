import { describe, it, expect, vi, beforeEach } from 'vitest';
import createCrudService from '../../src/services/createCrudService';

vi.mock('../../src/api/http', () => ({
  http: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import { http } from '../../src/api/http';

const ENDPOINTS = {
  GET_ALL: '/api/test/getAll',
  NEW: '/api/test/new',
  UPDATE: '/api/test/update',
  DELETE: '/api/test/delete',
};

beforeEach(() => vi.clearAllMocks());

describe('createCrudService — getAll', () => {
  it('คืน data, total, lastPage เมื่อ success', async () => {
    http.get.mockResolvedValue({
      data: { success: true, data_id: { data: [{ id: 1 }], total: 1 } },
    });
    const { getAll } = createCrudService(ENDPOINTS, 'test', 'id');
    const result = await getAll({ page: 1, limit: 10 });
    expect(result.data).toEqual([{ id: 1 }]);
    expect(result.total).toBe(1);
  });

  it('throw เมื่อ success=false', async () => {
    http.get.mockResolvedValue({ data: { success: false, message: 'ບໍ່ພົບຂໍ້ມູນ' } });
    const { getAll } = createCrudService(ENDPOINTS, 'test', 'id');
    await expect(getAll()).rejects.toThrow('ບໍ່ພົບຂໍ້ມູນ');
  });

  it('รองรับ data_id เป็น array โดยตรง', async () => {
    http.get.mockResolvedValue({
      data: { success: true, data_id: [{ id: 1 }, { id: 2 }] },
    });
    const { getAll } = createCrudService(ENDPOINTS, 'test', 'id');
    const result = await getAll({ limit: 10 });
    expect(result.data).toHaveLength(2);
    expect(result.total).toBe(2);
  });
});

describe('createCrudService — getAll (edge cases)', () => {
  it('คำนวณ lastPage จาก total/limit เมื่อ backend ไม่ส่ง lastPage', async () => {
    http.get.mockResolvedValue({
      data: { success: true, data_id: { data: [], total: 25 } },
    });
    const { getAll } = createCrudService(ENDPOINTS, 'test', 'id');
    const result = await getAll({ page: 1, limit: 10 });
    expect(result.lastPage).toBe(3);
  });

  it('ใช้ parseGetAll custom เมื่อส่งผ่าน opts', async () => {
    http.get.mockResolvedValue({
      data: { success: true, custom: [{ id: 99 }] },
    });
    const parseGetAll = (res) => ({ data: res.data.custom, total: 1, lastPage: 1 });
    const { getAll } = createCrudService(ENDPOINTS, 'test', 'id', { parseGetAll });
    const result = await getAll();
    expect(result.data).toEqual([{ id: 99 }]);
  });

  it('throw default message เมื่อ success=false และไม่มี message', async () => {
    http.get.mockResolvedValue({ data: { success: false } });
    const { getAll } = createCrudService(ENDPOINTS, 'test', 'id');
    await expect(getAll()).rejects.toThrow('Failed to fetch test');
  });
});

describe('createCrudService — create', () => {
  it('ส่ง POST และคืน response data', async () => {
    http.post.mockResolvedValue({ data: { success: true, data_id: { id: 99 } } });
    const { create } = createCrudService(ENDPOINTS, 'test', 'id');
    const result = await create({ name: 'ທົດສອບ' });
    expect(http.post).toHaveBeenCalledWith(ENDPOINTS.NEW, { name: 'ທົດສອບ' });
    expect(result).toEqual({ success: true, data_id: { id: 99 } });
  });

  it('throw เมื่อ success=false', async () => {
    http.post.mockResolvedValue({ data: { success: false, message: 'ສ້າງບໍ່ໄດ້' } });
    const { create } = createCrudService(ENDPOINTS, 'test', 'id');
    await expect(create({})).rejects.toThrow('ສ້າງບໍ່ໄດ້');
  });

  it('ใช้ transformCreate ก่อนส่ง payload', async () => {
    http.post.mockResolvedValue({ data: { success: true } });
    const transformCreate = (p) => ({ ...p, extra: true });
    const { create } = createCrudService(ENDPOINTS, 'test', 'id', { transformCreate });
    await create({ name: 'ທົດສອບ' });
    expect(http.post).toHaveBeenCalledWith(ENDPOINTS.NEW, { name: 'ທົດສອບ', extra: true });
  });
});

describe('createCrudService — update', () => {
  it('ส่ง PUT และคืน response data', async () => {
    http.put.mockResolvedValue({ data: { success: true } });
    const { update } = createCrudService(ENDPOINTS, 'test', 'id');
    await update({ id: 1, name: 'ໃໝ່' });
    expect(http.put).toHaveBeenCalledWith(ENDPOINTS.UPDATE, { id: 1, name: 'ໃໝ່' });
  });

  it('throw เมื่อ success=false', async () => {
    http.put.mockResolvedValue({ data: { success: false, message: 'ແກ້ໄຂບໍ່ໄດ້' } });
    const { update } = createCrudService(ENDPOINTS, 'test', 'id');
    await expect(update({})).rejects.toThrow('ແກ້ໄຂບໍ່ໄດ້');
  });

  it('ใช้ transformUpdate ก่อนส่ง payload', async () => {
    http.put.mockResolvedValue({ data: { success: true } });
    const transformUpdate = (p) => ({ ...p, updated: true });
    const { update } = createCrudService(ENDPOINTS, 'test', 'id', { transformUpdate });
    await update({ id: 1 });
    expect(http.put).toHaveBeenCalledWith(ENDPOINTS.UPDATE, { id: 1, updated: true });
  });
});

describe('createCrudService — remove', () => {
  it('ส่ง DELETE พร้อม id ที่ถูกต้อง', async () => {
    http.delete.mockResolvedValue({ data: { success: true } });
    const { remove } = createCrudService(ENDPOINTS, 'test', 'tid');
    await remove(5);
    expect(http.delete).toHaveBeenCalledWith(ENDPOINTS.DELETE, { data: { tid: '5' } });
  });

  it('throw เมื่อ success=false', async () => {
    http.delete.mockResolvedValue({ data: { success: false, message: 'ລຶບບໍ່ໄດ້' } });
    const { remove } = createCrudService(ENDPOINTS, 'test', 'id');
    await expect(remove(1)).rejects.toThrow('ລຶບບໍ່ໄດ້');
  });
});
