export type TimeSlot = {
    start: string; // "14:00"
    end: string;   // "14:30"
    status: "available" | "unavailable";
    duration?: string; // "30분" 등 표시용 (optional)
};
