// src/routes/index.tsx
import { Router, Route } from "@solidjs/router";
import { lazy, Suspense } from "solid-js";
import { getCurrentUser } from "~/services/authService";

const Home = lazy(() => import("../pages/home"));
const LoginPage = lazy(() => import("../pages/login"));
const AdminList = lazy(() => import("../pages/admin/list"));
const ReservationList = lazy(() => import("../pages/reservation/list"));
const ReservationDetail = lazy(() => import("../pages/reservation/detail"));
const ReservationAdd = lazy(() => import("../pages/reservation/add"));
const ReservationEdit = lazy(() => import("../pages/reservation/edit"));
const NotFound = lazy(() => import("../pages/not-found"));

// 管理员路由守卫
function AdminGuard(props: { children: any }) {
  const user = getCurrentUser();

  if (!user) {
    window.location.href = "/login";
    return null;
  }

  if (user?.role !== "admin") {
    window.location.href = "/";
    return null;
  }

  return props.children;
}

function UserGuard(props: { children: any }) {
  const user = getCurrentUser();

  if (!user) {
    window.location.href = "/login";
    return null;
  }

  if (user.role === "admin") {
    window.location.href = "/admin";
    return null;
  }

  return props.children;
}

export default function AppRouter() {
  return (
    <Router>
      <Route path="/" component={Home} />
      <Route path="/login" component={LoginPage} />
      <Route
        path="/admin"
        component={() => (
          <AdminGuard>
            <AdminList />
          </AdminGuard>
        )}
      />
      <Route path="/reservation">
        <Route
          path="/"
          component={() => (
            <UserGuard>
              <ReservationAdd />
            </UserGuard>
          )}
        />
        <Route
          path="/list"
          component={() => (
            <UserGuard>
              <ReservationList />
            </UserGuard>
          )}
        />
        <Route
          path="/:id"
          component={() => (
            <UserGuard>
              <ReservationDetail />
            </UserGuard>
          )}
        />
        <Route
          path="/edit/:id"
          component={() => (
            <UserGuard>
              <ReservationEdit />
            </UserGuard>
          )}
        />
      </Route>
      <Route path="*" component={NotFound} />
    </Router>
  );
}
