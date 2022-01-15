import { useState, useMemo, memo } from 'react';
import Input from '@mui/material/Input';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { debounce } from '../utils/debounce';

// css for this is in index.css
function AutoComplete({
  fullWidth,
  setFilterValue,
  valueProp,
  placeholder,
  filteredOptions,
}) {
  const [userInput, setUserInput] = useState('');
  const [showOptions, setShowOptions] = useState(false);

  // optimize to not lag with debounce
  const onChange = debounce((e) => {
    const userInput = e.target.value;
    setFilterValue(userInput); // using the setFilterValue from props, setting playerId  to e.target.value
    setShowOptions(true);
  }, 300);

  const handleReset = () => {
    setFilterValue('');
    setShowOptions(false);
    setUserInput('');
  };

  const handleClickOption = (e) => {
    setFilterValue(e.target.innerText);
    setShowOptions(false);
    setUserInput(e.target.innerText);
  };

  //  renders dropdown or no options text
  const autoCompleteJSX = useMemo(() => {
    // if the user typed
    if (userInput && showOptions) {
      // if the user typed and we have filtered options, that means we should show the options
      if (filteredOptions.length) {
        return (
          <ul className="autocomplete options">
            {filteredOptions.map((option, key) => (
              <li
                key={key}
                aria-label={option}
                className="autocomplete option"
                onClick={handleClickOption}>
                {option}
              </li>
            ))}
          </ul>
        );
      } else {
        // else if the user typed and we have no options
        return (
          <div className="autocomplete no-options">
            <em>No Option!</em>
          </div>
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredOptions, userInput, showOptions]);

  return (
    <>
      <div className="autocomplete search">
        <Input
          fullWidth={fullWidth ? true : false}
          type="text"
          className="autocomplete search-box"
          onChange={(e) => {
            // set user input before onChange because onchange uses debounce and debounce can't access e.target
            setUserInput(e.currentTarget.value);
            onChange(e);
          }}
          value={userInput || ''}
          placeholder={placeholder}
          endAdornment={
            valueProp ? (
              <InputAdornment position="end">
                <IconButton onClick={handleReset}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null
          }
        />
      </div>
      {autoCompleteJSX}
    </>
  );
}

export default memo(AutoComplete); // optimize rerender when props change with memo
