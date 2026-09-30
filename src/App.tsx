import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { SpreadsheetView } from './components/SpreadsheetView';
import { StudentDetailModal } from './components/StudentDetailModal';
import { DatabaseModal } from './components/DatabaseModal';
import { StudentRecord } from './types/crm';
import { SheetService, SAMPLE_SHEET_ROW } from './services/sheetService';
import { Check, AlertCircle } from 'lucide-react';

export default function App() {
  // Starts empty as requested: fields must be empty and ready to fetch from any database
  const [students, setStudents] = useState<StudentRecord[]>(() => SheetService.getStoredRecords());
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [isDatabaseModalOpen, setIsDatabaseModalOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchDatabaseData = useCallback(async () => {
    const url = SheetService.getSavedSourceUrl();
    if (!url) return;

    setIsFetching(true);
    const result = await SheetService.fetchFromAnyDatabase(url);
    setIsFetching(false);

    if (result.success && result.data && result.data.length > 0) {
      setStudents(result.data);
      SheetService.saveRecords(result.data);
      showToast(`Loaded ${result.data.length} records into Rising Glory CRM`);
    }
  }, []);

  // Try initial fetch from configured database / sheet source
  useEffect(() => {
    fetchDatabaseData();
  }, [fetchDatabaseData]);

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

  const handleDataFetched = (records: StudentRecord[], message: string) => {
    setStudents(records);
    SheetService.saveRecords(records);
    showToast(message);
  };

  const handleLoadSample = () => {
    setStudents([SAMPLE_SHEET_ROW]);
    SheetService.saveRecords([SAMPLE_SHEET_ROW]);
    showToast('Loaded Ayaan Khan sample row (Roll No: STU-1001)');
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
      {/* Soft, Dignified Header */}
      <Header
        onRefresh={fetchDatabaseData}
        onOpenDatabaseModal={() => setIsDatabaseModalOpen(true)}
        recordCount={students.length}
        isFetching={isFetching}
      />

      {/* Main Page: First page displays strictly the 14 columns and the button named "Search by roll number" */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
        <SpreadsheetView
          students={students}
          onSelectStudent={(s) => setSelectedStudent(s)}
          onDataPasted={handleDataPasted}
          onOpenDatabaseModal={() => setIsDatabaseModalOpen(true)}
          onLoadSample={handleLoadSample}
        />
      </main>

      {/* Connect Any Database Modal */}
      <DatabaseModal
        isOpen={isDatabaseModalOpen}
        onClose={() => setIsDatabaseModalOpen(false)}
        onDataFetched={handleDataFetched}
        currentSourceUrl={SheetService.getSavedSourceUrl()}
      />

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
