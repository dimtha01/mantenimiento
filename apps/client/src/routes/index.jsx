import { createBrowserRouter, Navigate } from "react-router-dom";
import { MainLayout } from "../layout/MainLayout";
import { ErrorPage } from "../pages/ErrorPage";
import { LoginPage } from "../pages/LoginPage";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { GestionUsuarioPage } from "../pages/GestionUsuarioPage";
// import UserDashboard from "../pages/app/Dashboard";
import {NoAutorizado} from "../components/NoAutorizado";
import { DashboardPage } from "../pages/DashboardPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <ErrorPage />,
    children: [
      // Ruta pública
      {
        path: "/",
        element: <LoginPage />,
      },
      {
        path: "/no-autorizado",
        element: <NoAutorizado />,
      },

      // Rutas protegidas solo para ADMIN
      {
        element: <ProtectedRoute allowedRoles={["ADMIN"]} />,
        children: [
          {
            path: "/admin",
            element: <DashboardPage />,
          },
          {
            path: "/admin/usuarios",
            element: <GestionUsuarioPage />,
          },
        ],
      },

      // Rutas protegidas para USER y ADMIN
      {
        element: <ProtectedRoute allowedRoles={["USER", "ADMIN"]} />,
        children: [
          {
            path: "/app",
            element: <div>AppDashboard</div>,
          },
          {
            path: "/app/ordenes",
            element: <div>Mis órdenes</div>,
          },
        ],
      },

      // Redirect raíz
      {
        path: "/",
        element: <Navigate to="/login" replace />,
      },
    ],
  },
]);
