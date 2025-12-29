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

export interface Teacher {
  id: string;
  name: string;
  subjectIds: string[]; // Subjects this teacher can teach
}

export interface Subject {
  id: string;
  name: string;
  weeklySessions: number; // Required sessions per week
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
}

export interface ClassSection {
  id: string;
  name: string;
  subjectIds: string[]; // Subjects required for this section
}

export interface TimetableInputData {
  teachers: Teacher[];
  subjects: Subject[];
  rooms: Room[];
  sections: ClassSection[];
  timeSlots: TimeSlot[];
  workDays: DayOfWeek[];
}

export interface RoutineEntry {
  sectionId: string;
  day: DayOfWeek;
  timeSlotId: string;
  subjectId: string;
  teacherId: string;
  roomId: string;
}
