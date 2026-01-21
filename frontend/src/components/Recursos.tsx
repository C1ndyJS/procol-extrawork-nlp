import { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, X, Briefcase } from 'lucide-react';
import { apiService } from '../services/api';
import type { Resource } from '../types';

export default function Recursos() {
  const [recursos, setRecursos] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [notification, setNotification] = useState<{message: string; type: 'success' | 'error'} | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    availability: 'available',
  });

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    loadRecursos();

    // Listen for KBar create event with optional pre-filled data
    const handleOpenCreate = (event: Event) => {
      const customEvent = event as CustomEvent<{ name?: string; type?: string }>;
      const prefilledName = customEvent.detail?.name || '';
      const prefilledType = customEvent.detail?.type || '';

      setEditingResource(null);
      setFormData({
        name: prefilledName,
        type: prefilledType,
        availability: 'available',
      });
      setShowModal(true);
    };

    window.addEventListener('openCreateResource', handleOpenCreate);
    return () => window.removeEventListener('openCreateResource', handleOpenCreate);
  }, []);

  const loadRecursos = async () => {
    try {
      setLoading(true);
      const data = await apiService.getResources();
      setRecursos(data);
    } catch (error) {
      console.error('Error cargando recursos:', error);
      showNotification('Error al cargar recursos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.type.trim()) {
      showNotification('Por favor completa todos los campos', 'error');
      return;
    }

    try {
      if (editingResource) {
        // Editar recurso existente
        await apiService.executeActionByIntent('update_resource', {
          id: editingResource.id,
          ...formData,
        });
      } else {
        // Crear nuevo recurso
        await apiService.executeActionByIntent('create_resource', formData);
      }
      
      setShowModal(false);
      setFormData({ name: '', type: '', availability: 'available' });
      setEditingResource(null);
      loadRecursos();
      showNotification(editingResource ? 'Recurso actualizado correctamente' : 'Recurso creado correctamente', 'success');
    } catch (error: any) {
      console.error('Error guardando recurso:', error);
      showNotification(error.message || 'Error al guardar recurso', 'error');
    }
  };

  const handleEdit = (resource: Resource) => {
    setEditingResource(resource);
    setFormData({
      name: resource.name,
      type: resource.type,
      availability: resource.availability,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este recurso?')) return;

    try {
      await apiService.executeActionByIntent('delete_resource', { id });
      loadRecursos();
      showNotification('Recurso eliminado correctamente', 'success');
    } catch (error: any) {
      console.error('Error eliminando recurso:', error);
      showNotification(error.message || 'Error al eliminar recurso', 'error');
    }
  };

  const handleNewResource = () => {
    setEditingResource(null);
    setFormData({ name: '', type: '', availability: 'available' });
    setShowModal(true);
  };

  const getAvailabilityBadge = (availability: string) => {
    const badges = {
      available: { label: 'Disponible', class: 'bg-green-100 text-green-800' },
      busy: { label: 'Ocupado', class: 'bg-yellow-100 text-yellow-800' },
      unavailable: { label: 'No disponible', class: 'bg-red-100 text-red-800' },
    };
    const badge = badges[availability as keyof typeof badges] || badges.available;
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recursos</h1>
          <p className="text-gray-600 mt-1">Gestión de recursos y personal</p>
        </div>
        <button
          onClick={handleNewResource}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Recurso
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          icon={<Users className="w-5 h-5" />}
          label="Total Recursos"
          value={recursos.length.toString()}
          bgColor="bg-blue-50"
          textColor="text-blue-600"
        />
        <SummaryCard
          icon={<Users className="w-5 h-5" />}
          label="Disponibles"
          value={recursos.filter(r => r.availability === 'available').length.toString()}
          bgColor="bg-green-50"
          textColor="text-green-600"
        />
        <SummaryCard
          icon={<Briefcase className="w-5 h-5" />}
          label="Asignados"
          value={recursos.filter(r => r.extraWorkId).length.toString()}
          bgColor="bg-purple-50"
          textColor="text-purple-600"
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {recursos.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No hay recursos disponibles</p>
            <button
              onClick={handleNewResource}
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
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Disponibilidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asignado a
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recursos.map((resource) => (
                  <tr key={resource.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs font-mono text-gray-500">{resource.id.slice(0, 8)}...</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{resource.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{resource.type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getAvailabilityBadge(resource.availability)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {resource.extraWorkId ? (
                          <span className="text-blue-600">Asignado</span>
                        ) : (
                          <span className="text-gray-400">Sin asignar</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(resource)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(resource.id)}
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
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingResource ? 'Editar Recurso' : 'Nuevo Recurso'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingResource(null);
                  setFormData({ name: '', type: '', availability: 'available' });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Juan Pérez"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo *
                </label>
                <input
                  type="text"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Carpintero, Electricista, Plomero"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Disponibilidad
                </label>
                <select
                  value={formData.availability}
                  onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="available">Disponible</option>
                  <option value="busy">Ocupado</option>
                  <option value="unavailable">No disponible</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingResource(null);
                    setFormData({ name: '', type: '', availability: 'available' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingResource ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Notificación Toast */}
      {notification && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-in">
          <div className={`rounded-lg shadow-lg px-6 py-4 flex items-center gap-3 ${
            notification.type === 'success' 
              ? 'bg-green-600 text-white' 
              : 'bg-red-600 text-white'
          }`}>
            {notification.type === 'success' ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <p className="font-medium">{notification.message}</p>
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
