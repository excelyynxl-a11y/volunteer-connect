import { ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import "./BackButton.css";

const BackButton = ({ fallbackPath = "/" }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleBack = () => {
    if (location.key !== "default") {
      navigate(-1);
      return;
    }

    navigate(fallbackPath, { replace: true });
  };

  return (
    <button
      type="button"
      className="back-icon-button"
      onClick={handleBack}
      aria-label="Go back"
      title="Go back"
    >
      <ArrowLeft size={22} aria-hidden="true" />
    </button>
  );
};

export default BackButton;
