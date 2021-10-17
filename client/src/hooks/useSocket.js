import { useSelector } from 'react-redux';

export default function useSocket() {
  return useSelector(({ socket }) => socket);
}
