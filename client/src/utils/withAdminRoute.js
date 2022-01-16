import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

/**
 * @param {React.FunctionComponent} Component // the component wrapped in the function when exported
 * @param {String} route // the route pushing to on-error (when un-authenticated), defaults to '/' when not provided.
 * @returns {React.FunctionComponent} // the component to render when authenticated
 */
const withAdminRoute =
  (Component, route = '/') =>
  (props) => {
    const history = useHistory();
    const { isCurrentUserAdmin } = useAuth();
    async function checkAdmin() {
      try {
        if (!isCurrentUserAdmin) {
          history.push(route);
        }
      } catch (err) {
        // if not admin, push to the route (defaults to '/')
        history.push(route);
      }
    }
    useEffect(() => {
      checkAdmin();
      // no dependency array, runs first on mount and then every re-render (acts as both componentDidMount and componentDidUpdate)
    });
    // if is admin, return the component as usual.
    return <Component {...props} />;
  };

export default withAdminRoute;
