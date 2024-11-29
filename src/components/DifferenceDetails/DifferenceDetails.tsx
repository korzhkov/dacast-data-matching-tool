import { StatsTable, TableHeader, TableRow, TableCell } from '../Stats/styles';

interface DifferenceDetailsProps {
  type: string;
  localRows: string[][];
  inplayRows: string[][];
}

export const DifferenceDetails = ({ type, localRows = [], inplayRows = [] }: DifferenceDetailsProps) => {
  const localRowsArray = Array.isArray(localRows) ? localRows : 
    Object.values(localRows as Record<string, string[]>);
  const inplayRowsArray = Array.isArray(inplayRows) ? inplayRows : 
    Object.values(inplayRows as Record<string, string[]>);

  return (
    <div>
      <h3>Difference Details for {type}</h3>
      
      <div>
        <h4>InPlay Records ({inplayRowsArray.length})</h4>
        <StatsTable>
          <thead>
            <tr>
              <TableHeader>Details</TableHeader>
            </tr>
          </thead>
          <tbody>
            {inplayRowsArray.slice(0, 100).map((row, index) => (
              <TableRow key={index}>
                <TableCell style={{ fontSize: '12px' }}>{row.join(', ')}</TableCell>
              </TableRow>
            ))}
          </tbody>
        </StatsTable>
        {inplayRowsArray.length > 100 && (
          <div>...and {inplayRowsArray.length - 100} more records</div>
        )}
      </div>

      <div style={{ marginTop: '20px' }}>
        <h4>Local Records ({localRowsArray.length})</h4>
        <StatsTable>
          <thead>
            <tr>
              <TableHeader>Details</TableHeader>
            </tr>
          </thead>
          <tbody>
            {localRowsArray.slice(0, 100).map((row, index) => (
              <TableRow key={index}>
                <TableCell style={{ fontSize: '12px' }}>{row.join(', ')}</TableCell>
              </TableRow>
            ))}
          </tbody>
        </StatsTable>
        {localRowsArray.length > 100 && (
          <div>...and {localRowsArray.length - 100} more records</div>
        )}
      </div>
    </div>
  );
}; 