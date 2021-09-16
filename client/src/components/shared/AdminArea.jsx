import { useAuth } from './../../context/currentUser';

// if user is admin, render, else dont
export default function AdminArea({ children }) {
  const { isCurrentUserAdmin } = useAuth();
  if (!isCurrentUserAdmin) return null;

  return <>{children}</>;
}
