export type CollectionDataTab = 'records' | 'genie';

export function collectionAdminPath(projectId: string, tab?: string) {
  const base = `/collections/${projectId}`;
  return tab ? `${base}?tab=${tab}` : base;
}

export function collectionDataPath(projectId: string, tab: CollectionDataTab = 'records') {
  return `/collections/${projectId}/data?tab=${tab}`;
}

export function collectionDataUrl(projectId: string, tab: CollectionDataTab = 'records') {
  return `${window.location.origin}${collectionDataPath(projectId, tab)}`;
}
