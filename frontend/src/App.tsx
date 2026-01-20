import { useState } from 'react';
import KBarProvider from './components/KBarProvider';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Extraworks from './components/Extraworks';
import { ViewType } from './types';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');

  return (
    <KBarProvider onNavigate={setCurrentView}>
      <div className="min-h-screen bg-gray-50">
        <Header currentView={currentView} onNavigate={setCurrentView} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {currentView === 'dashboard' ? <Dashboard /> : <Extraworks />}
        </main>
      </div>
    </KBarProvider>
  );
}

export default App;
