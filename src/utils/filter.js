export function filterUsers(users, query) {
  const q = (query || "").trim().toLowerCase();
  if (!q) return users;

  return users.filter((u) => {
    const text = `${u.id} ${u.studentId} ${u.name} ${u.email} ${u.status} ${u.role}`.toLowerCase();
    return text.includes(q);
  });
}

export function paginate(items, page, pageSize) {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return items.slice(start, end);
}

export function getTotalPages(totalItems, pageSize) {
  return Math.max(1, Math.ceil(totalItems / pageSize));
}
