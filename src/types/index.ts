export interface AnalysisState {
  loading: boolean;
  error: string | null;
  seoAnalysis: unknown | null;
  aiVisibility: unknown | null;
  aiBotChecker: unknown | null;
  loadingSpeed: unknown | null;
  website: string;
  analyzedAt: Date | null;
}
