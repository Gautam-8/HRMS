import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 transition-opacity">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 p-0 relative animate-fadeIn">
        {children}
      </div>
    </div>
  );
};

export const ModalContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">{children}</div>
);

export const ModalHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="px-6 pt-6 pb-2 border-b border-gray-200">
    <h2 className="text-2xl font-semibold">{children}</h2>
  </div>
);

export const ModalBody: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="py-4 space-y-4">{children}</div>
);

export const ModalFooter: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="px-6 pb-6 pt-2 flex justify-end space-x-2 border-t border-gray-200">{children}</div>
);

export const Button: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
  <button
    onClick={onClick}
    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
  >
    {children}
  </button>
); 