import { useState, useCallback, useMemo } from 'react';
import Papa from 'papaparse';
import { CsvFile, Stats, RowCounts, DateFormat } from '../types/csv';

interface DebugInfo {
  inplayDates: { start: string; end: string } | null;
  sqlQuery: { 
    start: string; 
    end: string;
    query: string;
  } | null;
}

const isFullVoucher = (value: string | undefined) => {
  if (!value) return false;
  const normalized = value.toString().trim();
  return normalized === '100' || normalized === '100.00';
};

export const getDifferenceDetails = (
  files: CsvFile[], 
  value: string,
  isGateway: boolean
) => {
  if (isGateway) {
    const localRows = files
      .filter(f => f.source === 'local')
      .flatMap(file => file.content.slice(1))
      .filter(row => {
        const isVoucher = isFullVoucher(row[25]);
        if (isVoucher) return value === 'Voucher';
        if (value === 'unknown') return !row[7] || row[7].trim() === '';
        return row[7] === value;
      });

    const inplayRows = files
      .filter(f => f.source === 'inplay')
      .flatMap(file => file.content.slice(1))
      .filter(row => {
        const gateway = row[10];
        if (value === 'unknown') return !gateway || gateway.trim() === '';
        return gateway === value || (value === 'Voucher' && gateway === 'Voucher100');
      });

    // Создаем ключи из payment_tool_token + consumer_id
    const createLocalKey = (row: string[]) => `${row[5]}_${row[2]}`; // F_C для local
    const createInplayKey = (row: string[]) => `${row[23]}_${row[14]}`; // X_O для inplay
    
    const inplayKeys = new Set(inplayRows.map(createInplayKey));
    const localKeys = new Set(localRows.map(createLocalKey));

    const localOnly = localRows.filter(row => !inplayKeys.has(createLocalKey(row)));
    const inplayOnly = inplayRows.filter(row => !localKeys.has(createInplayKey(row)));

    return { localRows: localOnly, inplayRows: inplayOnly };
  } else {
    const [gateway, actionType] = value.split('|');

    const localRows = files
      .filter(f => f.source === 'local')
      .flatMap(file => file.content.slice(1))
      .filter(row => {
        const isVoucher = isFullVoucher(row[25]);
        const rowGateway = isVoucher ? 'Voucher' : (row[7] || 'unknown');
        const rowActionType = row[8] || 'unknown';
        return rowGateway === gateway && rowActionType === actionType;
      });

    const inplayRows = files
      .filter(f => f.source === 'inplay')
      .flatMap(file => file.content.slice(1))
      .filter(row => {
        const rowGateway = row[10] === 'Voucher100' ? 'Voucher' : (row[10] || 'unknown');
        const rowActionType = row[9] || 'unknown';
        return rowGateway === gateway && rowActionType === actionType;
      });

    // Создаем ключи из payment_tool_token + consumer_id
    const createLocalKey = (row: string[]) => `${row[5]}_${row[2]}`; // F_C для local
    const createInplayKey = (row: string[]) => `${row[23]}_${row[14]}`; // X_O для inplay
    
    const inplayKeys = new Set(inplayRows.map(createInplayKey));
    const localKeys = new Set(localRows.map(createLocalKey));

    const localOnly = localRows.filter(row => !inplayKeys.has(createLocalKey(row)));
    const inplayOnly = inplayRows.filter(row => !localKeys.has(createInplayKey(row)));

    return { localRows: localOnly, inplayRows: inplayOnly };
  }
};

export const calculateStats = (localFiles: CsvFile[], inplayFiles: CsvFile[]): Stats => {
  const gatewayStats: RowCounts = {};
  const actionTypeStats: RowCounts = {};

  // Обработка локальных файлов
  localFiles.forEach(file => {
    file.content.slice(1).forEach(row => {
      const isVoucher = isFullVoucher(row[25]);
      const rawGateway = row[7];
      const gateway = isVoucher ? 'Voucher' : 
                     (rawGateway && rawGateway.trim() !== '' ? rawGateway : 'unknown');
      const actionType = row[8] || 'unknown';
      const amount = parseFloat(row[13]) || 0;    // charged_amount
      const currencyCode = row[14] || 'unknown';  // currency_iso

      // Инициализация статистики если не существует
      gatewayStats[gateway] = gatewayStats[gateway] || { 
        local: 0, 
        inplay: 0, 
        difference: 0,
        amounts: {} 
      };
      actionTypeStats[`${gateway}|${actionType}`] = actionTypeStats[`${gateway}|${actionType}`] || { 
        local: 0, 
        inplay: 0, 
        difference: 0,
        amounts: {} 
      };

      // Инициализация сумм по валютам
      gatewayStats[gateway].amounts[currencyCode] = gatewayStats[gateway].amounts[currencyCode] || 
        { local: 0, inplay: 0 };
      actionTypeStats[`${gateway}|${actionType}`].amounts[currencyCode] = 
        actionTypeStats[`${gateway}|${actionType}`].amounts[currencyCode] || { local: 0, inplay: 0 };

      // Увеличение счетчиков и сумм
      gatewayStats[gateway].local++;
      actionTypeStats[`${gateway}|${actionType}`].local++;
      gatewayStats[gateway].amounts[currencyCode].local += amount;
      actionTypeStats[`${gateway}|${actionType}`].amounts[currencyCode].local += amount;
    });
  });

  // Обработка inplay файлов
  inplayFiles.forEach(file => {
    file.content.slice(1).forEach(row => {
      const originalGateway = row[10]; // K
      const gateway = originalGateway === 'Voucher100' ? 'Voucher' : 
                     (originalGateway && originalGateway.trim() !== '' ? originalGateway : 'unknown');
      const actionType = row[9] || 'unknown'; // J
      const amount = parseFloat(row[5]) || 0;    // F - сумма
      const currencyCode = row[6] || 'unknown';  // G - валюта

      // Инициализация если не существует
      gatewayStats[gateway] = gatewayStats[gateway] || { 
        local: 0, 
        inplay: 0, 
        difference: 0,
        amounts: {} 
      };
      actionTypeStats[`${gateway}|${actionType}`] = actionTypeStats[`${gateway}|${actionType}`] || { 
        local: 0, 
        inplay: 0, 
        difference: 0,
        amounts: {} 
      };

      // Инициализация сумм по валютам
      gatewayStats[gateway].amounts[currencyCode] = gatewayStats[gateway].amounts[currencyCode] || 
        { local: 0, inplay: 0 };
      actionTypeStats[`${gateway}|${actionType}`].amounts[currencyCode] = 
        actionTypeStats[`${gateway}|${actionType}`].amounts[currencyCode] || { local: 0, inplay: 0 };

      // Увеличение счетчиков и сумм
      gatewayStats[gateway].inplay++;
      actionTypeStats[`${gateway}|${actionType}`].inplay++;
      gatewayStats[gateway].amounts[currencyCode].inplay += amount;
      actionTypeStats[`${gateway}|${actionType}`].amounts[currencyCode].inplay += amount;
    });
  });

  // Подсчет разницы
  Object.values(gatewayStats).forEach(stat => {
    stat.difference = Math.abs(stat.local - stat.inplay);
  });
  Object.values(actionTypeStats).forEach(stat => {
    stat.difference = Math.abs(stat.local - stat.inplay);
  });

  return {
    byGateway: gatewayStats,
    byActionType: actionTypeStats,
    totalRows: {
      local: localFiles.reduce((sum, file) => sum + file.content.length - 1, 0),
      inplay: inplayFiles.reduce((sum, file) => sum + file.content.length - 1, 0),
      difference: 0
    }
  };
};

interface FetchLocalDataParams {
  startDate: string;
  endDate: string;
}

const API_URL = import.meta.env.DEV 
  ? 'http://localhost:3001/api'
  : `${window.location.origin}/data-matching/api`;

async function fetchLocalData({ startDate, endDate }: FetchLocalDataParams): Promise<CsvFile> {
  console.log('Fetching local data with URL:', `${API_URL}/local-data?startDate=${startDate}&endDate=${endDate}`);
  
  const response = await fetch(
    `${API_URL}/local-data?startDate=${startDate}&endDate=${endDate}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch local data');
  }
  
  const data = await response.json();
  console.log('Received data:', {
    rowCount: data.content.length - 1,
    firstRow: data.content[1],
    lastRow: data.content[data.content.length - 1]
  });
  
  return data;
}

export function useFileComparison() {
  const [parsedFiles, setParsedFiles] = useState<CsvFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({ inplayDates: null, sqlQuery: null });
  const [originalFiles, setOriginalFiles] = useState<{
    inplay: File[];
  }>({
    inplay: []
  });

  const processFiles = useCallback(async (files: FileList, dateFormat: DateFormat) => {
    setIsLoading(true);
    setError(null);

    try {
      const filesArray = Array.from(files);
      setOriginalFiles(prev => ({ ...prev, inplay: filesArray }));

      const processed = await Promise.all(
        filesArray.map(async file => {
          const text = await file.text();
          const { data } = Papa.parse(text);
          return { 
            name: file.name, 
            content: data as string[][], 
            source: 'inplay' as const,
            dateFormat 
          };
        })
      );

      setParsedFiles(prev => {
        const filtered = prev.filter(f => f.source !== 'inplay');
        return [...filtered, ...processed];
      });

      // Получаем диапазон дат и запрашиваем локальные данные
      const dateRange = getInplayDateRange([...processed]);
      if (dateRange) {
        const localData = await fetchLocalData(dateRange);
        setParsedFiles(prev => {
          const filtered = prev.filter(f => f.source !== 'local');
          return [...filtered, localData];
        });
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process files');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const parseDateString = (dateStr: string, format: DateFormat) => {
    const [datePart, timePart] = dateStr.split(' ');
    const [first, second, year] = datePart.split('/');
    
    const date = format === 'DD/MM/YYYY' 
      ? new Date(`${year}-${second}-${first} ${timePart}`)
      : new Date(`${year}-${first}-${second} ${timePart}`);
    
    return date;
  };

  // Обновляем getInplayDateRange для использования формата
  const getInplayDateRange = (files: CsvFile[]): { startDate: string, endDate: string } | null => {
    const inplayFiles = files.filter(f => f.source === 'inplay');
    if (inplayFiles.length === 0) return null;

    const dates = inplayFiles
      .flatMap(file => file.content.slice(1))
      .map(row => row[21])
      .filter(Boolean)
      .map(dateStr => parseDateString(dateStr, inplayFiles[0].dateFormat));

    if (dates.length === 0) return null;

    // Находим минимальную и максимальную даты
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));

    // Сохраняем оригинальные даты для отладки
    setDebugInfo(prev => ({
      ...prev,
      inplayDates: {
        start: minDate.toLocaleString(),
        end: maxDate.toLocaleString()
      }
    }));

    const result = {
      startDate: minDate.getFullYear() + '-' + 
                 String(minDate.getMonth() + 1).padStart(2, '0') + '-' +
                 String(minDate.getDate()).padStart(2, '0') + ' ' +
                 String(minDate.getHours()).padStart(2, '0') + ':' +
                 String(minDate.getMinutes()).padStart(2, '0') + ':' +
                 String(minDate.getSeconds()).padStart(2, '0'),
      endDate: maxDate.getFullYear() + '-' + 
               String(maxDate.getMonth() + 1).padStart(2, '0') + '-' +
               String(maxDate.getDate()).padStart(2, '0') + ' ' +
               String(maxDate.getHours()).padStart(2, '0') + ':' +
               String(maxDate.getMinutes()).padStart(2, '0') + ':' +
               String(maxDate.getSeconds()).padStart(2, '0')
    };

    // Обновляем отладочную информацию
    setDebugInfo(prev => ({
      ...prev,
      sqlQuery: {
        start: result.startDate,
        end: result.endDate,
        query: `SELECT * FROM transaction_lines WHERE created_at >= '${result.startDate}' AND created_at <= '${result.endDate}' ORDER BY created_at`
      }
    }));

    return result;
  };

  const localFiles = useMemo(() => {
    return parsedFiles.filter(f => f.source === 'local');
  }, [parsedFiles]);

  const inplayFiles = useMemo(() => {
    return parsedFiles.filter(f => f.source === 'inplay');
  }, [parsedFiles]);

  const stats = useMemo(() => {
    return calculateStats(localFiles, inplayFiles);
  }, [localFiles, inplayFiles]);

  const getDifference = useCallback((type: string, isGateway: boolean, gateway?: string) => {
    const value = isGateway ? type : `${gateway}|${type}`;
    return getDifferenceDetails(parsedFiles, value, isGateway);
  }, [parsedFiles]);

  const reprocessFiles = useCallback((dateFormat: DateFormat) => {
    if (originalFiles.inplay.length > 0) {
      processFiles(originalFiles.inplay as unknown as FileList, dateFormat);
    }
  }, [originalFiles.inplay, processFiles]);

  return {
    processFiles,
    reprocessFiles,
    isLoading,
    error,
    stats,
    parsedFiles,
    getDifference,
    selectedFiles: {
      inplay: originalFiles.inplay
    },
    debugInfo
  } as const;
} 