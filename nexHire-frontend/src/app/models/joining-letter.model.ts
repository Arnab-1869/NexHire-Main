// ─── Joining Letter Models (backend aligned) ─────────────────────────────────

export type JoiningLetterStatus =
  | 'JOINING_LETTER_SENT'
  | 'TRAINING_IN_PROGRESS'
  | 'JOINING_ON_HOLD';

export interface JoiningLetter {
  id: number;
  applicationId: number;
  jobTitle: string;
  content: string;
  joiningDate: string;
  locationName: string;
  status: string;
  holdReason?: string;
  sentByName?: string;
  sentAt?: string;
  respondedAt?: string;
}

export interface SendJoiningLetterRequest {
  content: string;
  joiningDate: string;
  locationId: number;
}
