export function canEditAppointmentNotes(
  role: string,
  profileId: string,
  doctorId: string,
): boolean {
  if (role === "ADMIN") return true;
  if (role === "DOCTOR") return profileId === doctorId;
  return false;
}
