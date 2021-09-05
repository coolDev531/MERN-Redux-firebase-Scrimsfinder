import { styled } from '@material-ui/core';

// theme not being used, indicated with _
const StyledPageContent = styled('div')(({ theme: _theme }) => ({
  flexGrow: 1,
}));

const StyledPageSection = styled('div')(({ theme: _theme }) => ({
  scrollMarginTop: '2em',
}));

const StyledInnerColumn = styled('div')(({ theme: _theme }) => ({
  display: 'block',
  width: '98%',
  maxWidth: '1100px',
  marginRight: 'auto',
  marginLeft: 'auto',
  padding: '10px',
}));

export const PageContent = ({ children }) => (
  <StyledPageContent className="page-content">{children}</StyledPageContent>
);

export const PageSection = ({ children }) => (
  <StyledPageSection className="page-section">{children}</StyledPageSection>
);

export const InnerColumn = ({ children }) => (
  <StyledInnerColumn className="inner-column">{children}</StyledInnerColumn>
);
