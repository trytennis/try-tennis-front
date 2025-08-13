import React from "react";
import type { Coach } from "../types/Coach";
import "../styles/CoachCard.css";

type Props = {
  coach: Coach;
  isSelected: boolean;
  onClick: () => void;
};

const CoachCard = ({ coach, isSelected, onClick }: Props) => {
  const initial = coach.name?.charAt(0) ?? "?";

  return (
    <div className={`coach-card ${isSelected ? "selected" : ""}`} onClick={onClick}>
      <div className="coach-avatar">
        <span className="coach-initial">{initial}</span>
      </div>
      <div className="coach-info">
        <h3 className="coach-name">{coach.name}</h3>
        <p className="coach-title">{coach.title || "테니스 코치"}</p>
        {coach.phone && <p className="coach-phone">{coach.phone}</p>}
      </div>
      {isSelected && (
        <div className="selected-indicator">
          <span>✓</span>
        </div>
      )}
    </div>
  );
};

export default CoachCard;
