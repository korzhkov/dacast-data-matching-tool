import { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';
import { GlobalStyle } from './styles/GlobalStyle';
import { FileUpload } from './components/FileUpload/FileUpload';
import { useFileComparison, calculateStats, getDifferenceDetails } from './hooks/useFileComparison';
import { useFileFilter } from './hooks/useFileFilter';
import { AppContainer, Title, Section } from './styles/App.styles';
import { Stats } from './components/Stats/Stats';
import { RowCounts } from './types/csv';
import { FileFilter } from './components/FileFilter/FileFilter';
import { useMemo, useCallback } from 'react';

export interface StatsProps {
  getDifference: (type: string, isGateway: boolean) => {
    localRows: string[][];
    inplayRows: string[][];
  };
  byGateway: RowCounts;
  byActionType: RowCounts;
  totalRows: {
    local: number;
    inplay: number;
    difference: number;
  };
}

const FILTER_FIELDS = [
  { 
    label: 'Merchant ID', 
    index: {
      local: 1,    // B колонка в local
      inplay: 0    // A колонка в inplay
    }
  },
  { 
    label: 'Event/Asset ID', 
    index: {
      local: 10,    // K колонка в local
      inplay: 2   // C колонка в inplay
    }
  },
  { 
    label: 'Gateway', 
    index: {
      local: 7,    // H колонка в local
      inplay: 10   // K колонка в inplay
    }
  }
];

function App() {
  const { processFiles, isLoading, error, stats: originalStats, parsedFiles, getDifference: originalGetDifference, selectedFiles } = useFileComparison();
  const { filteredFiles, applyFilter, applyDateFilter, clearFilter } = useFileFilter(parsedFiles);

  // Создаем отфильтрованные версии stats и getDifference
  const stats = useMemo(() => {
    const localFiles = filteredFiles.filter(f => f.source === 'local');
    const inplayFiles = filteredFiles.filter(f => f.source === 'inplay');
    return calculateStats(localFiles, inplayFiles);
  }, [filteredFiles]);

  const getDifference = useCallback((type: string, isGateway: boolean, gateway?: string) => {
    const value = isGateway ? type : `${gateway}|${type}`;
    return getDifferenceDetails(filteredFiles, value, isGateway);
  }, [filteredFiles]);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <AppContainer>
        <Title>Data Matching Tool</Title>
        
        <Section>
          <h2>Local Files</h2>
          <FileUpload 
            onFilesSelected={(files) => processFiles(files, 'local')}
            source="local"
            selectedFiles={selectedFiles.local}
          />
        </Section>

        <Section>
          <h2>InPlay Files</h2>
          <FileUpload 
            onFilesSelected={(files) => processFiles(files, 'inplay')}
            source="inplay"
            selectedFiles={selectedFiles.inplay}
          />
        </Section>

        <FileFilter 
          fields={FILTER_FIELDS}
          onApplyFilter={applyFilter}
          onApplyDateFilter={applyDateFilter}
          onClearFilter={clearFilter}
        />

        {filteredFiles.length > 0 && (
          <Section>
            <Stats 
              getDifference={getDifference}
              byGateway={stats.byGateway}
              byActionType={stats.byActionType}
              totalRows={stats.totalRows}
            />
          </Section>
        )}

        {isLoading && <div>Processing files...</div>}
        {error && <div style={{ color: theme.colors.error }}>{error}</div>}
      </AppContainer>
    </ThemeProvider>
  );
}

export default App;
