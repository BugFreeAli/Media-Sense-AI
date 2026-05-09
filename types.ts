export enum ViewState {
  LANDING = 'LANDING',
  DASHBOARD = 'DASHBOARD'
}

export interface TerminalLog {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  highlight?: boolean;
}

export interface NormalizedAnalysisResult {
  prediction: string;
  confidence: number;
  probabilities: {
      ai: number;
      real: number;
  };
  details: {
      forensic_report: string;
      media_type: string;
  };
  heatmap_base64?: string;
}
