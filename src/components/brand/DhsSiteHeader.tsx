import type { ReactNode } from 'react';
import PersonIcon from '@mui/icons-material/Person';

interface DhsSiteHeaderProps {
  appTitle?: string;
  tagline?: string;
  showSeal?: boolean;
  actions?: ReactNode;
  userLabel?: string;
}

export default function DhsSiteHeader({
  appTitle = 'Data Collector',
  tagline,
  showSeal = false,
  actions,
  userLabel,
}: DhsSiteHeaderProps) {
  return (
    <header className="dhs-site-header">
      <div className="dhs-site-header__inner">
        <a
          className="dhs-site-header__logo-link"
          href="https://www.dhs.gov/"
          target="_blank"
          rel="noopener noreferrer"
          title="U.S. Department of Homeland Security (opens in new tab)"
        >
          {showSeal && (
            <img src="/images/dhs-logo.svg" alt="" className="dhs-site-header__seal" />
          )}
          <div className="dhs-site-header__titles">
            <span className="dhs-site-header__agency">U.S. Department of Homeland Security</span>
            <span className="dhs-site-header__app">{appTitle}</span>
          </div>
        </a>
        {tagline && (
          <p className="dhs-site-header__tagline dhs-site-header__tagline--side">{tagline}</p>
        )}
        {(actions || userLabel) && (
          <div className="dhs-site-header__end">
            {actions && <div className="dhs-site-header__actions">{actions}</div>}
            {userLabel && (
              <div className="dhs-site-header__user" title={userLabel}>
                <PersonIcon sx={{ fontSize: '1.1rem' }} aria-hidden />
                <span className="dhs-site-header__user-name">{userLabel}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
