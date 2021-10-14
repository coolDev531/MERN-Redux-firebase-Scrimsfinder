import { useState, useMemo, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import useUsers from './../../../hooks/useUsers';
import { Link, useLocation } from 'react-router-dom';

// utils
import styled from '@emotion/styled';
import { levenshteinDistance } from '../../../utils/levenshteinDistance';
import { getRankImage } from './../../../utils/getRankImage';

// components
import Input from '@mui/material/Input';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Card from '@mui/material/Card';

// icons
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

export default function UserSearchBar({ isSearchOpen }) {
  const [showOptions, setShowOptions] = useState(false);
  const { allUsers, usersSearchValue } = useUsers();
  const [userInput, setUserInput] = useState(() => usersSearchValue);
  const dispatch = useDispatch();
  const { pathname } = useLocation();

  const filteredUsers = useMemo(() => {
    return allUsers
      .filter(({ name }) => {
        if (!userInput) return false;
        return name.toLowerCase().includes(userInput.toLowerCase());
      })
      .sort((a, b) => {
        // sort by levenshteinDistance
        const levA = levenshteinDistance(a.name, userInput);
        const levB = levenshteinDistance(b.name, userInput);

        return levA - levB;
      });
  }, [allUsers, userInput]);

  const handleChange = (e) => {
    const newUserInput = e.target.value;
    setUserInput(newUserInput);
    setShowOptions(true);
  };

  const handleReset = () => {
    setUserInput('');
    setShowOptions(false);
  };

  const handleClickOption = () => {
    setUserInput('');
    setShowOptions(false);
  };

  useEffect(() => {
    dispatch({ type: 'users/setSearch', payload: userInput });

    return () => {
      dispatch({ type: 'users/setSearch', payload: '' });
    };
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInput]);

  useEffect(() => {
    if (usersSearchValue === '') {
      setShowOptions(false);
      setUserInput('');
    }
  }, [usersSearchValue]);

  useEffect(() => {
    dispatch({ type: 'users/setSearch', payload: '' });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  //  renders dropdown or no options text
  const autoCompleteJSX = useMemo(() => {
    if (!isSearchOpen) return null;
    // if the user typed
    if (userInput && showOptions) {
      // if the user typed and we have filtered options, that means we should show the options
      if (filteredUsers.length) {
        return (
          <Dropdown
            className={`nav__dropdown${isSearchOpen ? ' visible' : ''}`}>
            <ul className="nav__dropdown-items">
              {filteredUsers.slice(0, 8).map((user) => {
                const rankImage = getRankImage(user);
                const regex = new RegExp('(' + userInput + ')', 'i');
                const userName = user.name.replace(regex, '<b>$1</b>'); // if it matches the search input, it will be bolded, else just as it is.

                return (
                  <Link
                    style={{ display: 'flex', alignItems: 'center' }}
                    onClick={handleClickOption}
                    to={`/users/${user.name}?region=${user.region}`}
                    className="nav__autocomplete-option"
                    key={user._id}>
                    <img
                      src={rankImage}
                      style={{ marginRight: '5px' }}
                      width="20px"
                      alt={user.rank}
                    />
                    <span
                      className="truncate"
                      dangerouslySetInnerHTML={{ __html: userName }}
                    />
                    ({user.region})
                  </Link>
                );
              })}
            </ul>
          </Dropdown>
        );
      } else {
        // else if the user typed and we have no options
        return (
          <div className="nav__no-option">
            <em>No Option!</em>
          </div>
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredUsers, userInput, showOptions]);

  return (
    <>
      <Search className="nav__search-container">
        <Input
          fullWidth
          type="text"
          className="nav__search-input"
          onChange={handleChange}
          value={userInput || ''}
          placeholder="Search users"
          endAdornment={
            <InputAdornment position="end">
              {userInput ? (
                <IconButton onClick={handleReset}>
                  <CloseIcon fontSize="medium" />
                </IconButton>
              ) : (
                <SearchIcon fontSize="medium" />
              )}
            </InputAdornment>
          }
        />
        {autoCompleteJSX}
      </Search>
    </>
  );
}

const Dropdown = styled(Card)`
  position: absolute;
  min-width: 250px;
  top: 38px;
  z-index: 5;
  background: #fff;
  box-shadow: -3px 5px 17px 1px #000;
  display: none;

  &.visible {
    display: block;
  }

  .truncate {
    display: block;
    width: 200px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const Search = styled.div`
  position: relative;
  z-index: 4;

  .nav__search-input {
    color: #fff;
  }

  .nav__dropdown-items {
    display: flex;
    flex-direction: column;
    align-items: start;
    list-style-type: none;
    padding-left: 0;
    margin-left: 0;
  }

  .nav__autocomplete-option {
    margin-left: auto;
    margin-right: auto;
    cursor: pointer;

    border-radius: 5px;
    padding: 10px;
    transition: all 250ms ease-in-out;

    text-decoration: none;

    color: #000;
    width: 95%;

    &:hover {
      background: #cccc;
    }
  }

  .nav__no-option {
    position: absolute;
    top: 38px;
  }
`;
