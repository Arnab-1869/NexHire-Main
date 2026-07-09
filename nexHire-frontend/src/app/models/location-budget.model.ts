// ─── Location Budget & Seats (backend LocationResponse) ──────────────────────

export interface LocationBudget {
  id: number;
  name: string;
  city: string;
  budgetTotal: number;
  budgetUsed: number;
  budgetAvailable: number;
  seatsTotal: number;
  seatsOccupied: number;
  seatsAvailable: number;
  /** Annual training budget in ₹ (set by Admin). */
  budgetAmount: number;
  /** Budget consumed so far in ₹. */
  usedAmount: number;
  /** Remaining budget in ₹. */
  remainingAmount: number;
}

export interface UpdateLocationRequest {
  budgetTotalSlots?: number;
  seatsTotalSeats?: number;
}
