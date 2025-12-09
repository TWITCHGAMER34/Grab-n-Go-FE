import {Suspense, lazy} from 'react';
import {Routes, Route} from 'react-router-dom';
import {ProtectedRoute} from './helpers/ProtectedRoute.tsx';
import {StaffProtectedRoute} from './helpers/StaffProtectedRoute.tsx';

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
        <Suspense fallback={<Loading/>}>
            <Routes>
                <Route path="/" element={<HomePage/>}/>
                <Route path="/menu" element={<MenuPage/>}/>
                <Route path="/about" element={<AboutUsPage/>}/>
                <Route path="/register" element={<Register/>}/>
                <Route path="/login" element={<Login/>}/>
                <Route path="/basket" element={<BasketPage/>}/>
                <Route path="/order-success" element={<OrderSuccessPage/>}/>
                <Route path="/orders" element={
                    <ProtectedRoute>
                        <MyOrdersPage/>
                    </ProtectedRoute>
                }/>
                <Route path="/staff/login" element={<StaffLogin/>}/>
                <Route path="/staff/dashboard" element={
                    <StaffProtectedRoute>
                        <StaffDashboard/>
                    </StaffProtectedRoute>
                }/>
                <Route path="*" element={<NotFound/>}/>
            </Routes>
        </Suspense>
    );
}
