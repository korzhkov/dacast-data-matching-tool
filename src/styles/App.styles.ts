import styled from 'styled-components';

export const AppContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.large};
`;

export const Title = styled.h1`
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.large};
`;

export const Section = styled.section`
  margin-bottom: ${({ theme }) => theme.spacing.large};
  
  h2 {
    margin-bottom: ${({ theme }) => theme.spacing.medium};
  }
`; 