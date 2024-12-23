export function downloadAsCSV(data: string[][], filename: string) {
  // Конвертируем массив в CSV строку
  const csvContent = data
    .map(row => 
      row.map(cell => 
        // Экранируем кавычки и оборачиваем в кавычки если есть запятые
        `"${(cell || '').replace(/"/g, '""')}"`
      ).join(',')
    )
    .join('\n');

  // Создаем Blob с BOM для корректной работы с Excel
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  
  // Создаем временную ссылку для скачивания
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  
  // Очищаем
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
} 