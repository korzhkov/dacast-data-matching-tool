export type DateFormat = 'DD/MM/YYYY' | 'MM/DD/YYYY';

export interface CsvFile {
  name: string;
  content: string[][];
  source: 'local' | 'inplay';
  dateFormat: DateFormat;
}

export interface ComparisonResult {
  missingInLocal: string[][];
  missingInInplay: string[][];
  matches: string[][];
}

export interface RowStats {
  local: number;
  inplay: number;
  difference: number;
  amounts: {
    [currencyCode: string]: {
      local: number;
      inplay: number;
    };
  };
}

export interface RowCounts {
  [key: string]: RowStats;
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

export interface SqlDebugInfo {
  start: string;
  end: string;
  query: string;
  actualQuery?: string;
}

export interface DebugInfo {
  inplayDates: { start: string; end: string } | null;
  sqlQuery: SqlDebugInfo | null;
} 