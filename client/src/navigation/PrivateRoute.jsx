import { Redirect, Route } from 'react-router';
import { useAuth } from '../context/currentUser';

export default function PrivateRoute({ component: Component, ...rest }) {
  const { currentUser } = useAuth();

  return (
    <Route
      {...rest}
      render={(props) => {
        return currentUser ? (
          <Component {...props} />
        ) : (
          <Redirect to="/user-setup" />
        );
      }}
    />
  );
}
