import { useState } from 'react';
import KBarProvider from './components/KBarProvider';
import Header from './components/Header';
import Resources from './components/Resources';
import Extraworks from './components/Extraworks';
import Profile from './components/Profile';
import { ViewType } from './types';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('resources');

  return (
    <KBarProvider onNavigate={setCurrentView}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <Header currentView={currentView} onNavigate={setCurrentView} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {currentView === 'resources' && <Resources />}
          {currentView === 'extraworks' && <Extraworks />}
          {currentView === 'profile' && <Profile />}
        </main>
      </div>
    </KBarProvider>
  );
}

export default App;
