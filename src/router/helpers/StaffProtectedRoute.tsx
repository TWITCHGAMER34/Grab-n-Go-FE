import type {ReactNode} from "react";
import {useAuth} from "../../context/AuthContext.tsx";
import {Navigate} from "react-router-dom";

export function StaffProtectedRoute({children}: { children: ReactNode }) {
    const {isStaffLoggedIn, loading} = useAuth();
    if (loading) return <div>Loading...</div>;
    return isStaffLoggedIn ? children : <Navigate to="/staff/login" replace/>;
}