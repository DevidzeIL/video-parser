import React, { useEffect, useState } from 'react';
import arrowUpIcon from 'src/assets/icons/arrow-up.svg';
import arrowDownIcon from 'src/assets/icons/arrow-down.svg';
import './Dropdown.css';

interface Props {
  id: string;
  currentValue: string;
  values: string[];
  onChange: (value: string) => void;
}

export const Dropdown: React.FC<Props> = ({ id, currentValue, values, onChange }) => {
  const [selectedValue, setSelectedValue] = useState(currentValue);
  const [isOpen, setIsOpen] = useState(false);

  const handleValueChange = (value: string) => {
    setSelectedValue(value);
    onChange(value);
    setIsOpen(false);
  };

  useEffect(() => {
    setSelectedValue(currentValue);
  }, [currentValue]);

  const filteredValues = values.filter((value) => value !== currentValue);

  return (
    <div className={`dropdown ${isOpen ? 'open' : ''}`} id={`dropdown-${id}`}>
      <div className="dropdown-selected" onClick={() => setIsOpen(!isOpen)}>
        {selectedValue}
        <img src={isOpen ? arrowUpIcon : arrowDownIcon} alt="toggle" />
      </div>
      {isOpen && (
        <div className="dropdown-options">
          {filteredValues.map((value) => (
            <div key={value} className="dropdown-option" onClick={() => handleValueChange(value)}>
              {value}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
