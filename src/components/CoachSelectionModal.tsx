import React, { useEffect, useState } from "react";
import { X, Send } from "lucide-react";
import type { AnalysisHistory } from "../types/AnalysisData";
import type { CoachLite } from "../types/Coach";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    coaches: CoachLite[];
    selectedVideo: AnalysisHistory | null;
    onSubmit: (coachId: string, title: string, message: string) => void;
};

const CoachSelectionModal: React.FC<Props> = ({ isOpen, onClose, coaches, selectedVideo, onSubmit }) => {
    const [coachId, setCoachId] = useState<string>("");
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (isOpen) {
            setCoachId(coaches[0]?.id ?? "");
            setTitle("");
            setMessage("");
        }
    }, [isOpen, coaches]);

    if (!isOpen) return null;

    return (
        <div className="vc-modal-backdrop">
            <div className="vc-modal-card">
                <div className="vc-modal-head">
                    <h3>코칭 요청</h3>
                    <button className="vc-icon-btn" onClick={onClose}><X size={18} /></button>
                </div>

                <div className="vc-modal-body">
                    <div className="vc-field">
                        <label>영상</label>
                        <div className="vc-static">#{selectedVideo?.id.slice(-6)}</div>
                    </div>

                    <div className="vc-field">
                        <label>코치</label>
                        <select className="vc-input" value={coachId} onChange={(e) => setCoachId(e.target.value)}>
                            {coaches.map((c) => <option key={c.id} value={c.id}>{c.name ?? "(이름없음)"}</option>)}
                        </select>
                    </div>

                    <div className="vc-field">
                        <label>제목(선택)</label>
                        <input className="vc-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="요청 제목" />
                    </div>

                    <div className="vc-field">
                        <label>메시지</label>
                        <textarea className="vc-textarea" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="코치에게 전달할 메시지" />
                    </div>
                </div>

                <div className="vc-modal-foot">
                    <button className="vc-btn ghost" onClick={onClose}>취소</button>
                    <button className="vc-btn primary" disabled={!coachId} onClick={() => onSubmit(coachId, title.trim(), message.trim())}>
                        <Send size={16} /> 요청 보내기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CoachSelectionModal;
