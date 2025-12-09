import type {ReactNode} from "react";
import {useAuth} from "../../context/AuthContext.tsx";
import {Navigate} from "react-router-dom";

export function ProtectedRoute({children}: { children: ReactNode }) {
    const {isLoggedIn, loading} = useAuth();
    if (loading) return <div>Loading...</div>;
    return isLoggedIn ? children : <Navigate to="/login" replace/>;
}