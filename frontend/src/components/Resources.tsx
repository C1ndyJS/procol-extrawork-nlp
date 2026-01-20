import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { obtenerRecursos, crearRecurso, actualizarRecurso, eliminarRecurso } from '../api';
import { Resource } from '../types';

export default function Resources() {
  const [recursos, setRecursos] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'Documento',
    url: '',
    extraWorkId: '1', // Cambiar según necesidad
  });

  // Cargar recursos al montar
  useEffect(() => {
    cargarRecursos();
  }, []);

  const cargarRecursos = async () => {
    setLoading(true);
    try {
      const res = await obtenerRecursos();
      setRecursos(res.data || []);
    } catch (err) {
      alert('Error al cargar recursos');
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        const res = await actualizarRecurso(editingId, {
          name: formData.name,
          type: formData.type,
          url: formData.url || undefined,
        });
        setRecursos(recursos.map(r => r.id === editingId ? res.data : r));
        setEditingId(null);
      } else {
        const res = await crearRecurso({
          name: formData.name,
          type: formData.type,
          url: formData.url || undefined,
          extraWorkId: formData.extraWorkId,
        });
        setRecursos([...recursos, res.data]);
      }
      setFormData({ name: '', type: 'Documento', url: '', extraWorkId: '1' });
      setShowForm(false);
    } catch (err: any) {
      alert(err.message || 'Error al guardar recurso');
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este recurso?')) return;
    try {
      await eliminarRecurso(id);
      setRecursos(recursos.filter(r => r.id !== id));
    } catch (err) {
      alert('Error al eliminar recurso');
    }
  };

  const handleEdit = (recurso: Resource) => {
    setFormData({
      name: recurso.name,
      type: recurso.type,
      url: recurso.url || '',
      extraWorkId: recurso.extraWorkId,
    });
    setEditingId(recurso.id);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Recursos</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({ name: '', type: 'Documento', url: '', extraWorkId: '1' });
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" /> Nuevo Recurso
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tipo</label>
              <select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>Documento</option>
                <option>Imagen</option>
                <option>Video</option>
                <option>Link</option>
                <option>Archivo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">URL (opcional)</label>
              <input
                type="url"
                value={formData.url}
                onChange={e => setFormData({ ...formData, url: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {editingId ? 'Actualizar' : 'Crear'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
              className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p>Cargando...</p>
        ) : recursos.length === 0 ? (
          <p className="text-gray-500">No hay recursos</p>
        ) : (
          recursos.map(recurso => (
            <div key={recurso.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition">
              <h3 className="font-bold text-lg mb-2">{recurso.name}</h3>
              <p className="text-sm text-gray-600 mb-3">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{recurso.type}</span>
              </p>
              {recurso.url && (
                <p className="text-sm text-blue-600 truncate mb-3">
                  <a href={recurso.url} target="_blank" rel="noopener noreferrer">{recurso.url}</a>
                </p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(recurso)}
                  className="flex-1 bg-blue-500 text-white px-2 py-1 rounded text-sm flex items-center justify-center gap-1 hover:bg-blue-600"
                >
                  <Edit2 className="w-4 h-4" /> Editar
                </button>
                <button
                  onClick={() => handleDelete(recurso.id)}
                  className="flex-1 bg-red-500 text-white px-2 py-1 rounded text-sm flex items-center justify-center gap-1 hover:bg-red-600"
                >
                  <Trash2 className="w-4 h-4" /> Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}