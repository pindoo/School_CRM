import React, { useState } from 'react';
import { StudentRecord, EXACT_SHEET_COLUMNS } from '../types/crm';
import { X, Trash2, Edit2, Check, Printer } from 'lucide-react';

interface StudentDetailModalProps {
  student: StudentRecord | null;
  onClose: () => void;
  onUpdateRecord: (updated: StudentRecord) => void;
  onDeleteRecord: (id: string) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  onClose,
  onUpdateRecord,
  onDeleteRecord,
}) => {
  if (!student) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<StudentRecord>({ ...student });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateRecord(formData);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Delete record for ${student.firstName} ${student.lastName}?`)) {
      onDeleteRecord(student.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E252B]/40 backdrop-blur-xs">
      <div 
        className="bg-[#FFFFFF] border border-[#E2DFD8] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EAE8E4] flex items-center justify-between bg-[#FBFBFA]">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-serif font-semibold text-[#1E252B]">
                {student.firstName} {student.lastName}
              </h3>
              <span className="font-mono text-xs text-[#1E3A2F] bg-[#F2F7F4] border border-[#CDE0D5] px-2 py-0.2 rounded-md font-semibold">
                {student.studentId}
              </span>
            </div>
            <p className="text-xs text-[#78716C]">
              Application No: {student.applicationNumber} · Applying Grade: {student.applyingGrade}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-1.5 rounded-lg border border-[#E2DFD8] hover:bg-[#F2EFE9] text-[#57534E] text-xs transition-colors"
              title="Edit Record"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-lg border border-[#E2DFD8] hover:bg-rose-50 text-rose-600 text-xs transition-colors"
              title="Delete Record"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-[#F2EFE9] flex items-center justify-center text-[#78716C]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        {!isEditing ? (
          <div className="p-6 overflow-y-auto space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
              {EXACT_SHEET_COLUMNS.map((col) => {
                const val = (student as any)[col.key];
                return (
                  <div key={col.key} className="bg-[#FAF9F6] border border-[#F2EFE9] p-3 rounded-xl">
                    <div className="flex items-center justify-between text-[10px] text-[#78716C] uppercase font-mono">
                      <span>{col.label}</span>
                      <span className="font-bold text-[#1E3A2F]">Col {col.letter}</span>
                    </div>
                    <div className="font-medium text-[#1E252B] mt-1 text-sm font-sans">
                      {val || '—'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {EXACT_SHEET_COLUMNS.map((col) => {
                const val = (formData as any)[col.key] || '';
                return (
                  <div key={col.key}>
                    <label className="block text-[11px] font-medium text-[#57534E] mb-1">
                      Col {col.letter}: {col.label}
                    </label>
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => setFormData({ ...formData, [col.key]: e.target.value })}
                      className="w-full px-3 py-1.5 border border-[#E2DFD8] rounded-lg text-xs font-mono"
                    />
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-[#EAE8E4] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3.5 py-1.5 text-xs text-[#57534E] hover:bg-[#F2EFE9] rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-medium text-white bg-[#1E3A2F] hover:bg-[#162D24] rounded-lg"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#EAE8E4] bg-[#FAF9F6] flex items-center justify-between text-xs text-[#78716C]">
          <span>Academic Year: {student.academicYear} · Type: {student.admissionType}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-[#1E252B] bg-[#FFFFFF] border border-[#E2DFD8] hover:bg-[#F2EFE9] rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
