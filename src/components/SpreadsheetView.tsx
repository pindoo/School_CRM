import React, { useState, useMemo, useEffect } from 'react';
import { StudentRecord, EXACT_SHEET_COLUMNS } from '../types/crm';
import { 
  Search, 
  ArrowUpDown, 
  Users, 
  Calendar, 
  Layers, 
  CheckCircle2, 
  X,
  Sparkles
} from 'lucide-react';
import { SheetService, SAMPLE_SHEET_ROW } from '../services/sheetService';

interface SpreadsheetViewProps {
  students: StudentRecord[];
  onSelectStudent: (student: StudentRecord) => void;
  onDataPasted: (records: StudentRecord[]) => void;
  onLoadSample: () => void;
}

export const SpreadsheetView: React.FC<SpreadsheetViewProps> = ({
  students,
  onSelectStudent,
  onDataPasted,
  onLoadSample,
}) => {
  const [rollNumberInput, setRollNumberInput] = useState('');
  const [activeRollNumberFilter, setActiveRollNumberFilter] = useState('');

  const [sortKey, setSortKey] = useState<keyof StudentRecord>('studentId');
  const [sortAsc, setSortAsc] = useState(true);

  // Global Ctrl+V listener: users can paste copied cells anytime
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const text = e.clipboardData?.getData('text');
      if (text && text.trim().length > 0) {
        const parsed = SheetService.parseCsvOrTsv(text);
        if (parsed.length > 0) {
          onDataPasted(parsed);
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onDataPasted]);

  const handleSort = (key: keyof StudentRecord) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const isExactRollNumberMatch = (studentId: string, query: string): boolean => {
    if (!query || !query.trim()) return true;
    const q = query.trim().toLowerCase();
    const s = (studentId || '').trim().toLowerCase();

    // 1. Direct exact string match (e.g. "9" === "9")
    if (s === q) return true;

    // 2. Normalized match removing all non-alphanumeric chars (e.g. "stu-9" vs "stu9")
    const sClean = s.replace(/[^0-9a-z]/g, '');
    const qClean = q.replace(/[^0-9a-z]/g, '');
    if (sClean === qClean) return true;

    // 3. Exact numeric match:
    // When the user enters "9", it must match ONLY roll number 9 (or STU-9 / STU-09).
    // It must NOT match "19", "29", "90", "91", etc.
    const qNum = parseInt(qClean, 10);
    const sDigits = s.replace(/[^0-9]/g, '');
    if (!isNaN(qNum) && sDigits) {
      const sNum = parseInt(sDigits, 10);
      if (sNum === qNum) return true;
    }

    return false;
  };

  // Perform search by Roll Number
  const handleSearchByRollNumber = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = rollNumberInput.trim();
    setActiveRollNumberFilter(query);
  };

  const handleClearSearch = () => {
    setRollNumberInput('');
    setActiveRollNumberFilter('');
  };

  // Filter students: strictly exact match for Roll Number
  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        if (!activeRollNumberFilter) return true;
        return isExactRollNumberMatch(s.studentId, activeRollNumberFilter);
      })
      .sort((a, b) => {
        const valA = String(a[sortKey] || '');
        const valB = String(b[sortKey] || '');
        const result = valA.localeCompare(valB, undefined, { numeric: true, sensitivity: 'base' });
        return sortAsc ? result : -result;
      });
  }, [students, activeRollNumberFilter, sortKey, sortAsc]);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-16">
      {/* Soft, Dignified Dashboard Overview Banner */}
      <div className="bg-[#FFFFFF] border border-[#EAE8E4] rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#78716C] mb-1">
              <span className="font-serif font-semibold text-[#1E3A2F]">Rising Glory</span>
              <span aria-hidden="true">·</span>
              <span>School CRM System</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-[11px]">Admissions & Student Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-semibold tracking-tight text-[#1E252B]">
              Student Admissions & Records Dashboard
            </h1>
            <p className="text-xs text-[#57534E] mt-1 max-w-2xl leading-relaxed">
              Unified first page view presenting all 14 standard student admission fields (Columns A through N).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {students.length === 0 && (
              <button
                onClick={onLoadSample}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#57534E] bg-[#FAF9F6] hover:bg-[#F2EFE9] border border-[#E2DFD8] rounded-xl transition-colors"
                title="Load Ayaan Khan sample record"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Load Sample Row</span>
              </button>
            )}
          </div>
        </div>

        {/* Soft Dashboard Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-[#FAF9F6] border border-[#F2EFE9] p-3.5 rounded-xl">
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#78716C]">
              <Users className="w-3.5 h-3.5 text-[#1E3A2F]" />
              <span>TOTAL STUDENTS</span>
            </div>
            <div className="text-xl font-serif font-bold text-[#1E252B] mt-1 tabular-nums">
              {students.length}
            </div>
          </div>

          <div className="bg-[#FAF9F6] border border-[#F2EFE9] p-3.5 rounded-xl">
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#78716C]">
              <Calendar className="w-3.5 h-3.5 text-[#1E3A2F]" />
              <span>ACADEMIC YEAR</span>
            </div>
            <div className="text-xl font-serif font-bold text-[#1E252B] mt-1">
              2026-2027
            </div>
          </div>

          <div className="bg-[#FAF9F6] border border-[#F2EFE9] p-3.5 rounded-xl">
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#78716C]">
              <Layers className="w-3.5 h-3.5 text-[#1E3A2F]" />
              <span>VISIBLE FIELDS</span>
            </div>
            <div className="text-xl font-serif font-bold text-[#1E252B] mt-1">
              14 Columns (A:N)
            </div>
          </div>

          <div className="bg-[#FAF9F6] border border-[#F2EFE9] p-3.5 rounded-xl">
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#78716C]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>SYSTEM STATUS</span>
            </div>
            <div className="text-sm font-semibold text-emerald-700 mt-1 truncate">
              Operational
            </div>
          </div>
        </div>
      </div>

      {/* DEDICATED SEARCH BY ROLL NUMBER SECTION WITH VISIBLE BUTTON */}
      <div className="bg-[#FFFFFF] border border-[#EAE8E4] rounded-2xl p-5 shadow-xs">
        <form onSubmit={handleSearchByRollNumber} className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-serif font-semibold text-[#1E252B] flex items-center gap-1.5">
              <span>Search Student by Roll Number (Student ID - Column A)</span>
            </label>
            {activeRollNumberFilter && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="text-[11px] text-[#78716C] hover:text-[#1E252B] flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                <span>Show All Records</span>
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#A8A29E] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Enter Roll Number (e.g. STU-1001 or 1001)..."
                value={rollNumberInput}
                onChange={(e) => {
                  setRollNumberInput(e.target.value);
                  if (e.target.value.trim() === '') setActiveRollNumberFilter('');
                }}
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#FAF9F6] border border-[#E2DFD8] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1E3A2F] font-mono text-[#1E252B] placeholder:font-sans placeholder:text-[#A8A29E]"
              />
            </div>

            {/* THE VISIBLE BUTTON NAMED "Search by roll number" */}
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1E3A2F] hover:bg-[#162D24] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors whitespace-nowrap active:scale-[0.99]"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search by roll number</span>
            </button>
          </div>
        </form>
      </div>

      {/* THE MASTER TABLE (Arranged exactly like the user's uploaded image with all 14 columns visible) */}
      <div className="bg-[#FFFFFF] border border-[#EAE8E4] rounded-2xl shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-[#EAE8E4] bg-[#FAF8F5] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-serif font-semibold text-[#1E252B] uppercase tracking-wider">
              Student Records Master Sheet
            </h2>
            <span className="text-[11px] font-mono text-[#78716C] bg-white border border-[#E2DFD8] px-2 py-0.5 rounded">
              Col A to Col N
            </span>
          </div>
          <span className="text-xs font-mono text-[#78716C] tabular-nums">
            Showing {filteredStudents.length} of {students.length} record(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1300px]">
            {/* Header styled exactly like image */}
            <thead>
              <tr className="border-b border-[#EAE8E4] bg-[#FAF8F5] text-[11px] font-mono tracking-wider text-[#57534E]">
                {EXACT_SHEET_COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => col.hasSort && handleSort(col.key)}
                    className={`py-3.5 px-4 font-bold whitespace-nowrap ${
                      col.hasSort ? 'cursor-pointer hover:text-[#1E252B]' : ''
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#1E3A2F] font-bold">{col.letter}</span>
                      <span>{col.label}</span>
                      {col.hasSort && (
                        <span className="text-[#8C867D] text-xs font-sans">↑↓</span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-[#F2EFE9] text-xs">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => onSelectStudent(row)}
                    className="hover:bg-[#FAF9F6] cursor-pointer transition-colors group"
                  >
                    {/* A STUDENT ID (Roll Number) */}
                    <td className="py-4 px-4 font-mono font-bold text-[#1E252B] whitespace-nowrap">
                      {row.studentId || '—'}
                    </td>

                    {/* B APPLICATION NUMBER */}
                    <td className="py-4 px-4 font-mono text-[#44403C] whitespace-nowrap">
                      {row.applicationNumber || '—'}
                    </td>

                    {/* C FIRST NAME */}
                    <td className="py-4 px-4 font-normal text-[#1E252B] whitespace-nowrap">
                      {row.firstName || '—'}
                    </td>

                    {/* D LAST NAME */}
                    <td className="py-4 px-4 font-normal text-[#1E252B] whitespace-nowrap">
                      {row.lastName || '—'}
                    </td>

                    {/* E DATE OF BIRTH */}
                    <td className="py-4 px-4 font-mono text-[#57534E] whitespace-nowrap">
                      {row.dateOfBirth || '—'}
                    </td>

                    {/* F GENDER */}
                    <td className="py-4 px-4 text-[#57534E] whitespace-nowrap">
                      {row.gender || '—'}
                    </td>

                    {/* G BLOOD GROUP */}
                    <td className="py-4 px-4 font-mono font-bold text-[#1E252B] whitespace-nowrap">
                      {row.bloodGroup || '—'}
                    </td>

                    {/* H NATIONALITY */}
                    <td className="py-4 px-4 text-[#57534E] whitespace-nowrap">
                      {row.nationality || '—'}
                    </td>

                    {/* I PREVIOUS SCHOOL */}
                    <td className="py-4 px-4 text-[#292524] whitespace-nowrap">
                      {row.previousSchool || '—'}
                    </td>

                    {/* J PREVIOUS GRADE */}
                    <td className="py-4 px-4 text-[#57534E] whitespace-nowrap">
                      {row.previousGrade || '—'}
                    </td>

                    {/* K APPLICATION DATE */}
                    <td className="py-4 px-4 font-mono text-[#57534E] whitespace-nowrap">
                      {row.applicationDate || '—'}
                    </td>

                    {/* L APPLYING GRADE */}
                    <td className="py-4 px-4 font-medium text-[#1E3A2F] whitespace-nowrap">
                      {row.applyingGrade || '—'}
                    </td>

                    {/* M ADMISSION TYPE */}
                    <td className="py-4 px-4 text-[#57534E] whitespace-nowrap">
                      {row.admissionType || '—'}
                    </td>

                    {/* N ACADEMIC YEAR */}
                    <td className="py-4 px-4 font-mono text-[#57534E] whitespace-nowrap">
                      {row.academicYear || '—'}
                    </td>
                  </tr>
                ))
              ) : (
                /* Empty Rows: maintaining layout, empty fields */
                <>
                  <tr className="hover:bg-transparent">
                    <td colSpan={14} className="py-12 text-center">
                      <div className="max-w-md mx-auto space-y-2">
                        <p className="font-serif font-semibold text-sm text-[#1E252B]">
                          {activeRollNumberFilter
                            ? `No student found with Roll Number "${activeRollNumberFilter}"`
                            : 'Student Records are Empty'}
                        </p>
                        <p className="text-xs text-[#78716C]">
                          {activeRollNumberFilter
                            ? 'Please check the Roll Number or click "Show All Records".'
                            : 'Paste student rows (Ctrl+V) or click "Load Sample Row" to populate records.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                  {[1, 2, 3, 4].map((emptyRowIdx) => (
                    <tr key={emptyRowIdx} className="opacity-40">
                      {EXACT_SHEET_COLUMNS.map((col) => (
                        <td key={col.key} className="py-3 px-4 font-mono text-[#D6D3CD] text-xs">
                          —
                        </td>
                      ))}
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="py-3 px-5 border-t border-[#EAE8E4] bg-[#FAF8F5] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#78716C]">
          <div className="font-mono text-[11px]">
            Visible Columns A:N · Student ID (Roll No), Application No, Name, DOB, Gender, Blood, Nationality, Prev School & Grade, App Date, Grade, Type, Year
          </div>
          <div className="font-mono tabular-nums text-[11px]">
            Rising Glory School CRM
          </div>
        </div>
      </div>
    </div>
  );
};
