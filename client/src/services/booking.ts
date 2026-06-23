export interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  eventType: string;
  date: string;
  guests: number;
  package: string;
  cost: number;
  paid?: number;
  pending?: number;
  notes?: string;
  status: 'PENDING' | 'TEMP_RESERVED' | 'VISIT_SCHEDULED' | 'CONFIRMED' | 'EXPIRED' | 'CANCELLED';
  location?: string;
  coordinatorName?: string;
  coordinatorPhone?: string;
  reservedAt?: string;
  expiresAt?: string;
  createdAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export async function getBookings(): Promise<Booking[]> {
  const response = await fetch(`${API_URL}/api/bookings`);
  if (!response.ok) {
    throw new Error('Failed to fetch bookings');
  }
  return response.json();
}

export async function addBooking(booking: Omit<Booking, 'id' | 'status' | 'createdAt'>): Promise<Booking> {
  const response = await fetch(`${API_URL}/api/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(booking),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to add booking');
  }
  return response.json();
}

export async function updateBookingStatus(id: string, status: Booking['status']): Promise<Booking[]> {
  const response = await fetch(`${API_URL}/api/bookings/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to update booking status');
  }
  return getBookings();
}

export async function deleteBooking(id: string): Promise<Booking[]> {
  const response = await fetch(`${API_URL}/api/bookings/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to delete booking');
  }
  return getBookings();
}

export async function getAvailabilityDates(month?: string): Promise<{ date: string; type: string }[]> {
  const query = month ? `?month=${month}` : '';
  const response = await fetch(`${API_URL}/api/bookings/availability${query}`);
  if (!response.ok) {
    throw new Error('Failed to fetch availability dates');
  }
  return response.json();
}

export async function payReservation(id: string, amount: number): Promise<{ success: boolean; booking: Booking }> {
  const response = await fetch(`${API_URL}/api/bookings/${id}/pay-reservation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ amount }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Payment failed');
  }
  return response.json();
}
