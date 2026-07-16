import type { ProjectDetail } from '../types';

export function hasSyncLocation(
  project: Pick<ProjectDetail, 'sync_catalog' | 'sync_schema' | 'sync_table'>,
): boolean {
  return Boolean(
    project.sync_catalog?.trim() && project.sync_schema?.trim() && project.sync_table?.trim(),
  );
}

export function showGenieTab(
  project: Pick<ProjectDetail, 'storage_type' | 'sync_catalog' | 'sync_schema' | 'sync_table'>,
): boolean {
  return project.storage_type === 'uc_delta' || (project.storage_type === 'lakebase' && hasSyncLocation(project));
}
