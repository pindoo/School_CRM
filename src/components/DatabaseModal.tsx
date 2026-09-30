import React, { useState } from 'react';
import { Database, X, RefreshCw, Check, AlertCircle, Globe, FileSpreadsheet, Code } from 'lucide-react';
import { SheetService } from '../services/sheetService';
import { StudentRecord } from '../types/crm';

interface DatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataFetched: (records: StudentRecord[], message: string) => void;
  currentSourceUrl: string;
}

export const DatabaseModal: React.FC<DatabaseModalProps> = ({
  isOpen,
  onClose,
  onDataFetched,
  currentSourceUrl,
}) => {
  if (!isOpen) return null;

  const [dbUrl, setDbUrl] = useState(currentSourceUrl || '');
  const [sourceType, setSourceType] = useState<'sheet' | 'rest_api' | 'raw_json'>('sheet');
  const [rawPayload, setRawPayload] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const handleFetch = async () => {
    if (sourceType === 'raw_json') {
      if (!rawPayload.trim()) {
        setStatus({ type: 'error', message: 'Please enter JSON or TSV records.' });
        return;
      }
      try {
        if (rawPayload.trim().startsWith('[') || rawPayload.trim().startsWith('{')) {
          const json = JSON.parse(rawPayload);
          const list = Array.isArray(json) ? json : json.data || [];
          const mapped: StudentRecord[] = list.map((item: any, idx: number) => ({
            id: item.id || `custom-${Date.now()}-${idx}`,
            studentId: item.studentId || item.rollNo || item.student_id || `STU-${1000 + idx + 1}`,
            applicationNumber: item.applicationNumber || item.appNo || `APP-2026-${String(idx + 1).padStart(3, '0')}`,
            firstName: item.firstName || item.first_name || '',
            lastName: item.lastName || item.last_name || '',
            dateOfBirth: item.dateOfBirth || item.dob || '',
            gender: item.gender || 'Male',
            bloodGroup: item.bloodGroup || item.blood_group || 'O+',
            nationality: item.nationality || '',
            previousSchool: item.previousSchool || item.prev_school || '',
            previousGrade: item.previousGrade || item.prev_grade || '',
            applicationDate: item.applicationDate || item.app_date || '',
            applyingGrade: item.applyingGrade || item.grade || '',
            admissionType: item.admissionType || 'New',
            academicYear: item.academicYear || '2026-2027',
          }));
          onDataFetched(mapped, `Loaded ${mapped.length} records into Rising Glory CRM`);
          setStatus({ type: 'success', message: `Imported ${mapped.length} records successfully!` });
          setTimeout(() => onClose(), 1200);
          return;
        } else {
          const records = SheetService.parseCsvOrTsv(rawPayload);
          onDataFetched(records, `Imported ${records.length} records`);
          setStatus({ type: 'success', message: `Imported ${records.length} records successfully!` });
          setTimeout(() => onClose(), 1200);
          return;
        }
      } catch (err: any) {
        setStatus({ type: 'error', message: 'Failed to parse payload: ' + err.message });
        return;
      }
    }

    if (!dbUrl.trim()) {
      setStatus({ type: 'error', message: 'Please provide a valid database or Google Sheet URL.' });
      return;
    }

    setIsLoading(true);
    setStatus({ type: 'info', message: 'Connecting to database endpoint...' });

    const result = await SheetService.fetchFromAnyDatabase(dbUrl);
    setIsLoading(false);

    if (result.success && result.data) {
      onDataFetched(result.data, `Fetched ${result.data.length} student records from database`);
      setStatus({ type: 'success', message: `Successfully fetched ${result.data.length} records!` });
      setTimeout(() => onClose(), 1200);
    } else {
      setStatus({ type: 'error', message: result.error || 'Failed to fetch from database endpoint.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E252B]/45 backdrop-blur-xs">
      <div 
        className="bg-[#FFFFFF] border border-[#E2DFD8] rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EAE8E4] flex items-center justify-between bg-[#FAF9F6]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1E3A2F] text-white flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-serif font-semibold text-[#1E252B]">
                Connect Frontend to Any Database
              </h3>
              <p className="text-xs text-[#78716C]">
                Fetch records from Google Sheets, REST APIs, or custom database endpoints.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-[#F2EFE9] flex items-center justify-center text-[#78716C]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Source Type Selector */}
        <div className="px-6 pt-3 border-b border-[#EAE8E4] flex gap-2 bg-[#FAF9F6] text-xs">
          <button
            onClick={() => { setSourceType('sheet'); setStatus(null); }}
            className={`flex items-center gap-1.5 px-3 py-2 font-medium border-b-2 transition-all ${
              sourceType === 'sheet'
                ? 'border-[#1E3A2F] text-[#1E252B] font-semibold'
                : 'border-transparent text-[#78716C] hover:text-[#1E252B]'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Google Spreadsheet</span>
          </button>
          <button
            onClick={() => { setSourceType('rest_api'); setStatus(null); }}
            className={`flex items-center gap-1.5 px-3 py-2 font-medium border-b-2 transition-all ${
              sourceType === 'rest_api'
                ? 'border-[#1E3A2F] text-[#1E252B] font-semibold'
                : 'border-transparent text-[#78716C] hover:text-[#1E252B]'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>REST API / Database Endpoint</span>
          </button>
          <button
            onClick={() => { setSourceType('raw_json'); setStatus(null); }}
            className={`flex items-center gap-1.5 px-3 py-2 font-medium border-b-2 transition-all ${
              sourceType === 'raw_json'
                ? 'border-[#1E3A2F] text-[#1E252B] font-semibold'
                : 'border-transparent text-[#78716C] hover:text-[#1E252B]'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>JSON / TSV Payload</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-[#292524]">
          {sourceType !== 'raw_json' ? (
            <div className="space-y-3">
              <label className="block text-[11px] font-medium text-[#57534E]">
                {sourceType === 'sheet' ? 'Google Spreadsheet URL *' : 'Database API Endpoint URL (JSON) *'}
              </label>
              <input
                type="url"
                placeholder={
                  sourceType === 'sheet'
                    ? 'https://docs.google.com/spreadsheets/d/your-id/edit'
                    : 'https://api.example.com/v1/students'
                }
                value={dbUrl}
                onChange={(e) => setDbUrl(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-[#E2DFD8] rounded-xl bg-[#FAF9F6] focus:outline-none focus:ring-1 focus:ring-[#1E3A2F] font-mono text-[#1E252B]"
              />
              <p className="text-[11px] text-[#78716C]">
                {sourceType === 'sheet'
                  ? 'Ensure sharing is set to "Anyone with the link can view". The frontend extracts columns A to N.'
                  : 'Endpoint should return an array of objects. Fields will automatically map to the 14 CRM columns.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-[11px] font-medium text-[#57534E]">
                Paste JSON Array or TSV Copied Rows:
              </label>
              <textarea
                rows={6}
                placeholder='[{"studentId": "STU-1001", "firstName": "Ayaan", "lastName": "Khan", "applyingGrade": "Grade 4"}]'
                value={rawPayload}
                onChange={(e) => setRawPayload(e.target.value)}
                className="w-full p-3 font-mono text-[11px] border border-[#E2DFD8] rounded-xl bg-[#FAF9F6] focus:outline-none focus:ring-1 focus:ring-[#1E3A2F]"
              />
            </div>
          )}

          {status && (
            <div
              className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs animate-in fade-in duration-150 ${
                status.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : status.type === 'error'
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              {status.type === 'success' ? (
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed">{status.message}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#EAE8E4] bg-[#FAF9F6] flex items-center justify-between text-xs">
          <span className="text-[#78716C]">Maps to Columns A:N automatically</span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-[#57534E] hover:bg-[#F2EFE9] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleFetch}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#1E3A2F] hover:bg-[#162D24] text-white rounded-lg font-medium transition-colors disabled:opacity-50 shadow-2xs"
            >
              {isLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>Fetch & Load Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
