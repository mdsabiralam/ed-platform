export class AttendanceMarkedEvent {
  constructor(
    public readonly studentId: string,
    public readonly status: string, // 'ABSENT', 'PRESENT', etc.
    public readonly date: Date,
    public readonly routineEntryId: string,
  ) {}
}
