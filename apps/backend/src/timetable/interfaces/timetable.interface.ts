export enum DayOfWeek {
  MON = 'MON',
  TUE = 'TUE',
  WED = 'WED',
  THU = 'THU',
  FRI = 'FRI',
  SAT = 'SAT',
  SUN = 'SUN',
}

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  label: string;
}

export enum ConstraintType {
  HARD = 'HARD',
  SOFT = 'SOFT',
}
