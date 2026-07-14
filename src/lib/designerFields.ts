import type { FieldDefinition, ProjectDetail } from '../types';

export function publishedFields(project: ProjectDetail): FieldDefinition[] {
  return project.fields.filter((f) => f.is_published);
}

export function draftFieldsOnly(project: ProjectDetail): FieldDefinition[] {
  return project.fields.filter((f) => !f.is_published);
}

/** Baseline fields for the form designer and AI refinement. */
export function designerBaseline(
  project: ProjectDetail,
  localDrafts: FieldDefinition[] = [],
): FieldDefinition[] {
  if (localDrafts.length > 0) return localDrafts;
  const drafts = draftFieldsOnly(project);
  if (drafts.length > 0) return drafts;
  return publishedFields(project).map((f) => ({
    ...f,
    is_published: false,
    schema_version: 0,
  }));
}
