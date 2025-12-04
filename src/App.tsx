import AppRouter from './router/router';
import {CartProvider} from "./context/CartContext";

export default function App() {
    return (
        <CartProvider>
            <AppRouter/>
        </CartProvider>
    )
}