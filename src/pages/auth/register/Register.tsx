// File: `src/pages/auth/register/RegisterPage.tsx`
import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {useAuth} from "../../../context/AuthContext";
import RegisterForm from "./RegisterForm";
import Navbar from "../../../components/navbar";
import "../login/login.scss";
import Seo from "../../../components/Seo.tsx";

type FormState = {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
};

export default function RegisterPage() {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [form, setForm] = useState<FormState>({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const validateEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
    const validatePhone = (s: string) => /^\+?[0-9\-\s]{7,20}$/.test(s.trim());

    const errors = {
        name: form.name.trim() ? "" : "Name is required",
        email: validateEmail(form.email) ? "" : "Enter a valid email",
        phone: validatePhone(form.phone) ? "" : "Enter a valid phone number",
        password:
            form.password.length >= 6 ? "" : "Password must be at least 6 characters",
        confirmPassword:
            form.confirmPassword === form.password ? "" : "Passwords do not match",
    };

    const isValid = Object.values(errors).every((e) => e === "");

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const {name, value} = e.target;
        setForm((s) => ({...s, [name]: value}));
    }

    function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
        setTouched((t) => ({...t, [e.target.name]: true}));
    }

    async function handleSubmit(e?: React.FormEvent) {
        if (e) e.preventDefault();
        setTouched({
            name: true,
            email: true,
            phone: true,
            password: true,
            confirmPassword: true,
        });

        if (!isValid) return;

        setLoading(true);
        setServerError(null);

        try {
            await register(
                form.name.trim(),
                form.email.trim(),
                form.phone,
                form.password
            );
            navigate("/login");
        } catch (err: any) {
            setServerError(
                err?.response?.data?.error
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <Seo title="Register" description="Register a new account"/>
            <Navbar/>
            <main className="auth-page">
                <div className="auth-page__card">
                    <h1 className="auth-page__title">Register</h1>

                    <RegisterForm
                        form={form}
                        touched={touched}
                        errors={errors}
                        loading={loading}
                        serverError={serverError}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        onSubmit={handleSubmit}
                        isValid={isValid}
                    />
                </div>
            </main>
        </>
    );
}
