import { useState, useMemo, memo } from 'react';
import Input from '@mui/material/Input';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { debounce } from '../../utils/debounce';
import styled from '@emotion/styled';
import ListItem from '@mui/material/ListItem';
import List from '@mui/material/List';

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
          <List className="autocomplete options">
            {filteredOptions.map((option, key) => (
              <ListItem
                key={key}
                aria-label={option}
                className="autocomplete option"
                onClick={handleClickOption}>
                {option}
              </ListItem>
            ))}
          </List>
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
      <Container className="autocomplete search">
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
        {autoCompleteJSX}
      </Container>
    </>
  );
}

const Container = styled.div`
  position: relative;

  .options {
    list-style: none;
    border: 1px solid #979797;
    box-shadow: 0 3px 11px 0 rgb(0 0 0 / 29%);
    border-radius: 8px;
    box-sizing: border-box;
    min-height: fit-content;
    max-height: 300px;
    width: auto;
    overflow-y: auto;
    color: #545454;
    font-family: Roboto;
    font-size: 1.3rem;
    line-height: 18px;
    font-weight: 300;
    text-align: left;

    position: absolute;
    background: #fff;
    top: 39px;
    width: 240px;
    padding: 0;
    margin: 0;
  }

  .option {
    cursor: pointer;
    margin: 20px 10px;
    width: 90%;
    transition: all 250ms ease-in-out;
    padding-bottom: 10px;
    padding-top: 10px;
    padding-left: 5px;

    &:hover {
      background: #cccc;
      color: #000;
      font-weight: 700;
    }
  }
`;

export default memo(AutoComplete); // optimize rerender when props change with memo
