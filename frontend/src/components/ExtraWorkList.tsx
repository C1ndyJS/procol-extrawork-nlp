import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

type ExtraWork = {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  resources?: any[];
};

export const ExtraWorkList: React.FC = () => {
  const [extraWorks, setExtraWorks] = useState<ExtraWork[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium'
  });

  useEffect(() => {
    fetchExtraWorks();
  }, []);

  const fetchExtraWorks = async () => {
    setLoading(true);
    const response = await apiService.getExtraWorks();
    setLoading(false);

    if (response.success && response.data) {
      setExtraWorks(response.data);
    } else {
      setError(response.error || 'Failed to fetch ExtraWorks');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const response = await apiService.createExtraWork(formData);
    setLoading(false);

    if (response.success) {
      setShowForm(false);
      setFormData({ title: '', description: '', status: 'pending', priority: 'medium' });
      fetchExtraWorks();
    } else {
      setError(response.error || 'Failed to create ExtraWork');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ExtraWork?')) return;

    setLoading(true);
    const response = await apiService.deleteExtraWork(id);
    setLoading(false);

    if (response.success) {
      fetchExtraWorks();
    } else {
      setError(response.error || 'Failed to delete ExtraWork');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>ExtraWorks</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {showForm ? 'Cancel' : 'New ExtraWork'}
        </button>
      </div>

      {error && (
        <div style={{
          padding: '12px',
          marginBottom: '20px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '4px'
        }}>
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} style={{
          padding: '20px',
          marginBottom: '20px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          backgroundColor: '#f9f9f9'
        }}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Title:</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '8px',
                fontSize: '14px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Description:</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={4}
              style={{
                width: '100%',
                padding: '8px',
                fontSize: '14px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Status:</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px',
                  fontSize: '14px',
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Priority:</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px',
                  fontSize: '14px',
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            Create ExtraWork
          </button>
        </form>
      )}

      {loading && <p>Loading...</p>}

      <div>
        {extraWorks.map((work) => (
          <div
            key={work.id}
            style={{
              padding: '16px',
              marginBottom: '12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: '#fff'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 8px 0' }}>{work.title}</h3>
                <p style={{ margin: '0 0 8px 0', color: '#666' }}>{work.description}</p>
                <div style={{ display: 'flex', gap: '15px', fontSize: '14px' }}>
                  <span style={{
                    padding: '4px 8px',
                    backgroundColor: work.status === 'completed' ? '#d4edda' : work.status === 'in-progress' ? '#fff3cd' : '#f8d7da',
                    borderRadius: '4px'
                  }}>
                    {work.status}
                  </span>
                  <span style={{
                    padding: '4px 8px',
                    backgroundColor: work.priority === 'high' ? '#f8d7da' : work.priority === 'medium' ? '#fff3cd' : '#d4edda',
                    borderRadius: '4px'
                  }}>
                    {work.priority}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleDelete(work.id)}
                disabled={loading}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginLeft: '12px'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {extraWorks.length === 0 && !loading && (
          <p style={{ textAlign: 'center', color: '#666' }}>No ExtraWorks found. Create one to get started!</p>
        )}
      </div>
    </div>
  );
};
