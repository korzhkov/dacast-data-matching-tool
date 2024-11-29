import { ChangeEvent } from 'react';
import { FileUploadContainer, FileInput, UploadLabel, FileList, FileItem } from './styles.ts';

interface FileUploadProps {
  onFilesSelected: (files: FileList) => void;
  source: 'local' | 'inplay';
  selectedFiles?: File[];
}

export const FileUpload = ({ onFilesSelected, source, selectedFiles = [] }: FileUploadProps) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    if (files) {
      onFilesSelected(files);
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
}; 