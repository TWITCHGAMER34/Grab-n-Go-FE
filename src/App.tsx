import {AuthProvider} from './context/AuthContext.tsx';
import AppRouter from './router/router.tsx';
import {CartProvider} from "./context/CartContext.tsx";

export default function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <AppRouter/>
            </CartProvider>
        </AuthProvider>
    )
}