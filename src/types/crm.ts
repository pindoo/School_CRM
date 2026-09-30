export interface StudentRecord {
  id: string;
  studentId: string; // Col A: STUDENT ID (e.g. STU-1001)
  applicationNumber: string; // Col B: APPLICATION NUMBER (e.g. APP-2026-001)
  firstName: string; // Col C: FIRST NAME (e.g. Ayaan)
  lastName: string; // Col D: LAST NAME (e.g. Khan)
  dateOfBirth: string; // Col E: DATE OF BIRTH (e.g. 2017-03-14)
  gender: string; // Col F: GENDER (e.g. Male)
  bloodGroup: string; // Col G: BLOOD GROUP (e.g. O+)
  nationality: string; // Col H: NATIONALITY (e.g. Pakistani)
  previousSchool: string; // Col I: PREVIOUS SCHOOL (e.g. The City School)
  previousGrade: string; // Col J: PREVIOUS GRADE (e.g. Grade 3)
  applicationDate: string; // Col K: APPLICATION DATE (e.g. 2026-09-01)
  applyingGrade: string; // Col L: APPLYING GRADE (e.g. Grade 4)
  admissionType: string; // Col M: ADMISSION TYPE (e.g. New)
  academicYear: string; // Col N: ACADEMIC YEAR (e.g. 2026-2027)
}

export const EXACT_SHEET_COLUMNS = [
  { key: 'studentId' as const, letter: 'A', label: 'STUDENT ID', hasSort: true },
  { key: 'applicationNumber' as const, letter: 'B', label: 'APPLICATION NUMBER', hasSort: true },
  { key: 'firstName' as const, letter: 'C', label: 'FIRST NAME', hasSort: false },
  { key: 'lastName' as const, letter: 'D', label: 'LAST NAME', hasSort: false },
  { key: 'dateOfBirth' as const, letter: 'E', label: 'DATE OF BIRTH', hasSort: false },
  { key: 'gender' as const, letter: 'F', label: 'GENDER', hasSort: false },
  { key: 'bloodGroup' as const, letter: 'G', label: 'BLOOD GROUP', hasSort: false },
  { key: 'nationality' as const, letter: 'H', label: 'NATIONALITY', hasSort: false },
  { key: 'previousSchool' as const, letter: 'I', label: 'PREVIOUS SCHOOL', hasSort: false },
  { key: 'previousGrade' as const, letter: 'J', label: 'PREVIOUS GRADE', hasSort: false },
  { key: 'applicationDate' as const, letter: 'K', label: 'APPLICATION DATE', hasSort: false },
  { key: 'applyingGrade' as const, letter: 'L', label: 'APPLYING GRADE', hasSort: false },
  { key: 'admissionType' as const, letter: 'M', label: 'ADMISSION TYPE', hasSort: false },
  { key: 'academicYear' as const, letter: 'N', label: 'ACADEMIC YEAR', hasSort: false },
];
