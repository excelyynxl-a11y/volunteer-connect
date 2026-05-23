import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const CustomSelect = ({ value, placeholder, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const normalizedOptions = options.map((option) =>
    typeof option === "string" ? { label: option, value: option } : option,
  );
  const selectedOption = normalizedOptions.find((option) => option.value === value);

  return (
    <div
      className={`custom-select${isOpen ? " open" : ""}`}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsOpen(false);
        }
      }}
    >
      <button
        type="button"
        className={`custom-select-trigger${selectedOption ? "" : " placeholder"}`}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((currentValue) => !currentValue)}
      >
        <span>{selectedOption?.label || placeholder || "Select"}</span>
        <ChevronDown size={18} />
      </button>

      {isOpen ? (
        <div className="custom-select-menu">
          {normalizedOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={option.value === value ? "selected" : undefined}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default CustomSelect;
