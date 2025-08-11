export interface TimeSlot {
    time: string; // "09:00", "09:20", "09:40" 등
    isAvailable: boolean;
    reservationId?: string; // 예약된 경우 예약 ID
}

export interface CoachSchedule {
    coach_id: string;
    coach_name: string;
    date: string; // "2024-08-15"
    timeSlots: TimeSlot[];
}

export interface PersonalReservation {
    id: string;
    user_id: string;
    coach_id: string;
    date: string;
    start_time: string; // "09:00"
    end_time: string; // "09:20"
    user_ticket_id: string;
    status: 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed';
    attendance_status?: 'attended' | 'absent' | 'no_show';
    memo?: string;
    admin_memo?: string;
    created_at: string;
    updated_at: string;

    // 관계 데이터
    coach?: {
        name: string;
        phone?: string;
    };
    user_ticket?: {
        remaining_count: number;
        ticket: {
            name: string;
            price: number;
        };
    };
}

export interface Coach {
    id: string;
    name: string;
    phone?: string;
    facility_id: string;
}

export interface CreatePersonalReservationData {
    user_id: string;
    coach_id: string;
    date: string;
    start_time: string;
    user_ticket_id: string;
    memo?: string;
}

// 20분 단위 타임슬롯 생성 헬퍼
export const generateTimeSlots = (
    startHour: number = 9,
    endHour: number = 21
): string[] => {
    const slots: string[] = [];

    for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += 20) {
            const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            slots.push(timeString);
        }
    }

    return slots;
};

// 시간 문자열을 20분 후로 변환
export const addTwentyMinutes = (timeString: string): string => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + 20;

    const newHours = Math.floor(totalMinutes / 60);
    const newMinutes = totalMinutes % 60;

    return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
};