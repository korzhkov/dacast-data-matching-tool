export interface CsvFile {
  name: string;
  content: string[][];
  source: 'local' | 'inplay';
}

export interface ComparisonResult {
  missingInLocal: string[][];
  missingInInplay: string[][];
  matches: string[][];
}

export interface RowCounts {
  [key: string]: {
    local: number;
    inplay: number;
    difference: number;
  };
}

export interface Stats {
  byGateway: RowCounts;
  byActionType: RowCounts;
  totalRows: {
    local: number;
    inplay: number;
    difference: number;
  };
} 