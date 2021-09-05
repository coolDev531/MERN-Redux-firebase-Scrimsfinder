import { Grid } from '@material-ui/core';
import { InnerColumn } from './PageComponents';

const Footer = () => (
  <footer className="page-section site-footer">
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
  </footer>
);

export default Footer;
