import { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';
import { GlobalStyle } from './styles/GlobalStyle';
import { FileUpload } from './components/FileUpload/FileUpload';
import { useFileComparison } from './hooks/useFileComparison';
import { AppContainer, Title, Section } from './styles/App.styles';
import { Stats } from './components/Stats/Stats';
import { RowCounts } from './types/csv';

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

function App() {
  const { processFiles, isLoading, error, stats, parsedFiles, getDifference, selectedFiles } = useFileComparison();

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

        {parsedFiles.length > 0 && (
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
