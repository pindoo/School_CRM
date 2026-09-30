import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SpreadsheetView } from './components/SpreadsheetView';
import { StudentDetailModal } from './components/StudentDetailModal';
import { StudentRecord } from './types/crm';
import { SheetService, SAMPLE_SHEET_ROW } from './services/sheetService';
import { Check } from 'lucide-react';

export default function App() {
  const [students, setStudents] = useState<StudentRecord[]>(() => SheetService.getStoredRecords());
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

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
      {/* Soft, Dignified Header without database buttons */}
      <Header recordCount={students.length} />

      {/* Main Page: First page displays strictly the 14 columns and the button named "Search by roll number" */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
        <SpreadsheetView
          students={students}
          onSelectStudent={(s) => setSelectedStudent(s)}
          onDataPasted={handleDataPasted}
          onLoadSample={handleLoadSample}
        />
      </main>

      {/* Student Detail Modal */}
      <StudentDetailModal
        student={selectedStudent}
        onClose={() => setSelectedStudent(null)}
        onUpdateRecord={handleUpdateRecord}
        onDeleteRecord={handleDeleteRecord}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg text-xs animate-in slide-in-from-bottom-2 duration-150 text-white bg-[#1E3A2F]">
          <Check className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
