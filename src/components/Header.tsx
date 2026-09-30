import React from 'react';
import { Database, RefreshCw, Layers } from 'lucide-react';

interface HeaderProps {
  onRefresh: () => void;
  onOpenDatabaseModal: () => void;
  recordCount: number;
  isFetching: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onRefresh,
  onOpenDatabaseModal,
  recordCount,
  isFetching,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#EAE8E4] px-6 py-3.5 transition-colors">
      <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Brand Lockup */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1E3A2F] text-[#FAF9F6] flex items-center justify-center font-serif text-lg font-semibold shadow-xs">
            RG
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-serif font-semibold tracking-tight text-[#1E252B]">
                Rising Glory
              </span>
              <span className="text-xs font-sans text-[#78716C] border-l border-[#E2DFD8] pl-2 font-medium">
                School CRM Dashboard
              </span>
            </div>
            <div className="text-[11px] text-[#78716C]">
              Comprehensive Admissions & Multi-Database Frontend Sync
            </div>
          </div>
        </div>

        {/* Database Connection & Refresh Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenDatabaseModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#1E3A2F] bg-[#F2F7F4] hover:bg-[#E5EFEA] border border-[#CDE0D5] rounded-xl transition-colors shadow-2xs"
            title="Configure and fetch from any database or Google Sheet"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Fetch from Database</span>
          </button>

          <button
            onClick={onRefresh}
            disabled={isFetching}
            className="p-1.5 rounded-xl border border-[#E2DFD8] bg-[#FAF9F6] hover:bg-[#F2EFE9] text-[#57534E] hover:text-[#1E252B] transition-colors disabled:opacity-50"
            title="Refresh database records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
};
