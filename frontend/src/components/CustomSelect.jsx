import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const CustomSelect = ({
  value,
  placeholder,
  options,
  onChange,
  className = "",
  disabled = false,
  emptyMessage = "No options available",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const normalizedOptions = options.map((option) =>
    typeof option === "string" ? { label: option, value: option } : option,
  );
  const selectedOption = normalizedOptions.find((option) => option.value === value);

  return (
    <div
      className={[
        "custom-select",
        isOpen ? "open" : "",
        disabled ? "disabled" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
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
        disabled={disabled}
        onClick={() => setIsOpen((currentValue) => !currentValue)}
      >
        <span>{selectedOption?.label || placeholder || "Select"}</span>
        <ChevronDown size={18} />
      </button>

      {isOpen ? (
        <div className="custom-select-menu">
          {normalizedOptions.length > 0 ? (
            normalizedOptions.map((option) => (
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
            ))
          ) : (
            <span className="custom-select-empty">{emptyMessage}</span>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default CustomSelect;
