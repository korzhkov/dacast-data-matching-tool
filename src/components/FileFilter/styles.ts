import styled from 'styled-components';

export const Button = styled.button`
  padding: 8px 16px;
  background-color: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    opacity: 0.9;
  }
`; 