import { useState, useMemo } from 'react';
import { CsvFile, DateFormat } from '../types/csv';

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

// Копируем функцию parseDateString из useFileComparison
const parseDateString = (dateStr: string | undefined, format: DateFormat) => {
  if (!dateStr) return new Date(0); // или null, в зависимости от логики
  
  const [datePart, timePart] = dateStr.split(' ');
  if (!datePart || !timePart) return new Date(0);
  
  const [first, second, year] = datePart.split('/');
  if (!first || !second || !year) return new Date(0);
  
  try {
    const date = format === 'DD/MM/YYYY' 
      ? new Date(`${year}-${second}-${first} ${timePart}`)
      : new Date(`${year}-${first}-${second} ${timePart}`);
    
    return isNaN(date.getTime()) ? new Date(0) : date;
  } catch {
    return new Date(0);
  }
};

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
          const dateIndex = file.source === 'local' ? 16 : 21;
          const rowDateStr = row[dateIndex];
          
          // Используем формат даты из файла
          const rowDate = file.source === 'inplay' 
            ? parseDateString(rowDateStr, file.dateFormat)
            : new Date(rowDateStr); // для local данных формат уже правильный

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