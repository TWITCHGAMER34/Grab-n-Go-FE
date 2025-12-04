import {Suspense, lazy} from 'react';
import {Routes, Route, Navigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
import type {ReactNode} from 'react';

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

function ProtectedRoute({children}: { children: ReactNode }) {
    const {isLoggedIn, loading} = useAuth();
    if (loading) return <div>Loading...</div>;
    return isLoggedIn ? children : <Navigate to="/login" replace/>;
}

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
                    <Route path="*" element={<NotFound/>}/>
                    <Route
                        path="/protected"
                        element={
                            <ProtectedRoute>
                                <div>Protected Content</div>
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </Suspense>
    );
}
