export function calculateRetirementDate(dob: Date): Date {
  const retirementDate = new Date(dob);
  retirementDate.setFullYear(retirementDate.getFullYear() + 60);
  return retirementDate;
}
