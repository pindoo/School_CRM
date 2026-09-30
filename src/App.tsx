import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SpreadsheetView } from './components/SpreadsheetView';
import { StudentDetailModal } from './components/StudentDetailModal';
import { StudentRecord } from './types/crm';
import { SheetService, SAMPLE_SHEET_ROW, fetchStudentsFromN8n } from './services/sheetService';
import { Check } from 'lucide-react';

export default function App() {
  const [students, setStudents] = useState<StudentRecord[]>(() => SheetService.getStoredRecords());
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Load live data from Google Sheets (via n8n) on page open
  useEffect(() => {
    fetchStudentsFromN8n()
      .then((records) => {
        setStudents(records);
        SheetService.saveRecords(records);
        showToast(`Loaded ${records.length} records from Google Sheets`);
      })
      .catch((err) => {
        console.error('Failed to fetch from n8n', err);
        showToast('Could not load live data, showing saved records', 'info');
      });
  }, []);

  // Sync to local storage
  useEffect(() => {
    if (students.length > 0) {
      SheetService.saveRecords(students);
    }
  }, [students]);

  const handleDataPasted = (pastedRecords: StudentRecord[]) => {
    setStudents(pastedRecords);
    SheetService.saveRecords(pastedRecords);
    showToast(`Loaded ${pastedRecords.length} records into School CRM`);
  };

  const handleLoadSample = () => {
    setStudents([SAMPLE_SHEET_ROW]);
    SheetService.saveRecords([SAMPLE_SHEET_ROW]);
    showToast('Loaded sample student (Roll No: STU-1001)');
  };

  const handleUpdateRecord = (updated: StudentRecord) => {
    setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    setSelectedStudent(updated);
    showToast(`Updated record for ${updated.firstName} ${updated.lastName}`);
  };

  const handleDeleteRecord = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
    showToast('Record removed.');
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] flex flex-col font-sans text-[#1E252B] selection:bg-[#1E3A2F] selection:text-white">
      <Header recordCount={students.length} />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
        <SpreadsheetView
          students={students}
          onSelectStudent={(s) => setSelectedStudent(s)}
          onDataPasted={handleDataPasted}
          onLoadSample={handleLoadSample}
        />
      </main>

      <StudentDetailModal
        student={selectedStudent}
        onClose={() => setSelectedStudent(null)}
        onUpdateRecord={handleUpdateRecord}
        onDeleteRecord={handleDeleteRecord}
      />

      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg text-xs animate-in slide-in-from-bottom-2 duration-150 text-white bg-[#1E3A2F]">
          <Check className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
Click the green Commit changes... button at the top right. A small window opens. Click Commit changes again in that window.
Change 2: Add code to the end of sheetService.ts
At the top of the page, click src in the path School_CRM / src / App.tsx to go back to the folder.
Click the services folder, then click sheetService.ts.
Click the pencil icon to edit.
Scroll to the very bottom of the code. The last line is a single }.
Click just after that last }, press Enter twice to add blank lines, then paste this code:
// ---------------- n8n webhook -> Google Sheet ----------------
const N8N_URL =
  import.meta.env.VITE_N8N_URL || 'https://leflox.app.n8n.cloud/webhook/fetch-data-sheet';

const normKey = (k: string) => String(k).toLowerCase().replace(/[^a-z0-9]/g, '');

const N8N_FIELD_MAP: Record<string, keyof Omit<StudentRecord, 'id'>> = {
  rollno: 'studentId', studentid: 'studentId',
  applicationnumber: 'applicationNumber', applicationno: 'applicationNumber',
  firstname: 'firstName', lastname: 'lastName', dateofbirth: 'dateOfBirth',
  gender: 'gender', bloodgroup: 'bloodGroup', nationality: 'nationality',
  previousschool: 'previousSchool', previousgrade: 'previousGrade',
  applicationdate: 'applicationDate', applyinggrade: 'applyingGrade',
  admissiontype: 'admissionType', academicyear: 'academicYear',
};

export async function fetchStudentsFromN8n(): Promise<StudentRecord[]> {
  const res = await fetch(N8N_URL);
  if (!res.ok) throw new Error(`n8n returned HTTP ${res.status}`);
  const rows: Record<string, unknown>[] = await res.json();
  return rows.map((row, idx) => {
    const rec: StudentRecord = {
      id: `row-${row.row_number ?? idx}`, studentId: '', applicationNumber: '',
      firstName: '', lastName: '', dateOfBirth: '', gender: '', bloodGroup: '',
      nationality: '', previousSchool: '', previousGrade: '', applicationDate: '',
      applyingGrade: '', admissionType: '', academicYear: '',
    };
    for (const [key, value] of Object.entries(row)) {
      const field = N8N_FIELD_MAP[normKey(key)];
      if (field) rec[field] = value == null ? '' : String(value);
    }
    return rec;
  });
}
