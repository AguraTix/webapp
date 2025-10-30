import React, { useState, useRef, useEffect } from 'react';

interface CustomDropdownProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  fullWidth?: boolean;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({ options, value, onChange, placeholder, disabled = false, fullWidth = true }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const [highlighted, setHighlighted] = useState<number>(-1);
  useEffect(() => {
    if (!open) setHighlighted(-1);
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (!open) {
      if (e.key === 'Enter' || e.key === ' ') setOpen(true);
      return;
    }
    if (e.key === 'ArrowDown') {
      setHighlighted((prev) => (prev < options.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      setHighlighted((prev) => (prev > 0 ? prev - 1 : options.length - 1));
    } else if (e.key === 'Enter' && highlighted >= 0) {
      onChange(options[highlighted]);
      setOpen(false);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const containerWidthClass = fullWidth ? 'w-full' : 'w-auto inline-block';
  const triggerWidthClass = fullWidth ? 'w-full' : 'w-auto';

  return (
    <div ref={ref} className={`relative ${containerWidthClass}`} tabIndex={disabled ? -1 : 0} onKeyDown={handleKeyDown}>
      <button
        type="button"
        className={`${triggerWidthClass} inline-flex justify-between items-center bg-[#18181B] text-white px-4 py-2 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-primary transition-all whitespace-nowrap ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
      >
        <span>{value || placeholder || 'Select...'}</span>
        <span className="ml-2 text-xs text-gray-400">▼</span>
      </button>
      {open && !disabled && (
        <ul
          className={`absolute left-0 mt-2 ${fullWidth ? 'w-full' : 'w-max min-w-[10rem]'} bg-[#18181B] rounded-lg shadow-xl z-50 py-2 border border-[#23232a] animate-fade-in`}
          role="listbox"
        >
          {options.map((option, idx) => (
            <li
              key={option}
              className={`px-4 py-2 cursor-pointer text-white transition-all select-none
                ${option === value ? 'bg-primary text-white' : ''}
                ${highlighted === idx ? 'bg-[#23232a]' : ''}`}
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              onMouseEnter={() => setHighlighted(idx)}
              role="option"
              aria-selected={option === value}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomDropdown; 