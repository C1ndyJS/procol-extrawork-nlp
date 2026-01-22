import { useState } from 'react';
import KBarProvider from './components/KBarProvider';
import Header from './components/Header';
import Recursos from './components/Recursos';
import Extraworks from './components/Extraworks';
import HomePage from './components/HomePage';
import { ViewType } from './types';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('home');

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomePage onNavigate={setCurrentView} />;
      case 'recursos':
        return (
          <>
            <Header currentView={currentView} onNavigate={setCurrentView} />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Recursos onNavigate={setCurrentView} />
            </main>
          </>
        );
      case 'extraworks':
        return (
          <>
            <Header currentView={currentView} onNavigate={setCurrentView} />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Extraworks />
            </main>
          </>
        );
      default:
        return <HomePage onNavigate={setCurrentView} />;
    }
  };

  return (
    <KBarProvider onNavigate={setCurrentView}>
      <div className="min-h-screen bg-gray-50">
        {renderView()}
      </div>
    </KBarProvider>
  );
}

export default App;
