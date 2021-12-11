import Navbar from '../components/shared/Navbar/Navbar';

const SIMPLIFIED_URL =
  'https://docs.google.com/presentation/d/17Z_2pNYBwbtSaqNVpl7QQHnf0AHossIabcjQbSkF-lA/edit#slide=id.gfb1f477382_0_151';

export default function Guide() {
  return (
    <>
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
