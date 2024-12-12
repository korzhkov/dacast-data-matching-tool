import { useState, useMemo } from 'react';
import { CsvFile } from '../types/csv';

interface FieldIndex {
  local: number;
  inplay: number;
}

interface FileFilter {
  field?: FieldIndex;
  value?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export function useFileFilter(files: CsvFile[]) {
  const [filter, setFilter] = useState<FileFilter>({});

  const filteredFiles = useMemo(() => {
    if (!filter.field && !filter.value && !filter.dateRange) return files;

    return files.map(file => ({
      ...file,
      content: file.content.filter((row, index) => {
        // Пропускаем заголовок
        if (index === 0) return true;
        
        let passesFieldFilter = true;
        let passesDateFilter = true;

        // Применяем фильтр по полю если он задан
        if (filter.field && filter.value) {
          const fieldIndex = file.source === 'local' ? filter.field.local : filter.field.inplay;
          const value = row[fieldIndex];
          passesFieldFilter = value?.toString().toLowerCase().includes(filter.value.toLowerCase());
        }

        // Применяем фильтр по дате если он задан
        if (filter.dateRange) {
          // Local: колонка Q (индекс 16)
          // Inplay: колонка V (индекс 21)
          const dateIndex = file.source === 'local' ? 16 : 21;
          
          const rowDateStr = row[dateIndex];
          
          // Преобразуем строку даты из формата MM/DD/YYYY HH:MM:SS AM|PM в объект Date
          const rowDate = new Date(rowDateStr);
          rowDate.setHours(0, 0, 0, 0);

          const startDate = new Date(filter.dateRange.start);
          startDate.setHours(0, 0, 0, 0);
          
          const endDate = new Date(filter.dateRange.end);
          endDate.setHours(23, 59, 59, 999);

          passesDateFilter = !isNaN(rowDate.getTime()) && 
                            rowDate >= startDate && 
                            rowDate <= endDate;
        }

        return passesFieldFilter && passesDateFilter;
      })
    }));
  }, [files, filter]);

  const applyFilter = (field: FieldIndex, value: string) => {
    setFilter(prev => ({ ...prev, field, value }));
  };

  const applyDateFilter = (start: string, end: string) => {
    setFilter(prev => ({ ...prev, dateRange: { start, end } }));
  };

  const clearFilter = () => {
    setFilter({});
  };

  return {
    filteredFiles,
    applyFilter,
    applyDateFilter,
    clearFilter,
    currentFilter: filter
  };
} 