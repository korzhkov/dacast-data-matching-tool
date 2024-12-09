import { useState, useMemo } from 'react';
import { CsvFile } from '../types/csv';

interface FieldIndex {
  local: number;
  inplay: number;
}

interface FileFilter {
  field: FieldIndex;
  value: string;
}

export function useFileFilter(files: CsvFile[]) {
  const [filter, setFilter] = useState<FileFilter | null>(null);

  const filteredFiles = useMemo(() => {
    if (!filter) return files;

    return files.map(file => ({
      ...file,
      content: file.content.filter((row, index) => {
        // Пропускаем заголовок
        if (index === 0) return true;
        
        // Выбираем правильный индекс в зависимости от источника файла
        const fieldIndex = file.source === 'local' ? filter.field.local : filter.field.inplay;
        const value = row[fieldIndex];
        
        return value?.toString().toLowerCase().includes(filter.value.toLowerCase());
      })
    }));
  }, [files, filter]);

  const applyFilter = (field: FieldIndex, value: string) => {
    setFilter({ field, value });
  };

  const clearFilter = () => {
    setFilter(null);
  };

  return {
    filteredFiles,
    applyFilter,
    clearFilter,
    currentFilter: filter
  };
} 