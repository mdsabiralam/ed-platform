import { AdmissionStatus, AdmissionApplication } from '@prisma/client';

export class AdmissionStatusChangedEvent {
  constructor(
    public readonly applicationId: string,
    public readonly oldStatus: AdmissionStatus,
    public readonly newStatus: AdmissionStatus,
    public readonly application: AdmissionApplication, // Pass full object to avoid re-fetching in listener
  ) {}
}
