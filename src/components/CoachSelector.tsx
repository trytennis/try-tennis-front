import type { Coach } from '../types/PersonalLesson';
import '../styles/CoachSelector.css';

interface Props {
    coaches: Coach[];
    selectedCoach: Coach | null;
    onCoachSelect: (coach: Coach) => void;
}

const CoachSelector = ({ coaches, selectedCoach, onCoachSelect }: Props) => {
    return (
        <div className="coach-selector">
            {coaches.length === 0 ? (
                <div className="no-coaches">
                    <p>등록된 코치가 없습니다.</p>
                </div>
            ) : (
                <div className="coach-grid">
                    {coaches.map((coach) => (
                        <div
                            key={coach.id}
                            className={`coach-card ${selectedCoach?.id === coach.id ? 'selected' : ''}`}
                            onClick={() => onCoachSelect(coach)}
                        >
                            <div className="coach-avatar">
                                <span className="coach-initial">
                                    {coach.name.charAt(0)}
                                </span>
                            </div>
                            <div className="coach-info">
                                <h3 className="coach-name">{coach.name}</h3>
                                <p className="coach-title">코치</p>
                                {coach.phone && (
                                    <p className="coach-phone">{coach.phone}</p>
                                )}
                            </div>
                            {selectedCoach?.id === coach.id && (
                                <div className="selected-indicator">
                                    <span>✓</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CoachSelector;