// File: `src/pages/auth/register/Register.tsx`
import {useState} from 'react';
import type {FormEvent} from 'react';
import {useNavigate} from 'react-router-dom';
import {useAuth} from '../../../context/AuthContext';
import '../login/login.scss';

type FormState = {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
};

export default function Register() {
    const navigate = useNavigate();
    const {register} = useAuth();
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

    const validateEmail = (s: string) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());

    const validatePhone = (s: string) =>
        /^\+?[0-9\-\s]{7,20}$/.test(s.trim());

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

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
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
                form.phone.trim(),
                form.password
            );
            navigate("/login");
        } catch (err: any) {
            setServerError(err?.response?.data?.message ?? err?.message ?? "Registration failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="auth-page">
            <div className="auth-card">
                <h1>Register</h1>

                <form onSubmit={handleSubmit} noValidate>
                    <div className="form-row">
                        <label>
                            Name
                            <input
                                name="name"
                                type="text"
                                value={form.name}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                                disabled={loading}
                            />
                        </label>
                        {touched.name && errors.name && (
                            <div className="error-text">{errors.name}</div>
                        )}
                    </div>

                    <div className="form-row">
                        <label>
                            Email
                            <input
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                                disabled={loading}
                            />
                        </label>
                        {touched.email && errors.email && (
                            <div className="error-text">{errors.email}</div>
                        )}
                    </div>

                    <div className="form-row">
                        <label>
                            Phone
                            <input
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                type="tel"
                                required
                                disabled={loading}
                            />
                        </label>
                        {touched.phone && errors.phone && (
                            <div className="error-text">{errors.phone}</div>
                        )}
                    </div>

                    <div className="form-row">
                        <label>
                            Password
                            <input
                                name="password"
                                type="password"
                                value={form.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                                disabled={loading}
                            />
                        </label>
                        {touched.password && errors.password && (
                            <div className="error-text">{errors.password}</div>
                        )}
                    </div>

                    <div className="form-row">
                        <label>
                            Confirm Password
                            <input
                                name="confirmPassword"
                                type="password"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                                disabled={loading}
                            />
                        </label>
                        {touched.confirmPassword && errors.confirmPassword && (
                            <div className="error-text">{errors.confirmPassword}</div>
                        )}
                    </div>

                    {serverError && (
                        <div className="server-error">{serverError}</div>
                    )}

                    <div className="actions">
                        <button
                            type="submit"
                            disabled={loading || !isValid}
                            className="submit-btn"
                        >
                            {loading ? "Registering…" : "Register"}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}
