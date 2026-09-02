import React from 'react';

export const Table = ({ headers = [], children, className = '' }) => {
  return (
    <div className={`bg-white rounded-xl overflow-hidden border border-[#e4e4df] shadow-sm ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#f4f4f0] text-slate-700 font-bold uppercase tracking-wider border-b border-[#e4e4df] text-[10px] font-mono">
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="py-3 px-4 first:pl-6 last:pr-6 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e4e4df] text-[#121316] font-medium">
            {children}
          </tbody>
        </table>
      </div>
    </div>
  );
};