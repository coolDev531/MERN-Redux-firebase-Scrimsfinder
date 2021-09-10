import { useAuth } from './../../context/currentUser';

// if user is admin, render, else dont
export default function AdminArea({ children }) {
  const { currentUser } = useAuth();
  if (process.env.REACT_APP_ADMIN_KEY !== currentUser?.adminKey) return null;

  return <>{children}</>;
}
