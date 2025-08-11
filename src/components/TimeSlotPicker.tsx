import type { TimeSlot } from '../types/PersonalLesson';
import { addTwentyMinutes } from '../types/PersonalLesson';
import '../styles/TimeSlotPicker.css';

interface Props {
    timeSlots: TimeSlot[];
    selectedTimeSlot: string | null;
    onTimeSlotSelect: (timeSlot: string) => void;
    coachName: string;
}

const TimeSlotPicker = ({ timeSlots, selectedTimeSlot, onTimeSlotSelect, coachName }: Props) => {
    // 시간대별로 그룹화 (오전, 오후, 저녁)
    const groupTimeSlots = () => {
        const morning = timeSlots.filter(slot => {
            const hour = parseInt(slot.time.split(':')[0]);
            return hour >= 9 && hour < 12;
        });

        const afternoon = timeSlots.filter(slot => {
            const hour = parseInt(slot.time.split(':')[0]);
            return hour >= 12 && hour < 18;
        });

        const evening = timeSlots.filter(slot => {
            const hour = parseInt(slot.time.split(':')[0]);
            return hour >= 18 && hour < 21;
        });

        return { morning, afternoon, evening };
    };

    const { morning, afternoon, evening } = groupTimeSlots();

    const TimeSlotGroup = ({ title, slots }: { title: string; slots: TimeSlot[] }) => (
        <div className="time-group">
            <h3 className="time-group-title">{title}</h3>
            <div className="time-slots-grid">
                {slots.map((slot) => (
                    <button
                        key={slot.time}
                        className={`time-slot ${!slot.isAvailable
                                ? 'occupied'
                                : selectedTimeSlot === slot.time
                                    ? 'selected'
                                    : 'available'
                            }`}
                        onClick={() => slot.isAvailable && onTimeSlotSelect(slot.time)}
                        disabled={!slot.isAvailable}
                    >
                        <div className="time-range">
                            {slot.time} - {addTwentyMinutes(slot.time)}
                        </div>
                        <div className="time-duration">20분</div>
                        {!slot.isAvailable && (
                            <div className="occupied-badge">예약됨</div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );

    const availableCount = timeSlots.filter(slot => slot.isAvailable).length;
    const totalCount = timeSlots.length;

    return (
        <div className="time-slot-picker">
            <div className="picker-header">
                <div className="coach-info">
                    <h3>{coachName} 코치</h3>
                    <p>
                        예약 가능: {availableCount}개 / 전체: {totalCount}개
                    </p>
                </div>
                <div className="legend">
                    <div className="legend-item">
                        <div className="legend-color available"></div>
                        <span>예약 가능</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-color occupied"></div>
                        <span>예약됨</span>
                    </div>
                </div>
            </div>

            {availableCount === 0 ? (
                <div className="no-slots">
                    <div className="no-slots-icon">📅</div>
                    <h3>예약 가능한 시간이 없습니다</h3>
                    <p>다른 날짜나 코치를 선택해보세요.</p>
                </div>
            ) : (
                <div className="time-groups">
                    {morning.length > 0 && (
                        <TimeSlotGroup title="오전 (9:00 - 12:00)" slots={morning} />
                    )}
                    {afternoon.length > 0 && (
                        <TimeSlotGroup title="오후 (12:00 - 18:00)" slots={afternoon} />
                    )}
                    {evening.length > 0 && (
                        <TimeSlotGroup title="저녁 (18:00 - 21:00)" slots={evening} />
                    )}
                </div>
            )}

            {selectedTimeSlot && (
                <div className="selected-slot-info">
                    <div className="selected-indicator">
                        <span className="check-icon">✓</span>
                        <span className="selected-text">
                            선택된 시간: {selectedTimeSlot} - {addTwentyMinutes(selectedTimeSlot)} (20분)
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TimeSlotPicker;