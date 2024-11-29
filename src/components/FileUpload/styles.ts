import styled from 'styled-components';

export const FileUploadContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const FileInput = styled.input`
  display: none;
`;

export const UploadLabel = styled.label`
  padding: 0.75rem 1.5rem;
  background-color: #007bff;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  text-align: center;
  
  &:hover {
    background-color: #0056b3;
  }
`;

export const FileList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const FileItem = styled.li`
  padding: 0.5rem;
  border-bottom: 1px solid #eee;
`; 