const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ===== RECURSOS =====
export async function obtenerRecursos() {
  const res = await fetch(`${API_BASE}/api/resources`);
  if (!res.ok) throw new Error('Error al obtener recursos');
  return res.json();
}

export async function obtenerRecursosPorExtrawork(extraWorkId: string) {
  const res = await fetch(`${API_BASE}/api/resources/extrawork/${extraWorkId}`);
  if (!res.ok) throw new Error('Error al obtener recursos');
  return res.json();
}

export async function obtenerRecurso(id: string) {
  const res = await fetch(`${API_BASE}/api/resources/${id}`);
  if (!res.ok) throw new Error('Error al obtener recurso');
  return res.json();
}

export async function crearRecurso(data: {
  name: string;
  type: string;
  url?: string;
  metadata?: any;
  extraWorkId: string;
}) {
  const res = await fetch(`${API_BASE}/api/resources`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Error al crear recurso');
  }
  return res.json();
}

export async function actualizarRecurso(
  id: string,
  data: { name?: string; type?: string; url?: string; metadata?: any }
) {
  const res = await fetch(`${API_BASE}/api/resources/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al actualizar recurso');
  return res.json();
}

export async function asignarRecursoAExtrawork(resourceId: string, extraWorkId: string) {
  const res = await fetch(`${API_BASE}/api/resources/${resourceId}/assign/${extraWorkId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Error al asignar recurso');
  return res.json();
}

export async function eliminarRecurso(id: string) {
  const res = await fetch(`${API_BASE}/api/resources/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Error al eliminar recurso');
  return res.json();
}

// ===== EXTRAWORKS =====
export async function obtenerExtraworks() {
  const res = await fetch(`${API_BASE}/api/extraworks`);
  if (!res.ok) throw new Error('Error al obtener extraworks');
  return res.json();
}

export async function obtenerExtrawork(id: string) {
  const res = await fetch(`${API_BASE}/api/extraworks/${id}`);
  if (!res.ok) throw new Error('Error al obtener extrawork');
  return res.json();
}

export async function crearExtrawork(data: {
  title: string;
  description: string;
  status?: string;
  priority?: string;
  startDate?: string;
  endDate?: string;
}) {
  const res = await fetch(`${API_BASE}/api/extraworks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Error al crear extrawork');
  }
  return res.json();
}

export async function actualizarExtrawork(
  id: string,
  data: { title?: string; description?: string; status?: string; priority?: string; startDate?: string; endDate?: string }
) {
  const res = await fetch(`${API_BASE}/api/extraworks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al actualizar extrawork');
  return res.json();
}

export async function cambiarEstadoExtrawork(id: string, status: string) {
  const res = await fetch(`${API_BASE}/api/extraworks/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Error al cambiar estado');
  return res.json();
}

export async function eliminarExtrawork(id: string) {
  const res = await fetch(`${API_BASE}/api/extraworks/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Error al eliminar extrawork');
  return res.json();
}