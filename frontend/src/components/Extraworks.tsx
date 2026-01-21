import { useState, useEffect } from 'react';
import { Briefcase, Plus, Edit2, Trash2, X, Clock, CheckCircle2, AlertCircle, Users } from 'lucide-react';
import { apiService } from '../services/api';
import type { ExtraWork } from '../types';

export default function Extraworks() {
  const [extraworks, setExtraworks] = useState<ExtraWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExtrawork, setEditingExtrawork] = useState<ExtraWork | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
  });

  useEffect(() => {
    loadExtraworks();
  }, []);

  const loadExtraworks = async () => {
    try {
      setLoading(true);
      const data = await apiService.getExtraWorks();
      setExtraworks(data);
    } catch (error) {
      console.error('Error cargando extraworks:', error);
      alert('Error al cargar extraworks');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      alert('Por favor completa todos los campos');
      return;
    }

    try {
      if (editingExtrawork) {
        // Editar extrawork existente
        await apiService.executeActionByIntent('update_extrawork', {
          id: editingExtrawork.id,
          ...formData,
        });
      } else {
        // Crear nuevo extrawork
        await apiService.executeActionByIntent('create_extrawork', formData);
      }
      
      setShowModal(false);
      setFormData({ title: '', description: '', status: 'pending', priority: 'medium' });
      setEditingExtrawork(null);
      loadExtraworks();
      alert(editingExtrawork ? 'ExtraWork actualizado' : 'ExtraWork creado correctamente');
    } catch (error: any) {
      console.error('Error guardando extrawork:', error);
      alert(error.message || 'Error al guardar extrawork');
    }
  };

  const handleEdit = (extrawork: ExtraWork) => {
    setEditingExtrawork(extrawork);
    setFormData({
      title: extrawork.title,
      description: extrawork.description,
      status: extrawork.status,
      priority: extrawork.priority,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este extrawork?')) return;

    try {
      await apiService.executeActionByIntent('delete_extrawork', { id });
      loadExtraworks();
      alert('ExtraWork eliminado correctamente');
    } catch (error: any) {
      console.error('Error eliminando extrawork:', error);
      alert(error.message || 'Error al eliminar extrawork');
    }
  };

  const handleNewExtrawork = () => {
    setEditingExtrawork(null);
    setFormData({ title: '', description: '', status: 'pending', priority: 'medium' });
    setShowModal(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: {
        label: 'Completado',
        color: 'bg-green-100 text-green-800',
        icon: <CheckCircle2 className="w-4 h-4" />,
      },
      in_progress: {
        label: 'En Progreso',
        color: 'bg-blue-100 text-blue-800',
        icon: <Clock className="w-4 h-4" />,
      },
      pending: {
        label: 'Pendiente',
        color: 'bg-yellow-100 text-yellow-800',
        icon: <AlertCircle className="w-4 h-4" />,
      },
      cancelled: {
        label: 'Cancelado',
        color: 'bg-red-100 text-red-800',
        icon: <X className="w-4 h-4" />,
      },
      on_hold: {
        label: 'En Espera',
        color: 'bg-gray-100 text-gray-800',
        icon: <Clock className="w-4 h-4" />,
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.icon}
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const badges = {
      high: { label: 'Alta', class: 'bg-red-100 text-red-800' },
      medium: { label: 'Media', class: 'bg-yellow-100 text-yellow-800' },
      low: { label: 'Baja', class: 'bg-green-100 text-green-800' },
    };
    const badge = badges[priority as keyof typeof badges] || badges.medium;
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${badge.class}`}>
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const completedCount = extraworks.filter(ew => ew.status === 'completed').length;
  const inProgressCount = extraworks.filter(ew => ew.status === 'in_progress').length;
  const pendingCount = extraworks.filter(ew => ew.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Extraworks</h1>
          <p className="text-gray-600 mt-1">Gestión de trabajos adicionales</p>
        </div>
        <button
          onClick={handleNewExtrawork}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo ExtraWork
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard
          icon={<Briefcase className="w-5 h-5" />}
          label="Total"
          value={extraworks.length.toString()}
          bgColor="bg-blue-50"
          textColor="text-blue-600"
        />
        <SummaryCard
          icon={<Clock className="w-5 h-5" />}
          label="En Progreso"
          value={inProgressCount.toString()}
          bgColor="bg-purple-50"
          textColor="text-purple-600"
        />
        <SummaryCard
          icon={<AlertCircle className="w-5 h-5" />}
          label="Pendientes"
          value={pendingCount.toString()}
          bgColor="bg-yellow-50"
          textColor="text-yellow-600"
        />
        <SummaryCard
          icon={<CheckCircle2 className="w-5 h-5" />}
          label="Completados"
          value={completedCount.toString()}
          bgColor="bg-green-50"
          textColor="text-green-600"
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {extraworks.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No hay extraworks disponibles</p>
            <button
              onClick={handleNewExtrawork}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Crear el primero
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Título
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prioridad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recursos
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {extraworks.map((extrawork) => (
                  <tr key={extrawork.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs font-mono text-gray-500">{extrawork.id.slice(0, 8)}...</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{extrawork.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 max-w-xs truncate">
                        {extrawork.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(extrawork.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPriorityBadge(extrawork.priority)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        {extrawork.resources?.length || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(extrawork)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(extrawork.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal para crear/editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingExtrawork ? 'Editar ExtraWork' : 'Nuevo ExtraWork'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingExtrawork(null);
                  setFormData({ title: '', description: '', status: 'pending', priority: 'medium' });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Instalación de ventanas"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe el trabajo a realizar..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="pending">Pendiente</option>
                    <option value="in_progress">En Progreso</option>
                    <option value="completed">Completado</option>
                    <option value="on_hold">En Espera</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prioridad
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingExtrawork(null);
                    setFormData({ title: '', description: '', status: 'pending', priority: 'medium' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingExtrawork ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  bgColor,
  textColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  bgColor: string;
  textColor: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className={`inline-flex p-3 rounded-lg ${bgColor} ${textColor} mb-4`}>
        {icon}
      </div>
      <p className="text-sm font-medium text-gray-600">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}
