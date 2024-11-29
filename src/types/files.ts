export interface ParsedFile {
  name: string;
  content: string;
  source: 'local' | 'inplay';
} 