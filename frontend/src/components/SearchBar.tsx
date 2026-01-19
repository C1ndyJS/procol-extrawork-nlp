import React, { useState } from 'react';
import { apiService } from '../services/api';
import { Action } from '../types';

export const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setMessage('');
    const response = await apiService.searchActions(query);
    setLoading(false);

    if (response.success && response.data) {
      setActions(response.data);
      if (response.data.length === 0) {
        setMessage('No matching actions found');
      }
    } else {
      setMessage(response.error || 'Search failed');
    }
  };

  const handleExecute = async (action: Action) => {
    setLoading(true);
    setMessage('');
    
    // For demo purposes, we'll execute with empty params
    const response = await apiService.executeActionByIntent(action.intent, {});
    setLoading(false);

    if (response.success) {
      setMessage(response.message || 'Action executed successfully');
      // Clear after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMessage(response.error || 'Execution failed');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Natural Language Action Search</h2>
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Type your action query (e.g., 'create new extrawork', 'search tasks')"
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            borderRadius: '4px',
            border: '1px solid #ccc'
          }}
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          style={{
            marginTop: '10px',
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Searching...' : 'Search Actions'}
        </button>
      </div>

      {message && (
        <div
          style={{
            padding: '12px',
            marginBottom: '20px',
            borderRadius: '4px',
            backgroundColor: message.includes('failed') || message.includes('No matching') ? '#f8d7da' : '#d4edda',
            color: message.includes('failed') || message.includes('No matching') ? '#721c24' : '#155724',
            border: `1px solid ${message.includes('failed') || message.includes('No matching') ? '#f5c6cb' : '#c3e6cb'}`
          }}
        >
          {message}
        </div>
      )}

      {actions.length > 0 && (
        <div>
          <h3>Matching Actions:</h3>
          {actions.map((action, index) => (
            <div
              key={index}
              style={{
                padding: '16px',
                marginBottom: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: '#f9f9f9'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 8px 0' }}>{action.intent}</h4>
                  <p style={{ margin: '0 0 8px 0', color: '#666' }}>{action.description}</p>
                  <p style={{ margin: 0, fontSize: '14px', color: '#888' }}>
                    Confidence: {(action.score * 100).toFixed(0)}%
                  </p>
                </div>
                <button
                  onClick={() => handleExecute(action)}
                  disabled={loading}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    marginLeft: '12px'
                  }}
                >
                  Execute
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
