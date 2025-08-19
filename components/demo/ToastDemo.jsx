'use client';

import { useToast } from '@/lib/contexts/ToastContext';

const ToastDemo = () => {
  const { success, error, warning, info } = useToast();

  const handleSuccess = () => {
    success('Operation completed successfully!', {
      title: 'Success',
      duration: 4000
    });
  };

  const handleError = () => {
    error('Something went wrong. Please try again.', {
      title: 'Error',
      duration: 6000
    });
  };

  const handleWarning = () => {
    warning('Please check your input before continuing.', {
      title: 'Warning',
      duration: 5000
    });
  };

  const handleInfo = () => {
    info('Here is some useful information for you.', {
      title: 'Information',
      duration: 4000
    });
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-semibold mb-4">Toast Demo</h2>
      <div className="space-x-2">
        <button
          onClick={handleSuccess}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Success Toast
        </button>
        <button
          onClick={handleError}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Error Toast
        </button>
        <button
          onClick={handleWarning}
          className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
        >
          Warning Toast
        </button>
        <button
          onClick={handleInfo}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Info Toast
        </button>
      </div>
    </div>
  );
};

export default ToastDemo;