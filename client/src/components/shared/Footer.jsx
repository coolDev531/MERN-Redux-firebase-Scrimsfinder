import { Grid } from '@material-ui/core';

const Footer = () => (
  <footer className="page-section site-footer">
    <Grid className="inner-column" container justifyContent="space-between">
      &copy; 2021 GitCat
      <a
        target="_blank"
        rel="noreferrer"
        className="link"
        href="https://github.com/DannyMichaels/LoL-scrims-finder">
        Source
      </a>
    </Grid>
  </footer>
);

export default Footer;
