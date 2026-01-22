import { useState, useEffect } from 'react';
import { Briefcase, Plus, Edit2, Trash2, X, Clock, CheckCircle2, AlertCircle, Users, Link2 } from 'lucide-react';
import { apiService } from '../services/api';
import { useLanguage } from '../i18n/LanguageContext';
import type { ExtraWork, Resource } from '../types';

export default function Extraworks() {
  const { t } = useLanguage();
  const [extraworks, setExtraworks] = useState<ExtraWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [editingExtrawork, setEditingExtrawork] = useState<ExtraWork | null>(null);
  const [highlightedExtraWorkId, setHighlightedExtraWorkId] = useState<string | null>(null);
  const [availableResources, setAvailableResources] = useState<Resource[]>([]);
  const [selectedResourceIds, setSelectedResourceIds] = useState<string[]>([]);
  const [notification, setNotification] = useState<{message: string; type: 'success' | 'error'} | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
  });

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    loadExtraworks();
    loadAvailableResources();

    // Listen for KBar create event with optional pre-filled data
    const handleOpenCreate = (event: Event) => {
      const customEvent = event as CustomEvent<{ title?: string }>;
      console.log('[Extraworks] Received openCreateExtraWork event:', customEvent.detail);
      const prefilledTitle = customEvent.detail?.title || '';
      console.log('[Extraworks] Pre-filled title:', prefilledTitle);

      setEditingExtrawork(null);
      setFormData({
        title: prefilledTitle,
        description: '',
        status: 'pending',
        priority: 'medium',
      });
      setSelectedResourceIds([]);
      setFormStep(1);
      setShowModal(true);
    };

    // Listen for highlight ExtraWork event from KBar
    const handleHighlightExtraWork = (event: Event) => {
      const customEvent = event as CustomEvent<{ extraWorkId?: string; extraWorkTitle?: string }>;
      const extraWorkId = customEvent.detail?.extraWorkId;
      if (extraWorkId) {
        setHighlightedExtraWorkId(extraWorkId);
        showNotification(`ExtraWork "${customEvent.detail?.extraWorkTitle}" seleccionado`, 'success');
        // Clear highlight after 3 seconds
        setTimeout(() => setHighlightedExtraWorkId(null), 3000);
        // Scroll to the highlighted extrawork
        setTimeout(() => {
          const element = document.getElementById(`extrawork-${extraWorkId}`);
          element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    };

    window.addEventListener('openCreateExtraWork', handleOpenCreate);
    window.addEventListener('highlightExtraWork', handleHighlightExtraWork);
    return () => {
      window.removeEventListener('openCreateExtraWork', handleOpenCreate);
      window.removeEventListener('highlightExtraWork', handleHighlightExtraWork);
    };
  }, []);

  const loadExtraworks = async () => {
    try {
      setLoading(true);
      const data = await apiService.getExtraWorks();
      setExtraworks(data);
    } catch (error) {
      console.error('Error cargando extraworks:', error);
      showNotification('Error al cargar extraworks', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableResources = async () => {
    try {
      const data = await apiService.getResources();
      setAvailableResources(data);
    } catch (error) {
      console.error('Error cargando recursos:', error);
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

        // Asignar/desasignar recursos
        if (selectedResourceIds.length > 0) {
          for (const resourceId of selectedResourceIds) {
            await apiService.executeActionByIntent('assign_resource_to_extrawork', {
              resourceId,
              extraworkId: editingExtrawork.id,
            });
          }
        }
      } else {
        // Crear nuevo extrawork
        const newExtrawork = await apiService.executeActionByIntent('create_extrawork', formData);
        
        // Asignar recursos si se seleccionaron
        if (selectedResourceIds.length > 0 && (newExtrawork as any)?.id) {
          for (const resourceId of selectedResourceIds) {
            await apiService.executeActionByIntent('assign_resource_to_extrawork', {
              resourceId,
              extraworkId: (newExtrawork as any).id,
            });
          }
        }
      }
      
      setShowModal(false);
      setFormData({ title: '', description: '', status: 'pending', priority: 'medium' });
      setSelectedResourceIds([]);
      setEditingExtrawork(null);
      setFormStep(1);
      
      // Recargar datos desde el servidor para asegurar consistencia
      await loadExtraworks();
      showNotification(editingExtrawork ? 'ExtraWork actualizado correctamente' : 'ExtraWork creado correctamente', 'success');
    } catch (error: any) {
      console.error('Error guardando extrawork:', error);
      showNotification(error.message || 'Error al guardar extrawork', 'error');
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
    // Pre-seleccionar recursos asociados
    const associatedIds = (extrawork.resources || []).map(r => r.id);
    setSelectedResourceIds(associatedIds);
    setFormStep(1);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este extrawork?')) return;

    try {
      await apiService.executeActionByIntent('delete_extrawork', { id });
      loadExtraworks();
      showNotification('ExtraWork eliminado correctamente', 'success');
    } catch (error: any) {
      console.error('Error eliminando extrawork:', error);
      showNotification(error.message || 'Error al eliminar extrawork', 'error');
    }
  };

  const handleNewExtrawork = () => {
    setEditingExtrawork(null);
    setFormData({ title: '', description: '', status: 'pending', priority: 'medium' });
    setSelectedResourceIds([]);
    setFormStep(1);
    setShowModal(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: {
        label: t('completed'),
        color: 'bg-green-100 text-green-800',
        icon: <CheckCircle2 className="w-4 h-4" />,
      },
      in_progress: {
        label: t('inProgress'),
        color: 'bg-blue-100 text-blue-800',
        icon: <Clock className="w-4 h-4" />,
      },
      pending: {
        label: t('pending'),
        color: 'bg-yellow-100 text-yellow-800',
        icon: <AlertCircle className="w-4 h-4" />,
      },
      cancelled: {
        label: t('cancelled'),
        color: 'bg-red-100 text-red-800',
        icon: <X className="w-4 h-4" />,
      },
      on_hold: {
        label: t('onHold'),
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
      high: { label: t('high'), class: 'bg-red-100 text-red-800' },
      medium: { label: t('medium'), class: 'bg-yellow-100 text-yellow-800' },
      low: { label: t('low'), class: 'bg-green-100 text-green-800' },
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
          <h1 className="text-3xl font-bold text-gray-900">{t('extraworks')}</h1>
          <p className="text-gray-600 mt-1">{t('manageExtraworks')}</p>
        </div>
        <button
          onClick={handleNewExtrawork}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          {t('newExtrawork')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard
          icon={<Briefcase className="w-5 h-5" />}
          label={t('totalExtraworks')}
          value={extraworks.length.toString()}
          bgColor="bg-blue-50"
          textColor="text-blue-600"
        />
        <SummaryCard
          icon={<Clock className="w-5 h-5" />}
          label={t('inProgress')}
          value={inProgressCount.toString()}
          bgColor="bg-purple-50"
          textColor="text-purple-600"
        />
        <SummaryCard
          icon={<AlertCircle className="w-5 h-5" />}
          label={t('pending')}
          value={pendingCount.toString()}
          bgColor="bg-yellow-50"
          textColor="text-yellow-600"
        />
        <SummaryCard
          icon={<CheckCircle2 className="w-5 h-5" />}
          label={t('completedExtraworks')}
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
                    {t('title')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('description')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('priority')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('resources')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('actionsColumn')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {extraworks.map((extrawork) => (
                  <tr
                    key={extrawork.id}
                    id={`extrawork-${extrawork.id}`}
                    className={`transition-colors ${
                      highlightedExtraWorkId === extrawork.id
                        ? 'bg-blue-100 ring-2 ring-blue-500'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs font-mono text-gray-500">{extrawork.id ? extrawork.id.slice(0, 8) + '...' : 'N/A'}</div>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full my-8">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingExtrawork ? t('editResource') : t('newExtrawork')} {formStep === 2 && `- ${t('assignToExtrawork')}`}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingExtrawork(null);
                  setFormData({ title: '', description: '', status: 'pending', priority: 'medium' });
                  setFormStep(1);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={formStep === 1 ? (e) => {
              e.preventDefault();
              if (!formData.title.trim() || !formData.description.trim()) {
                showNotification('Por favor completa todos los campos', 'error');
                return;
              }
              setFormStep(2);
            } : handleSubmit} className="p-6 space-y-4">
              
              {/* PASO 1: Información básica */}
              {formStep === 1 && (
                <>
                  {/* Información del ExtraWork */}
                  {editingExtrawork && (
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500">ID del ExtraWork</p>
                          <p className="text-sm font-mono text-gray-900">{editingExtrawork.id}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Fecha de Creación</p>
                          <p className="text-sm text-gray-900">
                            {new Date(editingExtrawork.createdAt).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('title')} *
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
                      {t('description')} *
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
                        {t('status')}
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="pending">{t('pending')}</option>
                        <option value="in_progress">{t('inProgress')}</option>
                        <option value="completed">{t('completed')}</option>
                        <option value="on_hold">{t('onHold')}</option>
                        <option value="cancelled">{t('cancelled')}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('priority')}
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="low">{t('low')}</option>
                        <option value="medium">{t('medium')}</option>
                        <option value="high">{t('high')}</option>
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
                        setFormStep(1);
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {t('cancel')}
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {t('save')}
                    </button>
                  </div>
                </>
              )}

              {/* PASO 2: Asignación de recursos */}
              {formStep === 2 && (
                <>
                  {/* Recursos Asociados - Selector */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <Link2 className="w-4 h-4" />
                      Asignar Recursos
                    </h3>
                    
                    {availableResources.length === 0 ? (
                      <div className="text-center py-4 bg-gray-50 rounded-lg">
                        <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">No hay recursos disponibles</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
                        {availableResources.map((resource) => (
                          <label
                            key={resource.id}
                            className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={selectedResourceIds.includes(resource.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedResourceIds([...selectedResourceIds, resource.id]);
                                } else {
                                  setSelectedResourceIds(selectedResourceIds.filter(id => id !== resource.id));
                                }
                              }}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{resource.name}</p>
                              <p className="text-xs text-gray-500">{resource.type}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              resource.availability === 'available' ? 'bg-green-100 text-green-800' :
                              resource.availability === 'busy' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {resource.availability === 'available' ? 'Disponible' :
                               resource.availability === 'busy' ? 'Ocupado' : 'No disponible'}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                    
                    {selectedResourceIds.length > 0 && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-900">
                          <strong>{selectedResourceIds.length}</strong> recurso(s) seleccionado(s)
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedResourceIds.map(id => {
                            const resource = availableResources.find(r => r.id === id);
                            return resource ? (
                              <span key={id} className="inline-flex items-center gap-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                {resource.name}
                                <button
                                  type="button"
                                  onClick={() => setSelectedResourceIds(selectedResourceIds.filter(rid => rid !== id))}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  ×
                                </button>
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Recursos Asociados - Vista de recursos actuales */}
                  {editingExtrawork && editingExtrawork.resources && editingExtrawork.resources.length > 0 && (
                    <div className="border-t pt-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Recursos Actuales ({editingExtrawork.resources.length})
                      </h3>
                      <div className="space-y-2">
                        {editingExtrawork.resources.map((resource) => (
                          <div
                            key={resource.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                <Users className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{resource.name}</p>
                                <p className="text-xs text-gray-500">{resource.type}</p>
                              </div>
                            </div>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              resource.availability === 'available' ? 'bg-green-100 text-green-800' :
                              resource.availability === 'busy' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {resource.availability === 'available' ? 'Disponible' :
                               resource.availability === 'busy' ? 'Ocupado' : 'No disponible'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setFormStep(1)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Atrás
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {editingExtrawork ? 'Actualizar' : 'Crear'}
                    </button>
                  </div>
                </>
              )}
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
