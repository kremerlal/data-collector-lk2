import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import DashboardIcon from '@mui/icons-material/Dashboard';
import StorageIcon from '@mui/icons-material/Storage';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PersonIcon from '@mui/icons-material/Person';
import ApiIcon from '@mui/icons-material/Api';
import DhsSiteHeader from '../brand/DhsSiteHeader';
import { useContentTheme } from '../../hooks/useContentTheme';
import './AppShell.css';

export type AppView = 'dashboard' | 'collections' | 'settings' | 'help';

interface NavItem {
  view: AppView;
  label: string;
  icon: ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { view: 'dashboard', label: 'Dashboard', icon: <DashboardIcon fontSize="small" /> },
  { view: 'collections', label: 'Collections', icon: <StorageIcon fontSize="small" /> },
  { view: 'settings', label: 'Settings', icon: <SettingsIcon fontSize="small" /> },
  { view: 'help', label: 'Help', icon: <HelpOutlineIcon fontSize="small" /> },
];

const VIEW_TITLES: Record<AppView, string> = {
  dashboard: 'Data Collector',
  collections: 'Collections',
  settings: 'Settings',
  help: 'Help',
};

const VIEW_TAGLINES: Record<AppView, string> = {
  dashboard: 'Ingest, validate, and manage enterprise data collections',
  collections: 'Browse and manage data collection pipelines',
  settings: 'Databricks workspace and connection configuration',
  help: 'How to use the Data Collector application',
};

interface AppShellProps {
  children: ReactNode;
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  displayName?: string;
}

export default function AppShell({
  children,
  currentView,
  onViewChange,
  displayName = 'Not signed in',
}: AppShellProps) {
  const { isContentDark, toggleContentTheme } = useContentTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [currentView]);

  const toolbarActions = useMemo(() => {
    if (currentView === 'dashboard') {
      return (
        <>
          <Button
            variant="outlined"
            size="small"
            startIcon={<HelpOutlineIcon />}
            onClick={() => onViewChange('help')}
          >
            Help
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<SettingsIcon />}
            onClick={() => onViewChange('settings')}
          >
            Settings
          </Button>
        </>
      );
    }
    if (currentView === 'help' || currentView === 'settings') {
      return (
        <Button
          variant="contained"
          size="small"
          startIcon={<DashboardIcon />}
          onClick={() => onViewChange('dashboard')}
        >
          Dashboard
        </Button>
      );
    }
    return (
      <>
        <Button
          variant="outlined"
          size="small"
          startIcon={<ApiIcon />}
          href="/docs"
          target="_blank"
          rel="noopener noreferrer"
        >
          API Docs
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<HelpOutlineIcon />}
          onClick={() => onViewChange('help')}
        >
          Help
        </Button>
      </>
    );
  }, [currentView, onViewChange]);

  return (
    <div className="app-root">
      <div className="app-layout">
        <IconButton
          className="mobile-menu-btn"
          aria-label="Open menu"
          onClick={() => setSidebarOpen(true)}
        >
          <MenuIcon />
        </IconButton>

        {sidebarOpen && (
          <div
            className="sidebar-backdrop"
            aria-hidden="true"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <nav
          className={[
            'sidebar',
            sidebarCollapsed ? 'collapsed' : '',
            sidebarOpen ? 'mobile-open' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <div className="sidebar-header">
            <button
              type="button"
              className="brand"
              title="Data Collector home"
              onClick={() => {
                onViewChange('dashboard');
                setSidebarOpen(false);
              }}
            >
              {sidebarCollapsed ? (
                <img
                  src="/images/dhs-logo.svg"
                  alt="U.S. Department of Homeland Security"
                  className="brand-seal"
                  width={40}
                  height={40}
                />
              ) : (
                <img
                  src="/images/dhs-wordmark.svg"
                  alt="U.S. Department of Homeland Security"
                  className="brand-wordmark"
                />
              )}
            </button>
            <div className="sidebar-header-actions">
              <IconButton
                className="sidebar-icon-btn collapse-btn"
                size="small"
                aria-label={sidebarCollapsed ? 'Expand menu' : 'Collapse menu'}
                onClick={() => setSidebarCollapsed((v) => !v)}
              >
                {sidebarCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
              </IconButton>
              <IconButton
                className="sidebar-icon-btn close-mobile-btn"
                size="small"
                aria-label="Close menu"
                onClick={() => setSidebarOpen(false)}
              >
                <CloseIcon />
              </IconButton>
            </div>
          </div>

          {!sidebarCollapsed && <p className="sidebar-app-label">Data Collector</p>}

          <div className="nav-links">
            {NAV_ITEMS.map(({ view, label, icon }) => (
              <button
                key={view}
                type="button"
                className={['nav-link', currentView === view ? 'active' : ''].filter(Boolean).join(' ')}
                title={label}
                onClick={() => {
                  onViewChange(view);
                  setSidebarOpen(false);
                }}
              >
                {icon}
                {!sidebarCollapsed && <span>{label}</span>}
              </button>
            ))}
          </div>

          <div className="sidebar-footer">
            <button
              type="button"
              className="theme-toggle"
              title={isContentDark ? 'Switch to light content area' : 'Switch to dark content area'}
              aria-pressed={isContentDark}
              onClick={toggleContentTheme}
            >
              {isContentDark ? <Brightness7Icon fontSize="small" /> : <Brightness4Icon fontSize="small" />}
              {!sidebarCollapsed && <span>{isContentDark ? 'Light mode' : 'Dark mode'}</span>}
            </button>
            {!sidebarCollapsed && (
              <a
                href="https://www.dhs.gov/"
                target="_blank"
                rel="noopener noreferrer"
                className="dhs-footer-link"
              >
                DHS.gov
                <OpenInNewIcon sx={{ fontSize: '0.65rem' }} />
              </a>
            )}
            <div className="user-badge">
              <PersonIcon fontSize="small" />
              {!sidebarCollapsed && <span className="user-email">{displayName}</span>}
            </div>
          </div>
        </nav>

        <main
          className={['main-content', isContentDark ? 'main-content--dark' : ''].filter(Boolean).join(' ')}
        >
          <div className="main-toolbar">
            <DhsSiteHeader
              appTitle={VIEW_TITLES[currentView]}
              tagline={VIEW_TAGLINES[currentView]}
              actions={toolbarActions}
            />
          </div>
          <div
            className={[
              'main-content-inner',
              isContentDark ? 'content-theme-dark' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <div className="main-content-body constrained">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
