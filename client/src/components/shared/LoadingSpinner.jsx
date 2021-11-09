import LoadingSpinnerGif from '../../assets/images/loading-spinner.gif';

export default function LoadingSpinner({ width = '20px', height = '20px' }) {
  return (
    <img src={LoadingSpinnerGif} alt="loading" style={{ width, height }} />
  );
}
