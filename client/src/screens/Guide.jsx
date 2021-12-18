import Navbar from '../components/shared/Navbar/Navbar';
import { Helmet } from 'react-helmet';

const SIMPLIFIED_URL =
  'https://docs.google.com/presentation/d/17Z_2pNYBwbtSaqNVpl7QQHnf0AHossIabcjQbSkF-lA/edit#slide=id.gfb1f477382_0_96';

export default function Guide() {
  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Guide | Bootcamp LoL Scrim Gym</title>
        <meta name="description" content="Scrim Gym Simplified!" />
        <meta
          property="og:title"
          content="Guide | Bootcamp LoL Scrim Gym"
          data-rh="true"
        />
        <meta
          property="og:description"
          content="Scrim Gym Simplified!"
          data-rh="true"
        />
      </Helmet>
      <Navbar showLess noGuide />
      <iframe
        style={{
          width: '100%',
          height: '70vh',
          overflowY: 'auto',
          marginTop: '-20px',
        }}
        src={SIMPLIFIED_URL}
        frameBorder="0"
        title="Scrim Gym Simplified"
      />
    </>
  );
}
