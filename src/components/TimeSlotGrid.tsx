import React from "react";
import type { TimeSlot } from "../types/TimeSlot";
import TimeSlotBlock from "./TimeSlotBlock";
import "../styles/TimeSlotGrid.css";

type Props = {
    slots: TimeSlot[];
    selectedSlot: TimeSlot | null;
    onSelect: (slot: TimeSlot) => void;
};

const TimeSlotGrid = ({ slots, selectedSlot, onSelect }: Props) => {
    // 시간대 기준 나누기 (오전: <12, 오후: <18, 저녁: >=18)
    const grouped = {
        morning: slots.filter((s) => parseInt(s.start.split(":")[0]) < 12),
        afternoon: slots.filter((s) => {
            const h = parseInt(s.start.split(":")[0]);
            return h >= 12 && h < 18;
        }),
        evening: slots.filter((s) => parseInt(s.start.split(":")[0]) >= 18),
    };

    return (
        <div className="time-slot-grid-wrapper">
            {Object.entries(grouped).map(([label, group]) => (
                <div className="time-group" key={label}>
                    <h3 className="time-group-title">
                        {label === "morning" && "오전 (9:00 - 12:00)"}
                        {label === "afternoon" && "오후 (12:00 - 18:00)"}
                        {label === "evening" && "저녁 (18:00 - 21:00)"}
                    </h3>
                    <div className="time-slots-grid">
                        {group.map((slot) => (
                            <TimeSlotBlock
                                key={`${slot.start}-${slot.end}`}
                                slot={slot}
                                isSelected={
                                    selectedSlot?.start === slot.start &&
                                    selectedSlot?.end === slot.end
                                }
                                onSelect={onSelect}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TimeSlotGrid;
