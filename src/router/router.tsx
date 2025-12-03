import {Suspense, lazy} from 'react';
import {Routes, Route, Navigate} from 'react-router-dom';
import {AuthProvider, useAuth} from '../context/AuthContext';
import type {ReactNode} from 'react';

const HomePage = lazy(() => import('../pages/HomePage/Home.tsx'));
const Register = lazy(() => import('../pages/auth/register/Register.tsx'));
const Login = lazy(() => import('../pages/auth/login/Login.tsx'));
const NotFound = lazy(() => import('../pages/NotFound/404.tsx'));
const Loading = lazy(() => import('../components/loading.tsx'));
const MenuPage = lazy(() => import('../pages/MenuPage/Menu.tsx'));
const AboutUsPage = lazy(() => import('../pages/AboutUs/AboutUs.tsx'));

function ProtectedRoute({children}: { children: ReactNode }) {
    const {isLoggedIn, loading} = useAuth();
    if (loading) return <div>Loading...</div>;
    return isLoggedIn ? children : <Navigate to="/login" replace/>;
}

export default function AppRouter() {
    return (
        <AuthProvider>
            <Suspense fallback={<Loading/>}>
                <Routes>
                    <Route path="/" element={<HomePage/>}/>
                    <Route path="/menu" element={<MenuPage/>}/>
                    <Route path="/about" element={<AboutUsPage/>}/>
                    <Route path="/register" element={<Register/>}/>
                    <Route path="/login" element={<Login/>}/>
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
        </AuthProvider>
    );
}
