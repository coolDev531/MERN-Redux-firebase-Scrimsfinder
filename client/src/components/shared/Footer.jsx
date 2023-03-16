// components
import Grid from '@mui/material/Grid';
import { InnerColumn } from './PageComponents';
import Sparkles from './effects/Sparkles';

// utils
import { styled } from '@mui/system';
import { withRouter } from 'react-router-dom';

const StyledFooter = styled('footer')({
  backgroundColor: 'rgba(18,25,35,.65)',
  boxShadow: '1px 2px 4px 1px#fff',
  scrollMarginTop: '2em',
  overflow: 'hidden',

  // fixed footer.
  position: 'fixed',
  bottom: '0',
  width: '100%',
});

const currentYear = new Date().getFullYear();

const blacklist = ['/scrims', '/'];

const gitcatDiscordId = 1045871493587939379;

const Footer = ({ location }) => (
  <>
    {!blacklist.includes(location.pathname) && <div className="page-break" />}

    <div className="footer-spacer" />
    <StyledFooter className="page-section site-footer">
      <InnerColumn>
        <Grid container justifyContent="space-between">
          <a
            target="_blank"
            rel="noreferrer"
            href={`https://discordapp.com/users/${gitcatDiscordId}`}
            className="link">
            &copy; {currentYear} GitCat
          </a>
          {/* <a
            target="_blank"
            rel="noreferrer"
            className="link"
            href="https://github.com/DannyMichaels/LoL-scrims-finder">
            Source
          </a> */}

          <Sparkles>
            <a
              target="_blank"
              rel="noreferrer"
              className="link"
              href="https://www.danielmichaelmusic.com">
              Support my music
            </a>
          </Sparkles>
        </Grid>
      </InnerColumn>
    </StyledFooter>
  </>
);

export default withRouter(Footer);
