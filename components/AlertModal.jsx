import { Dialog } from '@headlessui/react';

const AlertModal = ({ isOpen, onClose, title, message }) => {
  return (
    <Dialog open={isOpen} onClose={onClose}>
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <Dialog.Panel className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Title className="text-lg font-bold">{title}</Dialog.Title>
        <Dialog.Description className="mt-2">{message}</Dialog.Description>
        <div className="mt-4">
          <button onClick={onClose} className="px-4 py-2 bg-blue-500 text-white rounded">
            OK
          </button>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
};

export default AlertModal;