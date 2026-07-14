import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import CollectionsView from './components/collections/CollectionsView';
import DashboardView from './components/dashboard/DashboardView';
import HelpView from './components/help/HelpView';
import ProjectWorkspace from './components/projects/ProjectWorkspace';
import CollectionDataView from './components/projects/CollectionDataView';
import SettingsView from './components/settings/SettingsView';

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="collections/:projectId/data" element={<CollectionDataView />} />
      <Route element={<AppShell />}>
        <Route index element={<DashboardView />} />
        <Route path="collections" element={<CollectionsView />} />
        <Route path="collections/:projectId" element={<ProjectWorkspace />} />
        <Route path="settings" element={<SettingsView />} />
        <Route path="help" element={<HelpView />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

export default App;
