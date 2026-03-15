import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUserStore } from '../../stores/user';
import { ROUTES } from '../../constants/routes';

interface Props {
  children: React.ReactNode;
}

export const PrivateRoute: React.FC<Props> = ({ children }) => {
  const { user } = useUserStore();
  const location = useLocation();

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
};
