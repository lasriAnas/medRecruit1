# Test Suite

Run with `npm test`. All 78 tests pass.

## `lib/csv.test.ts` — `toCsv`

| # | Test | Input | Expected result |
|---|------|-------|-----------------|
| 1 | Produces a header row followed by data rows | `[{ Name: "Alice", Age: 30 }]`, headers `["Name","Age"]` | `"Name,Age\nAlice,30"` |
| 2 | Uses empty string for missing column values | `[{ Name: "Bob" }]`, headers `["Name","Age"]` | `"Name,Age\nBob,"` |
| 3 | Wraps values containing commas in double quotes | `[{ Label: "a,b" }]` | `'Label\n"a,b"'` |
| 4 | Wraps values containing double quotes and escapes them | `[{ Label: 'say "hi"' }]` | `'Label\n"say ""hi"""'` |
| 5 | Wraps values containing newlines in double quotes | `[{ Notes: "line1\nline2" }]` | `'Notes\n"line1\nline2"'` |
| 6 | Handles multiple rows in order | `[{ A:1, B:2 }, { A:3, B:4 }]` | `"A,B\n1,2\n3,4"` |
| 7 | Returns only the header when rows is empty | `[]`, headers `["X","Y"]` | `"X,Y"` |
| 8 | Converts numeric values to strings | `[{ Amount: 1500 }]` | `"Amount\n1500"` |

---

## `lib/utils.test.ts` — `cn`

| # | Test | Input | Expected result |
|---|------|-------|-----------------|
| 1 | Joins class names | `"a", "b", "c"` | `"a b c"` |
| 2 | Ignores falsy values | `"a", false, undefined, null, "b"` | `"a b"` |
| 3 | Merges conflicting Tailwind classes, keeping the last one | `"px-2", "px-4"` | `"px-4"` |
| 4 | Handles conditional object syntax | `{ "font-bold": true, "text-sm": false }` | `"font-bold"` |
| 5 | Handles array syntax | `["a", "b"]` | `"a b"` |
| 6 | Returns empty string when no arguments | _(none)_ | `""` |

---

## `lib/with-retry.test.ts` — `withRetry`

| # | Test | Scenario | Expected result |
|---|------|----------|-----------------|
| 1 | Returns the result immediately on success | `fn` resolves `"ok"` on first call | Returns `"ok"`, `fn` called once |
| 2 | Retries on EAI_AGAIN and succeeds on second attempt | `fn` rejects with `EAI_AGAIN` then resolves | Returns `"ok"`, `fn` called twice |
| 3 | Retries on ENOTFOUND and succeeds on second attempt | `fn` rejects with `ENOTFOUND` then resolves | Returns `"data"`, `fn` called twice |
| 4 | Retries on EAI_AGAIN nested in error cause | `err.cause.message` contains `EAI_AGAIN` | Retries, returns `"ok"` |
| 5 | Throws immediately on non-DNS errors | `fn` rejects with `"Unique constraint failed"` | Throws immediately, `fn` called once |
| 6 | Exhausts all attempts and re-throws the last DNS error | `fn` always rejects with `EAI_AGAIN`, 3 attempts | Throws `"EAI_AGAIN persistent"`, `fn` called 3 times |
| 7 | Respects custom attempt count | 1 attempt configured, `fn` always rejects | Throws after 1 call, no retries |

---

## `lib/schemas/patient.test.ts` — `patientSchema`

| # | Test | Input | Expected result |
|---|------|-------|-----------------|
| 1 | Accepts a valid patient | `{ name, dob, gender: "FEMALE", phone: "0612345678" }` | `success: true` |
| 2 | Accepts an optional address | Valid patient + `address: "123 Rue Hassan II"` | `success: true` |
| 3 | Rejects an empty name | `name: ""` | `success: false` |
| 4 | Rejects an empty dob | `dob: ""` | `success: false` |
| 5 | Rejects an invalid gender | `gender: "OTHER"` | `success: false` |
| 6 | Rejects a phone with fewer than 10 digits | `phone: "061234"` | `success: false` |
| 7 | Rejects a phone with more than 10 digits | `phone: "06123456789"` | `success: false` |
| 8 | Rejects a phone containing non-digit characters | `phone: "061234567a"` | `success: false` |
| 9 | Accepts MALE gender | `gender: "MALE"` | `success: true` |

---

## `lib/schemas/appointment.test.ts` — `appointmentSchema`

| # | Test | Input | Expected result |
|---|------|-------|-----------------|
| 1 | Accepts a valid appointment | `{ patientId, doctorId, scheduledAt: "2099-01-01T10:00:00" }` | `success: true` |
| 2 | Accepts optional notes | Valid appointment + `notes: "bring previous scans"` | `success: true` |
| 3 | Rejects an empty patientId | `patientId: ""` | `success: false` |
| 4 | Rejects an empty doctorId | `doctorId: ""` | `success: false` |
| 5 | Rejects an empty scheduledAt | `scheduledAt: ""` | `success: false` |
| 6 | Rejects a scheduledAt in the past | `scheduledAt: "2000-01-01T00:00:00"` | `success: false`, message: `"Date and time cannot be in the past"` |

---

## `lib/schemas/invoice.test.ts` — `invoiceSchema`

| # | Test | Input | Expected result |
|---|------|-------|-----------------|
| 1 | Accepts a valid invoice | `{ appointmentId: "appt-uuid", amount: "500" }` | `success: true` |
| 2 | Rejects an empty appointmentId | `appointmentId: ""` | `success: false` |
| 3 | Rejects an empty amount | `amount: ""` | `success: false` |
| 4 | Rejects amount of 0 | `amount: "0"` | `success: false` |
| 5 | Rejects negative amount | `amount: "-100"` | `success: false` |
| 6 | Rejects decimal amount | `amount: "99.50"` | `success: false` |
| 7 | Rejects non-numeric amount | `amount: "abc"` | `success: false` |
| 8 | Accepts amount of 1 | `amount: "1"` | `success: true` |
| 9 | Accepts large amount | `amount: "99999"` | `success: true` |

---

## `lib/schemas/medication.test.ts` — `medicationSchema`

| # | Test | Input | Expected result |
|---|------|-------|-----------------|
| 1 | Accepts a valid medication | `{ name, unit, stock: "100", reorderThreshold: "20", category: "MEDICATION" }` | `success: true` |
| 2 | Accepts category SUPPLY | `category: "SUPPLY"` | `success: true` |
| 3 | Rejects an invalid category | `category: "OTHER"` | `success: false` |
| 4 | Rejects missing category | object without `category` field | `success: false` |
| 5 | Accepts a valid supply item | `{ name: "Latex gloves (M)", unit: "pair", stock: "200", reorderThreshold: "50", category: "SUPPLY" }` | `success: true` |
| 6 | Rejects empty name | `name: ""` | `success: false` |
| 7 | Rejects empty unit | `unit: ""` | `success: false` |
| 8 | Accepts stock of 0 | `stock: "0"` | `success: true` |
| 9 | Rejects non-integer stock | `stock: "10.5"` | `success: false` |
| 10 | Rejects negative stock | `stock: "-5"` | `success: false` |
| 11 | Rejects reorderThreshold of 0 | `reorderThreshold: "0"` | `success: false` |
| 12 | Rejects negative reorderThreshold | `reorderThreshold: "-1"` | `success: false` |
| 13 | Accepts reorderThreshold of 1 | `reorderThreshold: "1"` | `success: true` |
| 14 | Rejects non-numeric stock | `stock: "ten"` | `success: false` |

---

## `lib/schemas/prescription.test.ts` — `prescriptionItemSchema`

| # | Test | Input | Expected result |
|---|------|-------|-----------------|
| 1 | Accepts a valid item | `{ medicationName: "Amoxicillin", dosage: "500mg", duration: "7 days" }` | `success: true` |
| 2 | Accepts optional notes | Valid item + `notes: "Take after meals"` | `success: true` |
| 3 | Accepts undefined notes | Valid item + `notes: undefined` | `success: true` |
| 4 | Rejects empty medicationName | `medicationName: ""` | `success: false` |
| 5 | Rejects empty dosage | `dosage: ""` | `success: false` |
| 6 | Rejects empty duration | `duration: ""` | `success: false` |
| 7 | Allows free-text medication names with spaces and special chars | `medicationName: "Ibuprofène 400mg (générique)"` | `success: true` |

---

## `lib/schemas/account.test.ts` — `accountSchema`

| # | Test | Input | Expected result |
|---|------|-------|-----------------|
| 1 | Accepts a valid account | `{ name, email: "karim@clinic.ma", role: "DOCTOR" }` | `success: true` |
| 2 | Accepts ADMIN role | `role: "ADMIN"` | `success: true` |
| 3 | Accepts RECEPTIONIST role | `role: "RECEPTIONIST"` | `success: true` |
| 4 | Rejects empty name | `name: ""` | `success: false` |
| 5 | Rejects empty email | `email: ""` | `success: false` |
| 6 | Rejects malformed email | `email: "not-an-email"` | `success: false` |
| 7 | Rejects invalid role | `role: "NURSE"` | `success: false` |

---

## `lib/schemas/password.test.ts` — `passwordSchema`

| # | Test | Input | Expected result |
|---|------|-------|-----------------|
| 1 | Accepts matching passwords of sufficient length | `{ password: "secret123", confirmPassword: "secret123" }` | `success: true` |
| 2 | Rejects password shorter than 6 characters | `{ password: "abc", confirmPassword: "abc" }` | `success: false` |
| 3 | Rejects when passwords do not match | `{ password: "password1", confirmPassword: "password2" }` | `success: false`, error on `confirmPassword`: `"Passwords do not match"` |
| 4 | Rejects empty confirmPassword | `{ password: "password1", confirmPassword: "" }` | `success: false` |
| 5 | Accepts exactly 6 character password | `{ password: "abc123", confirmPassword: "abc123" }` | `success: true` |
