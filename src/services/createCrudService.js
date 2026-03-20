import { http } from "../api/http";

/**
 * createCrudService — factory that generates standard CRUD service functions.
 *
 * @param {Object} endpoints       – { GET_ALL, NEW, DELETE, UPDATE }
 * @param {string} entityName      – for error messages (e.g. "board")
 * @param {string} idKey           – primary key field name (e.g. "bdid")
 * @param {Object} [opts]
 * @param {Function} [opts.parseGetAll]     – custom response parser for getAll
 * @param {Function} [opts.transformCreate] – transform payload before create
 * @param {Function} [opts.transformUpdate] – transform payload before update
 */
export default function createCrudService(endpoints, entityName, idKey, opts = {}) {
  const defaultParseGetAll = (res, params) => {
    const raw = res.data.data_id || res.data.message || {};
    const dataArray = Array.isArray(raw) ? raw : (raw.data || []);
    const total = raw.total ?? dataArray.length;
    const limit = Number(params.limit) || 10;
    return {
      data: dataArray,
      total,
      lastPage: raw.lastPage || raw.last_page || raw.totalPages || Math.ceil(total / limit) || 1,
    };
  };

  const parseGetAll = opts.parseGetAll || defaultParseGetAll;

  async function getAll(params = {}, signal) {
    const res = await http.get(endpoints.GET_ALL, { params, signal });
    if (!res.data?.success) {
      throw new Error(res.data?.message || `Failed to fetch ${entityName}`);
    }
    return parseGetAll(res, params);
  }

  async function create(payload) {
    const data = opts.transformCreate ? opts.transformCreate(payload) : payload;
    const res = await http.post(endpoints.NEW, data);
    if (!res.data?.success) {
      throw new Error(res.data?.message || `Failed to create ${entityName}`);
    }
    return res.data;
  }

  async function update(payload) {
    const data = opts.transformUpdate ? opts.transformUpdate(payload) : payload;
    const res = await http.put(endpoints.UPDATE, data);
    if (!res.data?.success) {
      throw new Error(res.data?.message || `Failed to update ${entityName}`);
    }
    return res.data;
  }

  async function remove(id) {
    const res = await http.delete(endpoints.DELETE, {
      data: { [idKey]: id.toString() },
    });
    if (!res.data?.success) {
      throw new Error(res.data?.message || `Failed to delete ${entityName}`);
    }
    return res.data;
  }

  return { getAll, create, update, remove };
}
