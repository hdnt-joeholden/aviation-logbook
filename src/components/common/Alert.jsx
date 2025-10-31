import React from 'react';
import { X } from 'lucide-react';

export default function Alert({ type = 'success', message, onClose }) {
  const styles = {
    success: 'bg-green-50 border-green-200 text-green-700',
    error: 'bg-red-50 border-red-200 text-red-700'
  };

  return (
    <div className={`mb-4 p-3 border rounded-md text-sm flex justify-between items-center ${styles[type]}`}>
      <span>{message}</span>
      <button onClick={onClose} className={type === 'success' ? 'text-green-700 hover:text-green-900' : 'text-red-700 hover:text-red-900'}>
        <X size={16} />
      </button>
    </div>
  );
}