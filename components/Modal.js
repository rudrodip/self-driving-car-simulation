import React from "react";

const Modal = ({ isOpen, closeModal, logs }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-gray-900 opacity-50"></div>
      <div className="relative bg-white rounded-lg p-8 z-50">
        <h2 className="text-xl font-bold mb-4">Training completed</h2>
        <p className="mb-4">
          {logs.split('\n').map((line, index) => (
            <React.Fragment key={index}>
              {line}
              <br />
            </React.Fragment>
          ))}
        </p>
        <button
          className="bg-gray-900 text-white rounded px-4 py-2"
          onClick={closeModal}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default Modal;
