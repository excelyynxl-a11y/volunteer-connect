import { useEffect } from "react";
import { ExternalLink, X } from "lucide-react";

import "./ResumePreviewModal.css";

const ResumePreviewModal = ({ isOpen, onClose, resumeUrl }) => {
  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !resumeUrl) return null;

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="resume-preview-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="resume-preview-title"
      onMouseDown={handleOverlayClick}
    >
      <div className="resume-preview-modal">
        <header className="resume-preview-header">
          <div>
            <p>Application Document</p>
            <h2 id="resume-preview-title">Resume Preview</h2>
          </div>

          <div className="resume-preview-header-actions">
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open resume in a new tab"
              title="Open in new tab"
            >
              <ExternalLink size={20} aria-hidden="true" />
            </a>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close resume preview"
              title="Close"
            >
              <X size={22} aria-hidden="true" />
            </button>
          </div>
        </header>

        <iframe
          className="resume-preview-frame"
          src={resumeUrl}
          title="Volunteer resume preview"
        />
      </div>
    </div>
  );
};

export default ResumePreviewModal;
