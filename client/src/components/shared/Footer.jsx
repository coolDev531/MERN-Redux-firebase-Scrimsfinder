import { Grid } from '@material-ui/core';

const Footer = () => (
  <footer class="page-section site-footer">
    <Grid className="inner-column" container justify="space-between">
      &copy; 2021 Daniel Michael / GitCat#9811
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
