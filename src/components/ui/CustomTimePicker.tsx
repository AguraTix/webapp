import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, Clock } from 'lucide-react';

interface CustomTimePickerProps {
  value: string; // HH:MM format (24-hour)
  onChange: (time: string) => void;
  placeholder?: string;
}

const CustomTimePicker: React.FC<CustomTimePickerProps> = ({
  value,
  onChange,
  placeholder = 'Select time',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hours, setHours] = useState('18');
  const [minutes, setMinutes] = useState('00');

  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':');
      setHours(h.padStart(2, '0'));
      setMinutes(m.padStart(2, '0'));
    }
  }, [value]);

  const updateTime = (newHours: string, newMinutes: string) => {
    const formattedHours = newHours.padStart(2, '0');
    const formattedMinutes = newMinutes.padStart(2, '0');
    setHours(formattedHours);
    setMinutes(formattedMinutes);
    onChange(`${formattedHours}:${formattedMinutes}`);
  };

  const incrementHours = () => {
    const newHours = (parseInt(hours) + 1) % 24;
    updateTime(newHours.toString(), minutes);
  };

  const decrementHours = () => {
    const newHours = parseInt(hours) - 1 < 0 ? 23 : parseInt(hours) - 1;
    updateTime(newHours.toString(), minutes);
  };

  const incrementMinutes = () => {
    const newMinutes = (parseInt(minutes) + 15) % 60;
    updateTime(hours, newMinutes.toString());
  };

  const decrementMinutes = () => {
    const newMinutes = parseInt(minutes) - 15 < 0 ? 45 : parseInt(minutes) - 15;
    updateTime(hours, newMinutes.toString());
  };

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val === '' || (parseInt(val) >= 0 && parseInt(val) <= 23)) {
      updateTime(val || '0', minutes);
    }
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val === '' || (parseInt(val) >= 0 && parseInt(val) <= 59)) {
      updateTime(hours, val || '0');
    }
  };

  const presetTimes = [
    { label: 'Morning', time: '09:00' },
    { label: 'Noon', time: '12:00' },
    { label: 'Afternoon', time: '15:00' },
    { label: 'Evening', time: '18:00' },
    { label: 'Night', time: '20:00' },
    { label: 'Late', time: '22:00' },
  ];

  const selectPresetTime = (time: string) => {
    const [h, m] = time.split(':');
    updateTime(h, m);
    setIsOpen(false);
  };

  const formatDisplayTime = () => {
    if (!value) return placeholder;
    const h = parseInt(hours);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${displayHour}:${minutes} ${period}`;
  };

  return (
    <div className="relative w-full">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#23232B] text-white rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all text-left flex items-center justify-between"
      >
        <span className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          {formatDisplayTime()}
        </span>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Time Picker Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-[#18181B] rounded-lg shadow-2xl border border-[#23232B] p-4 animate-fade-in">
          {/* Hour and Minute Controls */}
          <div className="flex items-center justify-center gap-4 mb-4">
            {/* Hours */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={incrementHours}
                className="p-1 hover:bg-[#23232B] rounded transition-colors"
              >
                <ChevronUp className="w-5 h-5 text-white" />
              </button>
              <input
                type="text"
                value={hours}
                onChange={handleHoursChange}
                className="w-16 bg-[#23232B] text-white text-center text-2xl font-bold rounded-md py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                maxLength={2}
              />
              <button
                type="button"
                onClick={decrementHours}
                className="p-1 hover:bg-[#23232B] rounded transition-colors"
              >
                <ChevronDown className="w-5 h-5 text-white" />
              </button>
              <span className="text-xs text-[#CDCDE0] mt-1">Hours</span>
            </div>

            <span className="text-3xl text-white font-bold">:</span>

            {/* Minutes */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={incrementMinutes}
                className="p-1 hover:bg-[#23232B] rounded transition-colors"
              >
                <ChevronUp className="w-5 h-5 text-white" />
              </button>
              <input
                type="text"
                value={minutes}
                onChange={handleMinutesChange}
                className="w-16 bg-[#23232B] text-white text-center text-2xl font-bold rounded-md py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                maxLength={2}
              />
              <button
                type="button"
                onClick={decrementMinutes}
                className="p-1 hover:bg-[#23232B] rounded transition-colors"
              >
                <ChevronDown className="w-5 h-5 text-white" />
              </button>
              <span className="text-xs text-[#CDCDE0] mt-1">Minutes</span>
            </div>
          </div>

          {/* Preset Times */}
          <div className="border-t border-[#23232B] pt-4">
            <p className="text-xs text-[#CDCDE0] mb-2 font-medium">Quick Select</p>
            <div className="grid grid-cols-3 gap-2">
              {presetTimes.map((preset) => (
                <button
                  key={preset.time}
                  type="button"
                  onClick={() => selectPresetTime(preset.time)}
                  className={`
                    px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
                    ${value === preset.time
                      ? 'bg-primary text-white'
                      : 'bg-[#23232B] text-[#CDCDE0] hover:bg-[#2A2A2A] hover:text-white'
                    }
                  `}
                >
                  <div className="text-xs opacity-70">{preset.label}</div>
                  <div className="text-sm font-bold">{preset.time}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 pt-4 border-t border-[#23232B] flex justify-between items-center">
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                const currentHours = now.getHours().toString();
                const currentMinutes = now.getMinutes().toString();
                updateTime(currentHours, currentMinutes);
              }}
              className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
            >
              Now
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors text-sm font-medium"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomTimePicker;
