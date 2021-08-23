import { Redirect, Route } from 'react-router';

export default function PrivateRoute({ component: Component, ...rest }) {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

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
