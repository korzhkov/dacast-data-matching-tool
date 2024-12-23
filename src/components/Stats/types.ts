import { RowCounts, ComparisonResult, CsvFile } from '../../types/csv';

export interface StatsProps {
  byGateway: RowCounts;
  byActionType: RowCounts;
  totalRows: {
    local: number;
    inplay: number;
    difference: number;
  };
  getDifference: (type: string, isGateway: boolean, gateway?: string) => ComparisonResult;
  parsedFiles: CsvFile[];
} 