import { Fragment } from 'react';
import { InnerColumn } from '../shared/PageComponents';
import Typography from '@mui/material/Typography';
import { Fade } from 'react-awesome-reveal';
import ScrimSection from './ScrimSection';

// used in Scrims.jsx
export default function ScrimsColumn({ show, scrims, headerText, altText }) {
  return (
    show && (
      <>
        <InnerColumn>
          <div
            style={{
              marginBottom: '40px',
              borderBottom: '1px solid white',
            }}>
            <Typography align="center" variant="h1" gutterBottom>
              {scrims.length > 0 ? headerText : altText}
            </Typography>
          </div>
        </InnerColumn>

        {scrims.map((scrim) => (
          <Fragment key={scrim._id}>
            <Fade triggerOnce>
              <ScrimSection scrimData={scrim} />
            </Fade>
            <div className="page-break" />
          </Fragment>
        ))}
        <div className="page-break" />
      </>
    )
  );
}
