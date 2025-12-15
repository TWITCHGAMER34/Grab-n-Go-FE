/**
 * Application router
 *
 * - Defines client-side routes for the app using `react-router-dom`.
 * - Routes are lazy-loaded with `React.lazy` to split bundles and improve initial load.
 * - `ProtectedRoute` and `StaffProtectedRoute` wrap routes that require authentication/roles.
 * - Uses a `Suspense` fallback while lazy chunks are being loaded.
 */
import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './helpers/ProtectedRoute.tsx';
import { StaffProtectedRoute } from './helpers/StaffProtectedRoute.tsx';

// Lazy-loaded pages/components — keeps initial bundle small and loads pages on demand.
const HomePage = lazy(() => import('../pages/HomePage/Home.tsx'));
const Register = lazy(() => import('../pages/auth/register/Register.tsx'));
const Login = lazy(() => import('../pages/auth/login/Login.tsx'));
const NotFound = lazy(() => import('../pages/NotFound/404.tsx'));
const Loading = lazy(() => import('../components/loading.tsx'));
const MenuPage = lazy(() => import('../pages/MenuPage/Menu.tsx'));
const AboutUsPage = lazy(() => import('../pages/AboutUs/AboutUs.tsx'));
const BasketPage = lazy(() => import('../pages/basket/Basket.tsx'));
const OrderSuccessPage = lazy(() => import('../pages/orderSuccess/OrderSuccess.tsx'));
const MyOrdersPage = lazy(() => import('../pages/MyOrdersPage/MyOrders.tsx'));
const StaffLogin = lazy(() => import('../pages/staff/login/StaffLogin.tsx'));
const StaffDashboard = lazy(() => import('../pages/staff/dashboard/dashboard.tsx'));

export default function AppRouter() {
    return (
        // Suspense provides a fallback UI while any lazy component is being fetched.
        <Suspense fallback={<Loading />}>
            <Routes>
                {/* Public routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/menu" element={<MenuPage />} />
                <Route path="/about" element={<AboutUsPage />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/basket" element={<BasketPage />} />
                <Route path="/order-success" element={<OrderSuccessPage />} />

                {/* Protected route: only authenticated users can access `/orders` */}
                <Route
                    path="/orders"
                    element={
                        <ProtectedRoute>
                            <MyOrdersPage />
                        </ProtectedRoute>
                    }
                />

                {/* Staff authentication and protected staff dashboard */}
                <Route path="/staff/login" element={<StaffLogin />} />
                <Route
                    path="/staff/dashboard"
                    element={
                        <StaffProtectedRoute>
                            <StaffDashboard />
                        </StaffProtectedRoute>
                    }
                />

                {/* Catch-all 404 */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Suspense>
    );
}
