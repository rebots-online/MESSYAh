
/**
 * @license
 * Copyright (C)2025 Robin L. M. Cheung, MBA. All rights reserved.
 * Namespace: mba.robin.hkm.visualresearch
*/
export type AspectRatio = '16:9' | '9:16' | '1:1';

export type ComplexityLevel = 'Elementary' | 'High School' | 'College' | 'Expert';

export type VisualStyle = 'Default' | 'Minimalist' | 'Realistic' | 'Cartoon' | 'Vintage' | 'Futuristic' | '3D Render' | 'Sketch';

export type Language = 'English' | 'Spanish' | 'French' | 'German' | 'Mandarin' | 'Japanese' | 'Hindi' | 'Arabic' | 'Portuguese' | 'Russian';

export type MediaType = 'image' | 'video';

export interface GeneratedContent {
  id: string;
  data: string; // Base64 data URL or Blob URL
  type: MediaType;
  prompt: string;
  timestamp: number;
  level?: ComplexityLevel;
  style?: VisualStyle;
  language?: Language;
}

export interface SearchResultItem {
  title: string;
  url: string;
}

export interface ResearchResult {
  visualPrompt: string; // Renamed from imagePrompt to be generic
  facts: string[];
  searchResults: SearchResultItem[];
}

export interface UploadedFile {
  mimeType: string;
  data: string; // Base64 string (no header)
  name: string;
}

export interface SettingsTemplate {
  id: string;
  name: string;
  config: {
    complexityLevel: ComplexityLevel;
    visualStyle: VisualStyle;
    language: Language;
    outputFormat: MediaType;
  };
}

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
}
