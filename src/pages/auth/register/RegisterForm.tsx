// File: `src/pages/auth/register/RegisterForm.tsx`
import React from "react";
import { Link } from "react-router-dom";

type FormState = {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
};

type Props = {
    form: FormState;
    touched: Record<string, boolean>;
    errors: Record<keyof FormState, string>;
    loading: boolean;
    serverError: string | null;
    isValid: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
    onSubmit: (e?: React.FormEvent) => void;
};

export default function RegisterForm({
                                         form,
                                         touched,
                                         errors,
                                         loading,
                                         serverError,
                                         isValid,
                                         onChange,
                                         onBlur,
                                         onSubmit,
                                     }: Props) {
    return (
        <form className="auth-page__form" onSubmit={onSubmit} noValidate>
            <div className="auth-page__form-row">
                <label>
                    Name
                    <input
                        name="name"
                        type="text"
                        value={form.name}
                        onChange={onChange}
                        onBlur={onBlur}
                        required
                        disabled={loading}
                    />
                </label>
                {touched.name && errors.name && (
                    <div className="auth-page__error-text">{errors.name}</div>
                )}
            </div>

            <div className="auth-page__form-row">
                <label>
                    Email
                    <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={onChange}
                        onBlur={onBlur}
                        required
                        disabled={loading}
                    />
                </label>
                {touched.email && errors.email && (
                    <div className="auth-page__error-text">{errors.email}</div>
                )}
            </div>

            <div className="auth-page__form-row">
                <label>
                    Phone
                    <input
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={onChange}
                        onBlur={onBlur}
                        required
                        disabled={loading}
                    />
                </label>
                {touched.phone && errors.phone && (
                    <div className="auth-page__error-text">{errors.phone}</div>
                )}
            </div>

            <div className="auth-page__form-row">
                <label>
                    Password
                    <input
                        name="password"
                        type="password"
                        value={form.password}
                        onChange={onChange}
                        onBlur={onBlur}
                        required
                        disabled={loading}
                    />
                </label>
                {touched.password && errors.password && (
                    <div className="auth-page__error-text">{errors.password}</div>
                )}
            </div>

            <div className="auth-page__form-row">
                <label>
                    Confirm Password
                    <input
                        name="confirmPassword"
                        type="password"
                        value={form.confirmPassword}
                        onChange={onChange}
                        onBlur={onBlur}
                        required
                        disabled={loading}
                    />
                </label>
                {touched.confirmPassword && errors.confirmPassword && (
                    <div className="auth-page__error-text">
                        {errors.confirmPassword}
                    </div>
                )}
            </div>

            <p className="auth-page__helper">
                Har du redan ett konto? Klicka <Link to="/login">här</Link>
            </p>

            {serverError && (
                <div className="auth-page__server-error" role="alert">
                    {serverError}
                </div>
            )}

            <div className="auth-page__actions">
                <button
                    type="submit"
                    disabled={loading || !isValid}
                    className="auth-page__submit-btn"
                >
                    {loading ? "Registering…" : "Register"}
                </button>
            </div>
        </form>
    );
}