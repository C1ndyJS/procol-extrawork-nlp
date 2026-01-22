import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import {
  obtenerExtraworks,
  crearExtrawork,
  actualizarExtrawork,
  cambiarEstadoExtrawork,
  eliminarExtrawork,
} from '../api';
import { ExtraWork } from '../types';

export default function Extraworks() {
  const [extraworks, setExtraworks] = useState<ExtraWork[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
  });

  const statusOptions = ['pending', 'in_progress', 'completed', 'cancelled', 'on_hold'];
  const priorityOptions = ['low', 'medium', 'high', 'critical'];

  // Cargar extraworks al montar
  useEffect(() => {
    cargarExtraworks();
  }, []);

  const cargarExtraworks = async () => {
    setLoading(true);
    try {
      const res = await obtenerExtraworks();
      setExtraworks(res.data || []);
    } catch (err) {
      alert('Error al cargar extraworks');
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        const res = await actualizarExtrawork(editingId, {
          title: formData.title,
          description: formData.description,
          status: formData.status,
          priority: formData.priority,
        });
        setExtraworks(extraworks.map(e => e.id === editingId ? res.data : e));
        setEditingId(null);
      } else {
        const res = await crearExtrawork({
          title: formData.title,
          description: formData.description,
          status: formData.status,
          priority: formData.priority,
        });
        setExtraworks([...extraworks, res.data]);
      }
      setFormData({ title: '', description: '', status: 'pending', priority: 'medium' });
      setShowForm(false);
    } catch (err: any) {
      alert(err.message || 'Error al guardar extrawork');
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este extrawork?')) return;
    try {
      await eliminarExtrawork(id);
      setExtraworks(extraworks.filter(e => e.id !== id));
    } catch (err) {
      alert('Error al eliminar extrawork');
    }
  };

  const handleEdit = (extrawork: ExtraWork) => {
    setFormData({
      title: extrawork.title || '',
      description: extrawork.description || '',
      status: extrawork.status || 'pending',
      priority: extrawork.priority || 'medium',
    });
    setEditingId(extrawork.id);
    setShowForm(true);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await cambiarEstadoExtrawork(id, newStatus);
      setExtraworks(extraworks.map(e => e.id === id ? res.data : e));
    } catch (err) {
      alert('Error al cambiar estado');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'cancelled':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Extraworks</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({ title: '', description: '', status: 'pending', priority: 'medium' });
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" /> Nuevo Extrawork
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Título</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Estado</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statusOptions.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Prioridad</label>
              <select
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {priorityOptions.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
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
        ) : extraworks.length === 0 ? (
          <p className="text-gray-500">No hay extraworks</p>
        ) : (
          extraworks.map(extrawork => (
            <div key={extrawork.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg">{extrawork.title}</h3>
                </div>
                {getStatusIcon(extrawork.status || 'pending')}
              </div>

              <div className="mb-3 flex gap-2">
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusBadgeColor(extrawork.status || 'pending')}`}>
                  {extrawork.status}
                </span>
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getPriorityColor(extrawork.priority || 'medium')}`}>
                  {extrawork.priority}
                </span>
              </div>

              {extrawork.description && (
                <p className="text-sm text-gray-700 mb-3 line-clamp-2">{extrawork.description}</p>
              )}

              <div className="mb-3">
                <label className="text-xs font-medium text-gray-600">Cambiar estado:</label>
                <select
                  value={extrawork.status}
                  onChange={e => handleStatusChange(extrawork.id, e.target.value)}
                  className="w-full text-xs border rounded mt-1 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {statusOptions.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(extrawork)}
                  className="flex-1 bg-blue-500 text-white px-2 py-1 rounded text-sm flex items-center justify-center gap-1 hover:bg-blue-600"
                >
                  <Edit2 className="w-4 h-4" /> Editar
                </button>
                <button
                  onClick={() => handleDelete(extrawork.id)}
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