import React from 'react';

export const Table = ({ headers, children, className = '' }) => {
  return (
    <div className={`overflow-x-auto w-full border border-slate-200/80 rounded-xl bg-white shadow-sm ${className}`}>
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/75 text-xs uppercase font-semibold text-slate-600 tracking-wider">
            {headers.map((h, i) => (
              <th key={i} className="py-3.5 px-4 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-700">{children}</tbody>
      </table>
    </div>
  );
};
