// components
import Grid from '@mui/material/Grid';
import { InnerColumn } from './PageComponents';

// utils
import { styled } from '@mui/system';

const StyledFooter = styled('footer')({
  backgroundColor: 'rgba(18,25,35,.65)',
  boxShadow: '1px 2px 4px 1px#fff',
  scrollMarginTop: '2em',
});

const currentYear = new Date().getFullYear();

const Footer = () => (
  <>
    <div className="footer-spacer" />
    <StyledFooter className="page-section site-footer">
      <InnerColumn>
        <Grid container justifyContent="space-between">
          <a
            target="_blank"
            rel="noreferrer"
            href="https://discordapp.com/users/233703630140604416"
            className="link">
            &copy; {currentYear} GitCat#9811
          </a>
          {/* <a
            target="_blank"
            rel="noreferrer"
            className="link"
            href="https://github.com/DannyMichaels/LoL-scrims-finder">
            Source
          </a> */}
        </Grid>
      </InnerColumn>
    </StyledFooter>
  </>
);

export default Footer;
