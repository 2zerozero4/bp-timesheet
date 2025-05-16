import React from 'react';
import { AlertTriangle } from 'lucide-react';

type DeleteTurnoModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
};

function DeleteTurnoModal({ isOpen, onClose, onDelete }: DeleteTurnoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal p-6 max-w-md">
        <div className="flex items-center mb-4">
          <div className="mr-3 flex-shrink-0 flex items-center justify-center rounded-full bg-danger-100 h-10 w-10">
            <AlertTriangle className="h-5 w-5 text-danger-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Conferma eliminazione</h3>
        </div>
        
        <div className="mt-2">
          <p className="text-sm text-gray-500">
            Sei sicuro di voler eliminare questo turno? Questa azione non può essere annullata.
          </p>
        </div>
        
        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
          >
            Annulla
          </button>
          <button
            type="button"
            className="btn-danger"
            onClick={onDelete}
          >
            Elimina
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteTurnoModal;