
import TicketCard from '../components/TicketCard';
import '../styles/TicketsPage.css';

const TicketsPage: React.FC = () => {

    const tickets = [
        { name: '베이직 수강권', count: 4, duration: '1개월', price: '150,000원', pricePer: '37,500원' },
        { name: '스탠다드 수강권', count: 8, duration: '1개월', price: '280,000원', pricePer: '35,000원' },
        { name: '프리미엄 수강권', count: 12, duration: '1개월', price: '450,000원', pricePer: '37,500원' },
        { name: '베이직 수강권 (3개월)', count: 12, duration: '3개월', price: '400,000원', pricePer: '33,333원' },
        { name: '스탠다드 수강권 (3개월)', count: 24, duration: '3개월', price: '720,000원', pricePer: '30,000원' },
        { name: '프리미엄 수강권 (3개월)', count: 36, duration: '3개월', price: '1,200,000원', pricePer: '33,333원' },
    ];

    return (
        <div className='page-container'>
            <div className="ticket-wrapper">
                <div className="header">
                    <h2>수강권 관리</h2>
                    <button className="add-button">수강권 추가</button>
                </div>
                <div className="ticket-grid">
                    {tickets.map((ticket, i) => (
                        <TicketCard key={i} {...ticket} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TicketsPage;
