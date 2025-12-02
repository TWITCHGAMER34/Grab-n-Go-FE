import {createRoot} from 'react-dom/client'
import './Global.scss'
import App from './App'
import {AuthProvider} from "./context/AuthContext.tsx";
import {BrowserRouter} from "react-router-dom";
import axios from "axios";

axios.defaults.withCredentials = true;

createRoot(document.getElementById('root')!).render(
    <AuthProvider>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </AuthProvider>
)
