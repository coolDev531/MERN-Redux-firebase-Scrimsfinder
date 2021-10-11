import { useLocation } from 'react-router-dom';

export default function useQuery() {
  // get query params
  return new URLSearchParams(useLocation().search);
}
