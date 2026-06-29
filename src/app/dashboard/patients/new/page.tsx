import { PatientForm } from "@/components/patients/patient-form";
import { createPatient } from "../actions";

export default function NewPatientPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Register patient</h1>
      <PatientForm action={createPatient} />
    </div>
  );
}
