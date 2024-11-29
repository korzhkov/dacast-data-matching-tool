import { Stats as StatsType } from '../../types/csv';
import { StatsTable, TableHeader, TableRow, TableCell } from './styles.ts';
import { Modal } from '../Modal/Modal';
import { DifferenceDetails } from '../DifferenceDetails/DifferenceDetails';
import { useState, Fragment } from 'react';
import { theme } from '../../styles/theme';

interface StatsProps extends StatsType {
  getDifference: (type: string, isGateway: boolean, gateway?: string) => { localRows: string[][], inplayRows: string[][] };
}

export const Stats = ({ byGateway, byActionType, totalRows, getDifference }: StatsProps) => {
  const [selectedDifference, setSelectedDifference] = useState<{
    type: string;
    isGateway: boolean;
    details: { localRows: string[][], inplayRows: string[][] };
  } | null>(null);

  const handleDifferenceClick = (type: string, isGateway: boolean, gateway?: string) => {
    const { localRows, inplayRows } = getDifference(type, isGateway, gateway);
    setSelectedDifference({ type, isGateway, details: { localRows, inplayRows } });
  };

  const combinedStats = Object.entries(byGateway).map(([gateway, gatewayStats]) => {
    const actionTypes = Object.entries(byActionType)
      .filter(([key]) => {
        const [actionGateway] = key.split('|');
        return actionGateway === gateway;
      })
      .map(([key, stats]) => {
        const [_, actionType] = key.split('|');
        return {
          type: actionType,
          local: stats.local,
          inplay: stats.inplay,
          difference: stats.difference
        };
      });

    return {
      gateway,
      gatewayStats,
      actionTypes
    };
  });

  return (
    <div>
      <h3>Total Rows</h3>
      <StatsTable>
        <thead>
          <tr>
            <TableHeader>Source</TableHeader>
            <TableHeader style={{ textAlign: 'left' }}>Count</TableHeader>
          </tr>
        </thead>
        <tbody>
          <TableRow>
            <TableCell>Local Records</TableCell>
            <TableCell style={{ textAlign: 'left' }}>{totalRows.local}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>InPlay Records</TableCell>
            <TableCell style={{ textAlign: 'left' }}>{totalRows.inplay}</TableCell>
          </TableRow>
        </tbody>
      </StatsTable>

      <h3>Combined Comparison</h3>
      <StatsTable>
        <thead>
          <tr>
            <TableHeader>Gateway / Action Type</TableHeader>
            <TableHeader>Local</TableHeader>
            <TableHeader>InPlay</TableHeader>
            <TableHeader>Difference</TableHeader>
          </tr>
        </thead>
        <tbody>
          {combinedStats.map(({ gateway, gatewayStats, actionTypes }) => (
            <Fragment key={gateway}>
              <TableRow>
                <TableCell><strong>{gateway}</strong></TableCell>
                <TableCell><strong>{gatewayStats.local}</strong></TableCell>
                <TableCell><strong>{gatewayStats.inplay}</strong></TableCell>
                <TableCell 
                  onClick={() => handleDifferenceClick(gateway, true)}
                  style={{ cursor: 'pointer', color: theme.colors.primary }}
                >
                  <strong>{gatewayStats.difference}</strong>
                </TableCell>
              </TableRow>
              {actionTypes.map(({ type, local, inplay, difference }) => (
                <TableRow key={`${gateway}-${type}`} style={{ backgroundColor: '#f8f9fa' }}>
                  <TableCell style={{ paddingLeft: '2rem' }}>{type}</TableCell>
                  <TableCell>{local}</TableCell>
                  <TableCell>{inplay}</TableCell>
                  <TableCell 
                    onClick={() => handleDifferenceClick(type, false, gateway)}
                    style={{ cursor: 'pointer', color: theme.colors.primary }}
                  >
                    {difference}
                  </TableCell>
                </TableRow>
              ))}
            </Fragment>
          ))}
        </tbody>
      </StatsTable>

      <Modal 
        isOpen={!!selectedDifference}
        onClose={() => setSelectedDifference(null)}
      >
        {selectedDifference && (
          <DifferenceDetails
            type={selectedDifference.type}
            localRows={selectedDifference.details.localRows}
            inplayRows={selectedDifference.details.inplayRows}
          />
        )}
      </Modal>
    </div>
  );
}; 