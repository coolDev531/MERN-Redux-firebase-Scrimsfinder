import { styled } from '@material-ui/core';

const StyledPageContent = styled('div')(({ theme }) => ({
  flexGrow: 1,
}));

export const PageContent = ({ children }) => (
  <StyledPageContent>{children}</StyledPageContent>
);

const StyledInnerColumn = styled('div')(({ theme }) => ({
  display: 'block',
  width: '98%',
  maxWidth: '1100px',
  marginRight: 'auto',
  marginLeft: 'auto',
  padding: '10px',
}));

export const InnerColumn = ({ children }) => (
  <StyledInnerColumn className="inner-column">{children}</StyledInnerColumn>
);
