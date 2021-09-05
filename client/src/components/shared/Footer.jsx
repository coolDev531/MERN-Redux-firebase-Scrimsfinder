import { Grid, styled } from '@material-ui/core';
import { InnerColumn } from './PageComponents';

const StyledFooter = styled('footer')({
  background: '#000',
  boxShadow: '1px 2px 4px 1px#fff',
  scrollMarginTop: '2em',
});

const Footer = () => (
  <StyledFooter className="page-section site-footer">
    <InnerColumn>
      <Grid container justifyContent="space-between">
        &copy; 2021 GitCat
        <a
          target="_blank"
          rel="noreferrer"
          className="link"
          href="https://github.com/DannyMichaels/LoL-scrims-finder">
          Source
        </a>
      </Grid>
    </InnerColumn>
  </StyledFooter>
);

export default Footer;
