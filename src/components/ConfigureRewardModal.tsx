import React from 'react';
import { X, Settings, Hammer } from 'lucide-react';
import { Button } from './Button';

interface ConfigureRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConfigureRewardModal: React.FC<ConfigureRewardModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
                <Settings size={20} className="text-secondary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Configure New Reward</h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Coming Soon Content */}
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Hammer size={40} className="text-warning" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Feature Coming Soon
            </h3>
            <p className="text-gray-600 max-w-sm mx-auto mb-6">
              The reward configuration feature is currently under development. 
              You'll be able to create and customize rewards here soon.
            </p>
            <Button
              variant="primary"
              onClick={onClose}
            >
              Got it
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
