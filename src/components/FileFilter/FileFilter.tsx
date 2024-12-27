import { useState, useEffect } from 'react';
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
  fields: Field[];
  onApplyFilter: (field: FieldIndex, value: string) => void;
  onApplyDateFilter: (start: string, end: string) => void;
  onClearFilter: () => void;
  initialDates?: {
    start: string;
    end: string;
  };
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

const DateFilterContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: center;
`;

const DateInputGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  label {
    font-size: 14px;
  }
`;

export function FileFilter({ onApplyFilter, onApplyDateFilter, onClearFilter, fields, initialDates }: FileFilterProps) {
  const [selectedField, setSelectedField] = useState<Field>(fields[0] || { label: '', index: { local: 0, inplay: 0 } });
  const [filterValue, setFilterValue] = useState('');
  const [startDate, setStartDate] = useState(initialDates?.start || '');
  const [endDate, setEndDate] = useState(initialDates?.end || '');

  // Обновляем даты когда приходят новые initialDates
  useEffect(() => {
    if (initialDates) {
      setStartDate(initialDates.start);
      setEndDate(initialDates.end);
    }
  }, [initialDates]);

  const handleApply = () => {
    onApplyFilter(selectedField.index, filterValue);
  };

  return (
    <>
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

      <DateFilterContainer>
        <DateInputGroup>
          <label>From:</label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </DateInputGroup>
        <DateInputGroup>
          <label>To:</label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </DateInputGroup>
        <Button onClick={() => onApplyDateFilter(startDate, endDate)}>
          Apply Date Filter
        </Button>
      </DateFilterContainer>
    </>
  );
} 