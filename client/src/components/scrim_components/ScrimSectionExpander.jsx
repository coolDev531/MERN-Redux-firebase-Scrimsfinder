import { useState } from 'react';

import ShowLessIcon from '@mui/icons-material/ExpandLess';
import ShowMoreIcon from '@mui/icons-material/ExpandMore';

import styled from 'styled-components'; // decided to use styled components because this is too much css
import Tooltip from '../shared/Tooltip';
import { COLORS } from './../../appTheme';

export default function ScrimSectionExpander({
  isBoxExpanded,
  setIsBoxExpanded,
  scrimBoxRef,
}) {
  const [isHover, setIsHover] = useState(false);

  return (
    <StyledDivider
      className={`scrim__expand--container ${
        isBoxExpanded ? 'collapsed' : ''
      }`}>
      {/*  I need to do it like this (ternary) to reset the tooltip */}
      {isBoxExpanded ? (
        <Tooltip title={'Show less'} open={isBoxExpanded && isHover}>
          <button
            onMouseOver={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
            className="scrim__expand--expandButton"
            onClick={() => {
              setIsBoxExpanded((prevState) => !prevState);
              setIsHover(false);
              window.scrollTo({
                behavior: 'smooth',
                top: scrimBoxRef.current?.offsetTop,
              });
            }}>
            <ShowLessIcon className="modal__expandIcon" />
          </button>
        </Tooltip>
      ) : (
        <Tooltip title={'Show More'} open={!isBoxExpanded && isHover}>
          <button
            onMouseOver={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
            className="scrim__expand--expandButton"
            onClick={() => {
              setIsBoxExpanded((prevState) => !prevState);
              setIsHover(false);
              window.scrollTo({
                behavior: 'smooth',
                top: scrimBoxRef.current?.offsetTop,
              });
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
  display: flex;
  justify-content: center;
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
    bottom: 0;
    min-width: 32px;
    min-height: 32px;
    max-width: 42px;
    max-height: 42px;
    border-width: 2px;
    background-color: ${COLORS.DK_BLUE_TRANSPARENT};
    backdrop-filter: blur(8px);
    padding-left: 0.8rem;
    padding-right: 0.8rem;
    border: 1px solid rgba(255, 255, 255, 0.7);
    transform: translateY(50%);
    align-items: center;
    appearance: none;
    cursor: pointer;
    display: flex;
    justify-content: center;
    opacity: 1;
    padding: 0.8rem;
    user-select: none;
    border-radius: 50%;
    transition: all 250ms ease-in-out;

    &:focus {
      outline: none;
    }

    &:hover {
      filter: contrast(0.6);
    }

    .modal__expandIcon {
      color: #fff;
    }
  }
`;
