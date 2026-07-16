import type { AppBranding, BrandingChrome, BrandingColorSet } from '../types';

export const DEFAULT_BRANDING_CHROME: BrandingChrome = {
  header_background: '#0c2340',
  header_mid: '#112e51',
  header_accent: '#0078ae',
  sidebar_background: '#0c2340',
  sidebar_mid: '#112e51',
  sidebar_end: '#0c2a46',
};

export const DEFAULT_BRANDING_LIGHT: BrandingColorSet = {
  primary: '#005288',
  primary_light: '#0078ae',
  primary_dark: '#0c2340',
  secondary: '#c41230',
  background: '#f8f9fb',
  paper: '#ffffff',
  text_primary: '#1b1b1b',
  text_secondary: '#5c5c5c',
};

export const DEFAULT_BRANDING_DARK: BrandingColorSet = {
  primary: '#7dd3fc',
  primary_light: '#bae6fd',
  primary_dark: '#005288',
  secondary: '#e03a52',
  background: '#0c2340',
  paper: '#112e51',
  text_primary: 'rgba(255, 255, 255, 0.96)',
  text_secondary: 'rgba(255, 255, 255, 0.76)',
};

export const DEFAULT_BRANDING: AppBranding = {
  app_title: 'Data Collector',
  agency_name: 'U.S. Department of Homeland Security',
  logo_data_url: null,
  chrome: DEFAULT_BRANDING_CHROME,
  light: DEFAULT_BRANDING_LIGHT,
  dark: DEFAULT_BRANDING_DARK,
};

const STYLE_ID = 'app-branding-overrides';

function gradient(top: string, bottom: string): string {
  return `linear-gradient(180deg, ${top} 0%, ${bottom} 100%)`;
}

function sidebarGradient(chrome: BrandingChrome): string {
  return `linear-gradient(165deg, ${chrome.sidebar_background} 0%, ${chrome.sidebar_mid} 48%, ${chrome.sidebar_end} 100%)`;
}

function contentVars(colors: BrandingColorSet): string {
  return `
    --p-surface-ground: ${colors.background};
    --p-surface-0: ${colors.paper};
    --p-surface-50: ${colors.background};
    --p-surface-100: ${colors.paper};
    --p-surface-200: ${colors.text_secondary};
    --p-surface-border: ${colors.text_secondary};
    --p-text-color: ${colors.text_primary};
    --p-text-muted-color: ${colors.text_secondary};
    --p-primary-color: ${colors.primary};
    --dhs-navy: ${colors.text_primary};
    --dhs-blue: ${colors.primary};
    --dhs-blue-light: ${colors.primary_light};
  `;
}

/** Inject CSS variables for chrome + light/dark content palettes. */
export function applyBrandingToDocument(branding: AppBranding): void {
  const { chrome, light, dark } = branding;
  const css = `
:root {
  --dhs-navy: ${chrome.header_background};
  --dhs-navy-mid: ${chrome.header_mid};
  --dhs-blue: ${light.primary};
  --dhs-blue-light: ${chrome.header_accent};
  --dhs-red: ${light.secondary};
  --dhs-header-bg: ${gradient(chrome.header_background, chrome.header_mid)};
  --dhs-sidebar-bg: ${sidebarGradient(chrome)};
  --dhs-content-hero-bg: linear-gradient(135deg, ${chrome.header_background} 0%, ${light.primary} 55%, ${light.primary_light} 100%);
  --app-chrome-bg: ${light.background};
  ${contentVars(light)}
}

body.content-theme-dark,
.content-theme-dark {
  color-scheme: dark;
  --app-chrome-bg: ${dark.background};
  ${contentVars(dark)}
}

.main-content-inner.content-theme-dark {
  background: ${gradient(dark.background, chrome.header_background)};
}
`;

  let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement('style');
    el.id = STYLE_ID;
    document.head.appendChild(el);
  }
  el.textContent = css;
}
