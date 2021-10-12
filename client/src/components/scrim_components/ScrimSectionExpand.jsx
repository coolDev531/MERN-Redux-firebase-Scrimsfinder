import { useState } from 'react';

import ShowLessIcon from '@mui/icons-material/ExpandLess';
import ShowMoreIcon from '@mui/icons-material/ExpandMore';

import styled from 'styled-components'; // decided to use styled components because this is too much css
import Tooltip from './../shared/Tooltip';

export default function Divider({ expanded, setExpanded }) {
  const [isHover, setIsHover] = useState(false);

  return (
    <StyledDivider
      className={`scrim__expand--container ${expanded ? 'collapsed' : ''}`}>
      {/*  I need to do it like this (ternary) to reset the tooltip */}
      {expanded ? (
        <Tooltip title={'Show less'} open={expanded && isHover}>
          <button
            onMouseOver={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
            className="scrim__expand--expandButton"
            onClick={() => {
              setExpanded((prevState) => !prevState);
              setIsHover(false);
            }}>
            <ShowLessIcon className="modal__expandIcon" />
          </button>
        </Tooltip>
      ) : (
        <Tooltip title={'Show More'} open={!expanded && isHover}>
          <button
            onMouseOver={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
            className="scrim__expand--expandButton"
            onClick={() => {
              setExpanded((prevState) => !prevState);
              setIsHover(false);
            }}>
            <ShowMoreIcon className="modal__expandIcon" />
          </button>
        </Tooltip>
      )}
    </StyledDivider>
  );
}

const StyledDivider = styled.div`
  position: relative;
  width: 98%;

  max-width: 1100px;
  border-bottom: 2px solid #404040;
  display: -webkit-box;
  display: -webkit-flex;
  display: -moz-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-pack: center;
  -webkit-justify-content: center;
  -moz-box-pack: center;
  -ms-flex-pack: center;
  justify-content: center;
  -webkit-box-shadow: none;
  -moz-box-shadow: none;
  box-shadow: none;
  margin: auto;
  box-sizing: inherit;
  &.collapsed {
    height: 6em;
    margin-top: -6em;
    background-image: -webkit-gradient(
      linear,
      left bottom,
      left top,
      from(#181818),
      color-stop(20%, rgba(24, 24, 24, 0.7)),
      color-stop(30%, rgba(24, 24, 24, 0.4)),
      color-stop(50%, transparent)
    );
  }

  .scrim__expand--expandButton {
    position: absolute;
    min-width: 32px;
    min-height: 32px;
    max-width: 42px;
    max-height: 42px;
    border-width: 2px;
    background-color: rgba(42, 42, 42, 0.6);
    border-color: rgba(255, 255, 255, 0.5);
    padding-left: 0.8rem;
    padding-right: 0.8rem;
    border: 1px solid rgba(255, 255, 255, 0.7);
    color: white;
    bottom: 0;
    -webkit-transform: translateY(50%);
    -moz-transform: translateY(50%);
    -ms-transform: translateY(50%);
    -o-transform: translateY(50%);
    transform: translateY(50%);
    -webkit-box-align: center;
    align-items: center;
    appearance: none;
    cursor: pointer;
    display: flex;
    -webkit-box-pack: center;
    justify-content: center;
    opacity: 1;
    padding: 0.8rem;
    user-select: none;
    will-change: background-color, color;
    word-break: break-word;
    white-space: nowrap;
    border-radius: 50%;
    transition: all 250ms ease-in-out;
    &:focus {
      outline: none;
    }
    &:hover {
      filter: contrast(0.5);
    }
    .modal__expandIcon {
      color: #fff;
    }
  }
`;
