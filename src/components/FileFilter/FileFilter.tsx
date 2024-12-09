import { useState } from 'react';
import styled from 'styled-components';

interface FieldIndex {
  local: number;
  inplay: number;
}

interface Field {
  label: string;
  index: FieldIndex;
}

interface FileFilterProps {
  onApplyFilter: (field: FieldIndex, value: string) => void;
  onClearFilter: () => void;
  fields: Field[];
}

const FilterContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: center;
`;

const Select = styled.select`
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ccc;
`;

const Input = styled.input`
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ccc;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  background-color: #007bff;
  color: white;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }

  &.clear {
    background-color: #dc3545;
    
    &:hover {
      background-color: #c82333;
    }
  }
`;

export function FileFilter({ onApplyFilter, onClearFilter, fields }: FileFilterProps) {
  const [selectedField, setSelectedField] = useState<Field>(fields[0] || { label: '', index: { local: 0, inplay: 0 } });
  const [filterValue, setFilterValue] = useState('');

  const handleApply = () => {
    onApplyFilter(selectedField.index, filterValue);
  };

  return (
    <FilterContainer>
      <Select 
        value={selectedField.label}
        onChange={(e) => {
          const field = fields.find(f => f.label === e.target.value);
          if (field) setSelectedField(field);
        }}
      >
        {fields.map(field => (
          <option key={field.label} value={field.label}>
            {field.label}
          </option>
        ))}
      </Select>
      
      <Input
        type="text"
        value={filterValue}
        onChange={(e) => setFilterValue(e.target.value)}
        placeholder="Filter value..."
      />
      
      <Button onClick={handleApply}>Apply Filter</Button>
      <Button className="clear" onClick={onClearFilter}>Clear</Button>
    </FilterContainer>
  );
} 