import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';
import { Button } from '../components/ui/Button.jsx';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 mb-4">
        <FileQuestion className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-bold text-slate-900">Page Not Found (404)</h2>
      <p className="mt-2 text-sm text-slate-500 max-w-md">
        The page or resource you are looking for does not exist.
      </p>
      <div className="mt-6">
        <Button onClick={() => navigate('/dashboard')} variant="primary">
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};
