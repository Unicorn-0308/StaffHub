import { useState } from 'react';
import { motion } from 'framer-motion';
import { Flag, X, AlertTriangle } from 'lucide-react';

interface FlagReasonModalProps {
  employeeName: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

const FlagReasonModal: React.FC<FlagReasonModalProps> = ({
  employeeName,
  onConfirm,
  onCancel,
}) => {
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim()) {
      onConfirm(reason.trim());
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-surface-950/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-surface-900 border border-surface-800 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-surface-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20">
              <AlertTriangle size={24} className="text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-surface-100">
                Flag Employee
              </h3>
              <p className="text-sm text-surface-500">
                {employeeName}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <label className="block text-sm font-medium text-surface-300 mb-2">
            Reason for flagging <span className="text-red-400">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter the reason for flagging this employee..."
            rows={4}
            autoFocus
            className="input resize-none"
            required
          />
          <p className="mt-2 text-xs text-surface-500">
            This reason will be visible to administrators reviewing flagged employees.
          </p>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!reason.trim()}
              className="btn bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Flag size={18} />
              Flag Employee
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default FlagReasonModal;

