import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { AuthProvider } from "./contexts/AuthContext";
import { AuthPage } from "./pages/AuthPage";
import { CreatePage } from "./pages/CreatePage";
import { ExplorePage } from "./pages/ExplorePage";
import { FeedPage } from "./pages/FeedPage";
import { LandingPage } from "./pages/LandingPage";
import { MessagesPage } from "./pages/MessagesPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { ProfilePage } from "./pages/ProfilePage";

// ── Root route ─────────────────────────────────────────────────────────────

const rootRoute = createRootRoute({
  component: () => (
    <AuthProvider>
      <Outlet />
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: "oklch(0.13 0.015 265 / 0.95)",
            backdropFilter: "blur(16px)",
            border: "1px solid oklch(0.28 0.025 265)",
            color: "oklch(0.96 0.005 265)",
          },
        }}
      />
    </AuthProvider>
  ),
});

// ── Route definitions ──────────────────────────────────────────────────────

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
});

const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth",
  component: AuthPage,
});

const feedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/feed",
  component: FeedPage,
});

const exploreRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/explore",
  component: ExplorePage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile/$principalId",
  component: ProfilePage,
});

const createRoute_ = createRoute({
  getParentRoute: () => rootRoute,
  path: "/create",
  component: CreatePage,
});

const messagesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/messages",
  component: MessagesPage,
});

const notificationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/notifications",
  component: NotificationsPage,
});

// ── Router ─────────────────────────────────────────────────────────────────

const routeTree = rootRoute.addChildren([
  indexRoute,
  authRoute,
  feedRoute,
  exploreRoute,
  profileRoute,
  createRoute_,
  messagesRoute,
  notificationsRoute,
]);

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// ── App ────────────────────────────────────────────────────────────────────

export default function App() {
  return <RouterProvider router={router} />;
}
