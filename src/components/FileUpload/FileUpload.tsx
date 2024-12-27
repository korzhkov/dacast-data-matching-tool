import { ChangeEvent, useState } from 'react';
import { FileUploadContainer, FileInput, UploadLabel, FileList, FileItem } from './styles.ts';

type DateFormat = 'DD/MM/YYYY' | 'MM/DD/YYYY';

interface FileUploadProps {
  onFilesSelected: (files: FileList, dateFormat: DateFormat) => void;
  source: 'inplay';
  selectedFiles: File[];
}

export function FileUpload({ onFilesSelected, source, selectedFiles = [] }: FileUploadProps) {
  const [dateFormat, setDateFormat] = useState<DateFormat>('DD/MM/YYYY');

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    if (files) {
      onFilesSelected(files, dateFormat);
    }
  };

  return (
    <FileUploadContainer>
      <FileInput
        type="file"
        id={`file-upload-${source}`}
        multiple
        accept=".csv"
        onChange={handleChange}
      />
      <UploadLabel htmlFor={`file-upload-${source}`}>
        Upload {source} CSV files
      </UploadLabel>
      <select 
        value={dateFormat}
        onChange={(e) => {
          const newFormat = e.target.value as DateFormat;
          setDateFormat(newFormat);
          if (selectedFiles.length > 0) {
            onFilesSelected(selectedFiles as unknown as FileList, newFormat);
          }
        }}
      >
        <option value="DD/MM/YYYY">European (DD/MM/YYYY)</option>
        <option value="MM/DD/YYYY">US (MM/DD/YYYY)</option>
      </select>
      
      {selectedFiles.length > 0 && (
        <FileList>
          {selectedFiles.map((file, index) => (
            <FileItem key={`${file.name}-${index}`}>
              {file.name}
            </FileItem>
          ))}
        </FileList>
      )}
    </FileUploadContainer>
  );
} 