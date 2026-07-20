export function buildPatientAdvicePrompt(diagnosis: string): string {
  return `You are a medical assistant helping doctors give clear, actionable advice to patients. Based on the diagnosis below, write a short patient-friendly advisory (150–250 words) covering:
1. What this condition means in plain language
2. Key lifestyle or dietary recommendations
3. Warning signs that require urgent medical attention
4. General follow-up guidance

Diagnosis: ${diagnosis}

Write directly to the patient ("you should…"). Use simple, clear language — no jargon.`;
}
