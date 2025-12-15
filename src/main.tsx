import {createRoot} from 'react-dom/client'
import './Global.scss'
import App from './App'
import {AuthProvider} from "./context/AuthContext";
import {BrowserRouter} from "react-router-dom";
import {HelmetProvider} from 'react-helmet-async';
import axios from "axios";

axios.defaults.withCredentials = true;

createRoot(document.getElementById('root')!).render(
    <AuthProvider>
        <BrowserRouter>
            <HelmetProvider>
                <App/>
            </HelmetProvider>
        </BrowserRouter>
    </AuthProvider>
)
