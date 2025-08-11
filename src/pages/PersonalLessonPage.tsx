import { useEffect, useState } from 'react';
import { get, post } from '../utils/api';
import type { Coach, TimeSlot, CreatePersonalReservationData } from '../types/PersonalLesson';
import type { UserTicket } from '../types/UserTicket';
import CoachSelector from '../components/CoachSelector';
import TimeSlotPicker from '../components/TimeSlotPicker';
import PersonalReservationModal from '../components/PersonalReservationModal';
import '../styles/PersonalLessonPage.css';

const PersonalLessonPage = () => {
    const [selectedDate, setSelectedDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    });
    const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
    const [coaches, setCoaches] = useState<Coach[]>([]);
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [userTickets, setUserTickets] = useState<UserTicket[]>([]);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
    const [showReservationModal, setShowReservationModal] = useState(false);
    const [loading, setLoading] = useState(false);

    // TODO: 실제 로그인 구현 후 userId는 인증에서 가져올 것
    const userId = 'temp-user-id'; // 임시
    const facilityId = 'temp-facility-id'; // 임시

    const fetchCoaches = async () => {
        try {
            const data = await get<Coach[]>(`/api/coaches?facility_id=${facilityId}`);
            setCoaches(data);
        } catch (err) {
            console.error('코치 목록 조회 실패:', err);
        }
    };

    const fetchTimeSlots = async () => {
        if (!selectedCoach || !selectedDate) return;

        setLoading(true);
        try {
            const data = await get<TimeSlot[]>(
                `/api/coaches/${selectedCoach.id}/time-slots?date=${selectedDate}`
            );
            setTimeSlots(data);
        } catch (err) {
            console.error('시간 슬롯 조회 실패:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserTickets = async () => {
        try {
            const tickets = await get<UserTicket[]>(`/api/users/${userId}/tickets/active`);
            setUserTickets(tickets);
        } catch (err) {
            console.error('수강권 조회 실패:', err);
        }
    };

    const handleCoachSelect = (coach: Coach) => {
        setSelectedCoach(coach);
        setSelectedTimeSlot(null); // 코치 변경시 선택된 시간 초기화
    };

    const handleTimeSlotSelect = (timeSlot: string) => {
        setSelectedTimeSlot(timeSlot);
        setShowReservationModal(true);
    };

    const handleReservationConfirm = async (data: CreatePersonalReservationData) => {
        try {
            await post('/api/personal-reservations', data);
            alert('예약 요청이 완료되었습니다. 코치 승인을 기다려주세요.');

            // 상태 초기화 및 새로고침
            setShowReservationModal(false);
            setSelectedTimeSlot(null);
            await fetchTimeSlots(); // 시간 슬롯 새로고침
            await fetchUserTickets(); // 수강권 정보 새로고침
        } catch (err) {
            console.error('예약 실패:', err);
            alert('예약에 실패했습니다. 다시 시도해주세요.');
        }
    };

    useEffect(() => {
        fetchCoaches();
        fetchUserTickets();
    }, []);

    useEffect(() => {
        fetchTimeSlots();
    }, [selectedCoach, selectedDate]);

    const formatDateKorean = (dateString: string) => {
        const date = new Date(dateString);
        const days = ['일', '월', '화', '수', '목', '금', '토'];
        const dayOfWeek = days[date.getDay()];

        return `${date.getMonth() + 1}월 ${date.getDate()}일 (${dayOfWeek})`;
    };

    const availableTickets = userTickets.filter(ticket => {
        const today = new Date();
        const expiresAt = new Date(ticket.expires_at);
        return ticket.remaining_count > 0 && expiresAt >= today;
    });

    return (
        <main className="personal-lesson-main">
            <div className="lesson-header">
                <h1>개인 레슨 예약</h1>
                <p>코치와 1:1로 진행되는 20분 개인 레슨을 예약하세요</p>
            </div>

            {/* 수강권 현황 */}
            <div className="ticket-status">
                <h2>보유 수강권</h2>
                {availableTickets.length === 0 ? (
                    <div className="no-tickets">
                        <div className="notice-icon">🎫</div>
                        <h3>사용 가능한 수강권이 없습니다</h3>
                        <p>개인 레슨을 예약하려면 먼저 수강권을 구매해주세요.</p>
                    </div>
                ) : (
                    <div className="ticket-grid">
                        {availableTickets.map((ticket) => (
                            <div key={ticket.ticket_id} className="ticket-card compact">
                                <div className="ticket-name">{ticket.tickets.name}</div>
                                <div className="ticket-count">
                                    <span className="remaining">{ticket.remaining_count}</span>
                                    <span className="total">/{ticket.tickets.lesson_count}회</span>
                                </div>
                                <div className="ticket-expires">
                                    {new Date(ticket.expires_at).toLocaleDateString()} 만료
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {availableTickets.length > 0 && (
                <>
                    {/* 날짜 선택 */}
                    <div className="date-selector">
                        <h2>날짜 선택</h2>
                        <div className="date-input-container">
                            <input
                                type="date"
                                id="lesson-date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                            />
                            {selectedDate && (
                                <span className="date-display">
                                    {formatDateKorean(selectedDate)}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* 코치 선택 */}
                    <div className="coach-selection">
                        <h2>코치 선택</h2>
                        <CoachSelector
                            coaches={coaches}
                            selectedCoach={selectedCoach}
                            onCoachSelect={handleCoachSelect}
                        />
                    </div>

                    {/* 시간 선택 */}
                    {selectedCoach && (
                        <div className="time-selection">
                            <h2>시간 선택 (20분 단위)</h2>
                            {loading ? (
                                <div className="loading-state">
                                    <div className="loading-spinner"></div>
                                    <p>가능한 시간을 불러오는 중...</p>
                                </div>
                            ) : (
                                <TimeSlotPicker
                                    timeSlots={timeSlots}
                                    selectedTimeSlot={selectedTimeSlot}
                                    onTimeSlotSelect={handleTimeSlotSelect}
                                    coachName={selectedCoach.name}
                                />
                            )}
                        </div>
                    )}
                </>
            )}

            {/* 예약 확인 모달 */}
            {showReservationModal && selectedCoach && selectedTimeSlot && (
                <PersonalReservationModal
                    coach={selectedCoach}
                    date={selectedDate}
                    timeSlot={selectedTimeSlot}
                    userTickets={availableTickets}
                    userId={userId}
                    onConfirm={handleReservationConfirm}
                    onClose={() => {
                        setShowReservationModal(false);
                        setSelectedTimeSlot(null);
                    }}
                />
            )}
        </main>
    );
};

export default PersonalLessonPage;