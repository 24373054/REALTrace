import React, { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '../components/layouts/MainLayout';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ROUTES } from '../constants/routes';

const HomePage = lazy(() => import('../pages/home/HomePage').then(m => ({ default: m.HomePage })));
const AddressPage = lazy(() => import('../pages/address/AddressPage').then(m => ({ default: m.AddressPage })));
const TransactionPage = lazy(() => import('../pages/transaction/TransactionPage').then(m => ({ default: m.TransactionPage })));
const AnalysisPage = lazy(() => import('../pages/analysis/AnalysisPage').then(m => ({ default: m.AnalysisPage })));
const MonitorPage = lazy(() => import('../pages/monitor/MonitorPage').then(m => ({ default: m.MonitorPage })));
const ReportPage = lazy(() => import('../pages/report/ReportPage').then(m => ({ default: m.ReportPage })));
const UserPage = lazy(() => import('../pages/user/UserPage').then(m => ({ default: m.UserPage })));
const MemberPage = lazy(() => import('../pages/member/MemberPage').then(m => ({ default: m.MemberPage })));
const LoginPage = lazy(() => import('../pages/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage').then(m => ({ default: m.RegisterPage })));
const TracePage = lazy(() => import('../pages/trace/TracePage').then(m => ({ default: m.TracePage })));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

const Wrap = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingSpinner fullPage text="加载中..." />}>{children}</Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Wrap><HomePage /></Wrap> },
      { path: 'address', element: <Wrap><AddressPage /></Wrap> },
      { path: 'address/:chain/:id', element: <Wrap><AddressPage /></Wrap> },
      { path: 'transaction', element: <Wrap><TransactionPage /></Wrap> },
      { path: 'transaction/:hash', element: <Wrap><TransactionPage /></Wrap> },
      { path: 'analysis', element: <Wrap><AnalysisPage /></Wrap> },
      { path: 'monitor', element: <Wrap><MonitorPage /></Wrap> },
      { path: 'report', element: <Wrap><ReportPage /></Wrap> },
      { path: 'user', element: <Wrap><UserPage /></Wrap> },
      { path: 'user/settings', element: <Wrap><UserPage /></Wrap> },
      { path: 'user/favorites', element: <Wrap><UserPage /></Wrap> },
      { path: 'user/history', element: <Wrap><UserPage /></Wrap> },
      { path: 'member', element: <Wrap><MemberPage /></Wrap> },
      { path: 'trace', element: <Wrap><TracePage /></Wrap> },
      { path: 'login', element: <Wrap><LoginPage /></Wrap> },
      { path: 'register', element: <Wrap><RegisterPage /></Wrap> },
      { path: '*', element: <Wrap><NotFoundPage /></Wrap> },
    ],
  },
]);
