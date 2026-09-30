import React from 'react';

interface HeaderProps {
  recordCount: number;
}

export const Header: React.FC<HeaderProps> = ({ recordCount }) => {
  return (
    <header className="sticky top-0 z-30 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#EAE8E4] px-6 py-3.5 transition-colors">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-3">
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
              Comprehensive Student Admissions & Records Management
            </div>
          </div>
        </div>

        {/* Record count indicator */}
        <div className="text-xs font-mono text-[#78716C] bg-[#FAF9F6] border border-[#E2DFD8] px-3 py-1.5 rounded-xl">
          <span className="font-semibold text-[#1E252B]">{recordCount}</span> student{recordCount === 1 ? '' : 's'}
        </div>
      </div>
    </header>
  );
};
