import { useState } from 'react';
import AppShell, { AppView } from './components/layout/AppShell';
import DashboardView from './components/dashboard/DashboardView';
import CollectionsView from './components/collections/CollectionsView';
import SettingsView from './components/settings/SettingsView';
import HelpView from './components/help/HelpView';

const App = () => {
  const [currentView, setCurrentView] = useState<AppView>('dashboard');

  return (
    <AppShell currentView={currentView} onViewChange={setCurrentView}>
      {currentView === 'dashboard' && <DashboardView />}
      {currentView === 'collections' && <CollectionsView />}
      {currentView === 'settings' && <SettingsView />}
      {currentView === 'help' && <HelpView />}
    </AppShell>
  );
};

export default App;
