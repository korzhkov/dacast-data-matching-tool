import { CsvFile } from '../../types/csv';
import { Stats as StatsType } from '../../types/csv';
import { StatsTable, TableHeader, TableRow, TableCell } from './styles.ts';
import { Modal } from '../Modal/Modal';
import { DifferenceDetails } from '../DifferenceDetails/DifferenceDetails';
import { useState, Fragment } from 'react';
import { useTheme } from 'styled-components';
import { downloadAsCSV } from '../../utils/csvExport';
import { Button } from '../FileFilter/styles.ts';

interface StatsProps extends StatsType {
  getDifference: (type: string, isGateway: boolean, gateway?: string) => { localRows: string[][], inplayRows: string[][] };
  parsedFiles: CsvFile[];
}

export const Stats = ({ byGateway, byActionType, totalRows, getDifference, parsedFiles }: StatsProps) => {
  const [modalContent, setModalContent] = useState<{ type: string; localRows: string[][]; inplayRows: string[][] } | null>(null);
  const theme = useTheme();

  const handleDifferenceClick = (type: string, isGateway: boolean, gateway?: string) => {
    const { localRows, inplayRows } = getDifference(type, isGateway, gateway);
    setModalContent({ type, localRows, inplayRows });
  };

  const handleDownloadLocal = () => {
    const localFiles = parsedFiles.filter(f => f.source === 'local');
    if (localFiles.length > 0) {
      downloadAsCSV(localFiles[0].content, 'local-data');
    }
  };

  const combinedStats = Object.entries(byGateway).map(([gateway, gatewayStats]) => {
    const actionTypes = Object.entries(byActionType)
      .filter(([key]) => key.startsWith(gateway + '|'))
      .map(([key, stats]) => ({
        type: key.split('|')[1],
        ...stats,
      }));

    return {
      gateway,
      gatewayStats,
      actionTypes,
    };
  });

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3>Combined Comparison</h3>
        <Button onClick={handleDownloadLocal}>Download Local Data</Button>
      </div>
      <StatsTable>
        <thead>
          <tr>
            <TableHeader>Source</TableHeader>
            <TableHeader>Count</TableHeader>
          </tr>
        </thead>
        <tbody>
          <TableRow>
            <TableCell>Local</TableCell>
            <TableCell>{totalRows.local}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>InPlay</TableCell>
            <TableCell>{totalRows.inplay}</TableCell>
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
            <TableHeader>Amounts</TableHeader>
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
                <TableCell>
                  {Object.entries(gatewayStats.amounts).map(([currency, amounts]) => (
                    <div key={currency}>
                      {currency}: {amounts.local.toFixed(2)} / {amounts.inplay.toFixed(2)}
                    </div>
                  ))}
                </TableCell>
              </TableRow>
              {actionTypes.map(({ type, local, inplay, difference, amounts }) => (
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
                  <TableCell>
                    {Object.entries(amounts).map(([currency, amounts]) => (
                      <div key={currency}>
                        {currency}: {amounts.local.toFixed(2)} / {amounts.inplay.toFixed(2)}
                      </div>
                    ))}
                  </TableCell>
                </TableRow>
              ))}
            </Fragment>
          ))}
        </tbody>
      </StatsTable>

      {modalContent && (
        <Modal isOpen={true} onClose={() => setModalContent(null)}>
          <DifferenceDetails
            type={modalContent.type}
            localRows={modalContent.localRows}
            inplayRows={modalContent.inplayRows}
          />
        </Modal>
      )}
    </>
  );
}; 