// hook to fetch scrims
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { getAllUsers } from './../services/users';
import devLog from './../utils/devLog';
import { useLocation } from 'react-router-dom';
import useEffectExceptOnMount from './useEffectExceptOnMount';

export const useFetchUsers = () => {
  const dispatch = useDispatch();
  const { pathname } = useLocation();

  const fetchUsers = async () => {
    devLog('fetching all users');
    const usersData = await getAllUsers();
    dispatch({ type: 'users/fetchUsers', payload: usersData });
  };

  useEffect(() => {
    fetchUsers();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffectExceptOnMount(() => {
    if (pathname.includes('/settings')) {
      devLog('in settings page, fetching users');
      fetchUsers();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return null;
};
