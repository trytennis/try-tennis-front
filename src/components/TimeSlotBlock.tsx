import React from "react";
import "../styles/TimeSlotBlock.css";
import type { TimeSlot } from "../types/TimeSlot";

type Props = {
  slot: TimeSlot;
  isSelected: boolean;
  onSelect: (slot: TimeSlot) => void;
};

const TimeSlotBlock = ({ slot, isSelected, onSelect }: Props) => {
  const handleClick = () => {
    if (slot.status === "available") {
      onSelect(slot);
    }
  };

  const blockClass = [
    "time-slot",
    slot.status === "unavailable" ? "unavailable" : "available",
    isSelected ? "selected" : ""
  ].join(" ");

  return (
    <div className={blockClass} onClick={handleClick}>
      <div className="time-range">{`${slot.start} - ${slot.end}`}</div>
      <div className="time-duration">{`${slot.duration ?? "예약"}`}</div>
      {slot.status === "unavailable" && (
        <div className="occupied-badge">예약됨</div>
      )}
    </div>
  );
};

export default TimeSlotBlock;
