import React, { useState } from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/LoginPage.css";
import { signIn } from "../utils/auth";
import logo from '../assets/thetry_logo.png';

type Errors = Record<string, string>;

export default function LoginPage() {
    const nav = useNavigate();
    const [form, setForm] = useState({ email: "", password: "" });
    const [showPw, setShowPw] = useState(false);
    const [err, setErr] = useState<Errors>({});
    const [pending, setPending] = useState(false);

    function onChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setForm((p) => ({ ...p, [name]: value }));
        if (err[name]) setErr((e) => ({ ...e, [name]: "" }));
        if (err.submit) setErr((e) => ({ ...e, submit: "" }));
    }

    function validate() {
        const next: Errors = {};
        if (!form.email.trim()) next.email = "이메일을 입력해주세요.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "올바른 이메일 형식이 아닙니다.";
        if (!form.password) next.password = "비밀번호를 입력해주세요.";
        setErr(next);
        return Object.keys(next).length === 0;
    }

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!validate()) return;
        setPending(true);
        try {
            await signIn(form.email, form.password);
            nav("/videos", { replace: true });
        } catch (e: any) {
            const msg = e?.message || "";
            if (msg.toLowerCase().includes("confirm") || msg.includes("not confirmed")) {
                setErr({ submit: "이메일 인증 후 로그인해 주세요." });
            } else if (msg.toLowerCase().includes("invalid login credentials")) {
                setErr({ submit: "이메일 또는 비밀번호를 확인해주세요." });
            } else {
                setErr({ submit: msg || "로그인 중 오류가 발생했습니다." });
            }
        } finally {
            setPending(false);
        }
    }


    return (
        <div className="lg__screen u-hero-bg">
            <div className="lg__container">
                <img src={logo} className="lg__logo-medium-icon" alt="TheTry Logo" />

                <div className="lg__card u-card">
                    <div className="lg__header">
                        <h1 className="lg__title u-text">로그인</h1>
                        <p className="lg__subtitle u-text-muted">이메일과 비밀번호로 로그인해 주세요</p>
                    </div>

                    <form className="lg__form" onSubmit={onSubmit}>
                        <div className="lg__field">
                            <label className="lg__label u-text-muted">
                                <Mail size={16} className="lg__icon-inline" /> 이메일
                            </label>
                            <input
                                className={`u-input ${err.email ? "u-input--error" : ""}`}
                                type="email"
                                name="email"
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={onChange}
                                autoComplete="email"
                            />
                            {err.email && <p className="lg__error">{err.email}</p>}
                        </div>

                        <div className="lg__field">
                            <label className="lg__label u-text-muted">
                                <Lock size={16} className="lg__icon-inline" /> 비밀번호
                            </label>
                            <div className="lg__input-wrap">
                                <input
                                    className={`u-input lg__input-withbtn ${err.password ? "u-input--error" : ""}`}
                                    type={showPw ? "text" : "password"}
                                    name="password"
                                    placeholder="비밀번호를 입력하세요"
                                    value={form.password}
                                    onChange={onChange}
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    className="u-input-btn"
                                    onClick={() => setShowPw((s) => !s)}
                                    aria-label="비밀번호 표시 전환"
                                >
                                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {err.password && <p className="lg__error">{err.password}</p>}
                        </div>

                        {err.submit && <div className="alert--error">{err.submit}</div>}

                        <button
                            className={`btn btn--primary ${pending ? "btn--disabled" : ""}`}
                            disabled={pending}
                        >
                            {pending ? (
                                <span className="u-spinner">
                                    <span className="u-spinner-dot" />
                                    로그인 중...
                                </span>
                            ) : (
                                "로그인"
                            )}
                        </button>

                        <div className="lg__links">
                            <Link to="/signup" className="u-link">회원가입</Link>
                            <a href="/auth/reset" className="u-link">비밀번호 재설정</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );

}
