import {AuthProvider} from './context/AuthContext.tsx';
import AppRouter from './router/router.tsx';

export default function App() {
    return (
        <AuthProvider>
            <AppRouter/>
        </AuthProvider>
    )
}