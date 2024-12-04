import { useState, useCallback, useMemo } from 'react';
import Papa from 'papaparse';
import { CsvFile, Stats, RowCounts } from '../types/csv';

const getDifferenceDetails = (
  files: CsvFile[], 
  value: string,
  isGateway: boolean
) => {
  if (isGateway) {
    const localRows = files
      .filter(f => f.source === 'local')
      .flatMap(file => file.content.slice(1))
      .filter(row => {
        const isFullVoucher = row[25]?.toString() === '100';
        if (isFullVoucher) return value === 'Voucher';
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
        const isFullVoucher = row[25]?.toString() === '100';
        const rowGateway = isFullVoucher ? 'Voucher' : (row[7] || 'unknown');
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

export function useFileComparison() {
  const [parsedFiles, setParsedFiles] = useState<CsvFile[]>([]);
  const [originalFiles, setOriginalFiles] = useState<{ local: File[], inplay: File[] }>({ local: [], inplay: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateStats = (localFiles: CsvFile[], inplayFiles: CsvFile[]): Stats => {
    const gatewayStats: RowCounts = {};
    const actionTypeStats: RowCounts = {};

    // Обработка локальных файлов
    localFiles.forEach(file => {
      file.content.slice(1).forEach(row => {
        const isFullVoucher = row[25]?.toString() === '100';
        const rawGateway = row[7];
        const gateway = isFullVoucher ? 'Voucher' : 
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

  const localFiles = useMemo(() => {
    return parsedFiles.filter(f => f.source === 'local');
  }, [parsedFiles]);

  const inplayFiles = useMemo(() => {
    return parsedFiles.filter(f => f.source === 'inplay');
  }, [parsedFiles]);

  const stats = useMemo(() => {
    return calculateStats(localFiles, inplayFiles);
  }, [localFiles, inplayFiles]);

  const processFiles = useCallback(async (files: FileList, source: 'local' | 'inplay') => {
    setOriginalFiles(prev => ({ ...prev, [source]: Array.from(files) }));
    setIsLoading(true);
    setError(null);

    try {
      const fileArray = Array.from(files);
      const processed = await Promise.all(
        fileArray.map((file) => {
          return new Promise<CsvFile>((resolve, reject) => {
            Papa.parse(file, {
              complete: (results) => {
                resolve({
                  name: file.name,
                  content: results.data as string[][],
                  source
                });
              },
              error: reject,
            });
          });
        })
      );

      setParsedFiles(prev => {
        const filtered = prev.filter(f => f.source !== source);
        return [...filtered, ...processed];
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process files');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getDifference = useCallback((type: string, isGateway: boolean, gateway?: string) => {
    const value = isGateway ? type : `${gateway}|${type}`;
    return getDifferenceDetails(parsedFiles, value, isGateway);
  }, [parsedFiles]);

  return {
    processFiles,
    localFiles,
    inplayFiles,
    isLoading,
    error,
    stats,
    parsedFiles,
    getDifference,
    selectedFiles: {
      local: originalFiles.local,
      inplay: originalFiles.inplay
    }
  };
} 