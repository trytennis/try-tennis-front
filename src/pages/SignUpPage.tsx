import React, { useState } from "react";
import { Mail, Eye, EyeOff, User, Shield, Lock, CheckCircle } from "lucide-react";
import "../styles/SignUpPage.css";
import { signUp } from "../utils/auth";
import logo from '../assets/thetry_logo.png';

type Errors = Record<string, string>;

const facilities = [
    { id: "550e8400-e29b-41d4-a716-446655440001", name: "서울 골프 아카데미" },
    { id: "550e8400-e29b-41d4-a716-446655440002", name: "강남 스포츠센터" },
    { id: "550e8400-e29b-41d4-a716-446655440003", name: "부산 골프클럽" },
    { id: "550e8400-e29b-41d4-a716-446655440004", name: "대전 실내 골프장" },
];

export default function SignUpPage() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        name: "",
        phone: "",
        gender: "",
        birthdate: "",
        user_type: "student",
        facility_id: "",
        memo: "",
        terms_agreed: false,
        privacy_agreed: false,
        consent_service_notice: true,
        consent_marketing: false,
    });

    const [errors, setErrors] = useState<Errors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [signupStep, setSignupStep] = useState<"form" | "verify" | "complete">("form");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
        const { name, value, type } = e.target as HTMLInputElement;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
        if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
    }

    function validateForm() {
        const newErrors: Errors = {};
        if (!formData.email.trim()) newErrors.email = "이메일을 입력해주세요.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "올바른 이메일 형식이 아닙니다.";

        if (!formData.password) newErrors.password = "비밀번호를 입력해주세요.";
        else if (formData.password.length < 8) newErrors.password = "비밀번호는 8자 이상이어야 합니다.";

        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "비밀번호가 일치하지 않습니다.";
        if (!formData.name.trim()) newErrors.name = "이름을 입력해주세요.";
        if (!formData.phone.trim()) newErrors.phone = "전화번호를 입력해주세요.";
        if (!formData.terms_agreed) newErrors.terms_agreed = "이용약관에 동의해주세요.";
        if (!formData.privacy_agreed) newErrors.privacy_agreed = "개인정보처리방침에 동의해주세요.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    async function handleSupabaseSignup() {
        if (!validateForm()) return;
        setIsSubmitting(true);
        try {
            // 실제 supabase 회원가입 호출 (메타데이터 → DB 트리거가 profiles 생성)
            await signUp(formData.email, formData.password, formData.name, formData.phone);
            setSignupStep("verify"); // 이메일 인증 안내 화면으로
        } catch (e: any) {
            const msg = e?.message || "회원가입 중 오류가 발생했습니다.";
            setErrors({ submit: msg });
        } finally {
            setIsSubmitting(false);
        }
    }

    // 이메일 인증 단계 (메일 클릭 후 /auth/callback으로 돌아오면 자동 로그인 처리)
    if (signupStep === "verify") {
        return (
            <div className="su__screen u-hero-bg">
                <div className="su__card u-card su__center">
                    <div className="su__icon-round" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
                        <Mail size={28} />
                    </div>
                    <h2 className="su__title u-text">이메일 인증</h2>
                    <p className="su__desc u-text-muted">
                        <strong>{formData.email}</strong> 로 인증 이메일을 발송했어요.<br />
                        이메일을 확인하고 인증을 완료해 주세요.
                    </p>

                    <div className="su__stack">
                        <button className="btn btn--primary" onClick={() => setSignupStep("complete")}>
                            인증 완료됨 (데모용)
                        </button>
                        <button className="btn btn--accent" onClick={() => setSignupStep("form")}>
                            이메일 수정하기
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // 가입 완료 단계
    if (signupStep === "complete") {
        return (
            <div className="su__screen u-hero-bg">
                <div className="su__card u-card su__center">
                    <div className="su__icon-round" style={{ background: '#d1fae5', color: '#047857' }}>
                        <CheckCircle size={28} />
                    </div>
                    <h2 className="su__title u-text">가입 완료!</h2>
                    <p className="su__desc u-text-muted">
                        환영합니다, <strong>{formData.name}</strong>님!
                    </p>

                    <div className="su__box">
                        <h3 className="su__box-title u-text">가입 정보</h3>
                        <div className="su__info u-text">
                            <p>이메일: {formData.email}</p>
                            <p>이름: {formData.name}</p>
                            <p>
                                회원 유형: {formData.user_type === "student" ? "학생" :
                                    formData.user_type === "coach" ? "코치" : "시설 관리자"}
                            </p>
                            {formData.facility_id && <p>소속 시설: {facilities.find(f => f.id === formData.facility_id)?.name}</p>}
                        </div>
                    </div>

                    <button className="btn btn--primary" onClick={() => (window.location.href = "/videos")}>
                        서비스 시작하기
                    </button>
                </div>
            </div>
        );
    }

    // 회원가입 폼
    return (
        <div className="su__screen u-hero-bg">
            <div className="su__container">
                <div className="su__header">
                    <img src={logo} className="su__logo-medium-icon" alt="TheTry Logo" />
                </div>

                <div className="su__card u-card">
                    {/* 가입 정보 */}
                    <div className="su__section">
                        <h2 className="su__section-title u-text">
                            <Lock size={18} className="su__icon-inline u-text-brand" />
                            가입 정보
                        </h2>

                        <div className="su__field">
                            <label className="su__label u-text-muted">
                                이메일 <span className="su__req">*</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className={`u-input ${errors.email ? "u-input--error" : ""}`}
                                placeholder="you@example.com"
                            />
                            {errors.email && <p className="su__error">{errors.email}</p>}
                        </div>

                        <div className="su__grid">
                            <div className="su__field">
                                <label className="su__label u-text-muted">
                                    비밀번호 <span className="su__req">*</span>
                                </label>
                                <div className="su__input-wrap">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className={`u-input su__input-withbtn ${errors.password ? "u-input--error" : ""}`}
                                        placeholder="8자 이상 입력"
                                    />
                                    <button type="button" className="u-input-btn"
                                        onClick={() => setShowPassword(s => !s)}
                                        aria-label="비밀번호 표시 전환">
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {errors.password && <p className="su__error">{errors.password}</p>}
                            </div>

                            <div className="su__field">
                                <label className="su__label u-text-muted">
                                    비밀번호 확인 <span className="su__req">*</span>
                                </label>
                                <div className="su__input-wrap">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        className={`u-input su__input-withbtn ${errors.confirmPassword ? "u-input--error" : ""}`}
                                        placeholder="비밀번호를 다시 입력"
                                    />
                                    <button type="button" className="u-input-btn"
                                        onClick={() => setShowConfirmPassword(s => !s)}
                                        aria-label="비밀번호 확인 표시 전환">
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {errors.confirmPassword && <p className="su__error">{errors.confirmPassword}</p>}
                            </div>
                        </div>
                    </div>

                    {/* 프로필 정보 */}
                    <div className="su__section">
                        <h2 className="su__section-title u-text">
                            <User size={18} className="su__icon-inline u-text-brand" />
                            프로필 정보
                        </h2>

                        <div className="su__grid">
                            <div className="su__field">
                                <label className="su__label u-text-muted">
                                    이름 <span className="su__req">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className={`u-input ${errors.name ? "u-input--error" : ""}`}
                                    placeholder="홍길동"
                                />
                                {errors.name && <p className="su__error">{errors.name}</p>}
                            </div>

                            <div className="su__field">
                                <label className="su__label u-text-muted">
                                    전화번호 <span className="su__req">*</span>
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className={`u-input ${errors.phone ? "u-input--error" : ""}`}
                                    placeholder="010-1234-5678"
                                />
                                {errors.phone && <p className="su__error">{errors.phone}</p>}
                            </div>
                        </div>

                        <div className="su__grid-3">
                            <div className="su__field">
                                <label className="su__label u-text-muted">성별</label>
                                <select name="gender" value={formData.gender}
                                    onChange={handleInputChange} className="u-input">
                                    <option value="">선택하세요</option>
                                    <option value="male">남성</option>
                                    <option value="female">여성</option>
                                    <option value="other">기타</option>
                                </select>
                            </div>

                            <div className="su__field">
                                <label className="su__label u-text-muted">생년월일</label>
                                <input type="date" name="birthdate"
                                    value={formData.birthdate}
                                    onChange={handleInputChange} className="u-input" />
                            </div>

                            <div className="su__field">
                                <label className="su__label u-text-muted">회원 유형</label>
                                <select name="user_type" value={formData.user_type}
                                    onChange={handleInputChange} className="u-input">
                                    <option value="student">학생</option>
                                    <option value="coach">코치</option>
                                    <option value="facility_admin">시설 관리자</option>
                                </select>
                            </div>
                        </div>

                        <div className="su__field">
                            <label className="su__label u-text-muted">소속 시설</label>
                            <select name="facility_id" value={formData.facility_id}
                                onChange={handleInputChange} className="u-input">
                                <option value="">선택하세요</option>
                                {facilities.map(f => (
                                    <option key={f.id} value={f.id}>{f.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="su__field">
                            <label className="su__label u-text-muted">메모</label>
                            <textarea
                                name="memo" rows={3}
                                value={formData.memo} onChange={handleInputChange}
                                className="u-input" placeholder="추가 정보가 있으시면 적어주세요."
                            />
                        </div>
                    </div>

                    {/* 약관 동의 */}
                    <div className="su__section">
                        <h2 className="su__section-title u-text">
                            <Shield size={18} className="su__icon-inline u-text-brand" />
                            약관 동의
                        </h2>

                        <div className="su__agree">
                            <label className="su__checkbox">
                                <input type="checkbox" name="terms_agreed"
                                    checked={formData.terms_agreed} onChange={handleInputChange} />
                                <div>
                                    <span className="su__checkbox-title">
                                        <span className="su__req">*</span> 이용약관에 동의합니다.
                                    </span>
                                    <span className="su__checkbox-desc u-text-muted">서비스 이용을 위한 필수 약관입니다.</span>
                                    {errors.terms_agreed && <p className="su__error su__error-small">{errors.terms_agreed}</p>}
                                </div>
                                <button type="button" className="u-link">보기</button>
                            </label>

                            <label className="su__checkbox">
                                <input type="checkbox" name="privacy_agreed"
                                    checked={formData.privacy_agreed} onChange={handleInputChange} />
                                <div>
                                    <span className="su__checkbox-title">
                                        <span className="su__req">*</span> 개인 정보 처리 방침에 동의합니다.
                                    </span>
                                    <span className="su__checkbox-desc u-text-muted">개인정보 수집 및 이용에 대한 필수 동의입니다.</span>
                                    {errors.privacy_agreed && <p className="su__error su__error-small">{errors.privacy_agreed}</p>}
                                </div>
                                <button type="button" className="u-link">보기</button>
                            </label>

                            <label className="su__checkbox su__checkbox-soft">
                                <input type="checkbox" name="consent_service_notice"
                                    checked={formData.consent_service_notice} onChange={handleInputChange} />
                                <div>
                                    <span className="su__checkbox-title">(선택) 서비스 알림 수신에 동의합니다.</span>
                                    <span className="su__checkbox-desc u-text-muted">분석 완료, 중요 공지사항 등</span>
                                </div>
                            </label>

                            <label className="su__checkbox su__checkbox-soft">
                                <input type="checkbox" name="consent_marketing"
                                    checked={formData.consent_marketing} onChange={handleInputChange} />
                                <div>
                                    <span className="su__checkbox-title">(선택) 마케팅 정보 수신에 동의합니다.</span>
                                    <span className="su__checkbox-desc u-text-muted">이벤트, 프로모션 등</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* 제출 */}
                    {errors.submit && <div className="alert--error">{errors.submit}</div>}

                    <div className="su__actions">
                        <button
                            type="button"
                            onClick={handleSupabaseSignup}
                            disabled={isSubmitting}
                            className={`btn btn--primary su__btn-block ${isSubmitting ? "btn--disabled" : ""}`}
                        >
                            {isSubmitting ? (
                                <span className="u-spinner">
                                    <span className="u-spinner-dot" />
                                    Supabase 회원가입 처리중...
                                </span>
                            ) : ("회원가입")}
                        </button>

                        <p className="su__footnote u-text-muted">
                            이미 계정이 있으신가요? <a href="/login" className="u-link">로그인하기</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
