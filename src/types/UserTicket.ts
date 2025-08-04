export interface UserTicket {
    ticket_id: string;
    remaining_count: number;
    assigned_at: string;
    expires_at: string;
    tickets: {
      name: string;
      price: number;
      lesson_count: number;
    };
  }
  