import { useState } from 'react'
import './App.css'
import { SearchBar } from './components/SearchBar'
import { ExtraWorkList } from './components/ExtraWorkList'

function App() {
  const [activeTab, setActiveTab] = useState<'search' | 'manage'>('search')

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <header style={{
        backgroundColor: '#282c34',
        padding: '20px',
        color: 'white',
        textAlign: 'center'
      }}>
        <h1 style={{ margin: 0 }}>ExtraWorks - NLP Action Search</h1>
        <p style={{ margin: '10px 0 0 0', opacity: 0.8 }}>
          Modular Web Application with Natural Language Processing
        </p>
      </header>

      <nav style={{
        backgroundColor: '#fff',
        padding: '15px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'center',
        gap: '20px'
      }}>
        <button
          onClick={() => setActiveTab('search')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'search' ? '#007bff' : '#fff',
            color: activeTab === 'search' ? '#fff' : '#007bff',
            border: '2px solid #007bff',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          NLP Search
        </button>
        <button
          onClick={() => setActiveTab('manage')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'manage' ? '#007bff' : '#fff',
            color: activeTab === 'manage' ? '#fff' : '#007bff',
            border: '2px solid #007bff',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Manage ExtraWorks
        </button>
      </nav>

      <main>
        {activeTab === 'search' ? <SearchBar /> : <ExtraWorkList />}
      </main>

      <footer style={{
        backgroundColor: '#282c34',
        padding: '20px',
        color: 'white',
        textAlign: 'center',
        marginTop: '40px'
      }}>
        <p style={{ margin: 0, opacity: 0.7 }}>
          Powered by Node.js, Express, Prisma, React, and Vite
        </p>
      </footer>
    </div>
  )
}

export default App
