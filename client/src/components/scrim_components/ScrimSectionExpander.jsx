// hooks
import { useState, useCallback } from 'react';

// components
import Tooltip from '../shared/Tooltip';

// utils
import { COLORS } from './../../appTheme';
import styled from '@emotion/styled'; // decided to use styled components because this is too much css

// icons
import ShowLessIcon from '@mui/icons-material/ExpandLess';
import ShowMoreIcon from '@mui/icons-material/ExpandMore';

// the expand more or less button at the bottom of the scrim box at the home page
export default function ScrimSectionExpander({
  isBoxExpanded,
  setIsBoxExpanded,
  scrimBoxRef,
  scrimId,
}) {
  const [isHover, setIsHover] = useState(false);

  const blinkScrimBox = useCallback(() => {
    // when user clicks the expand more or less button, have an opacity transition to indicate where it is.

    // web animations api
    scrimBoxRef.current.animate(
      [{ opacity: 0, easing: 'ease-in' }, { opacity: 1 }],
      {
        direction: 'alternate',
        duration: 400,
        iterations: 1,
      }
    );
  }, [scrimBoxRef]);

  const scrollToScrimBox = useCallback(() => {
    window.scrollTo({
      behavior: 'smooth',
      top: scrimBoxRef.current?.offsetTop,
    });
  }, [scrimBoxRef]);

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
              setIsBoxExpanded((prevState) => false);
              setIsHover(false);
              scrollToScrimBox();
              blinkScrimBox();
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
              setIsBoxExpanded(scrimId);
              setIsHover(false);
              scrollToScrimBox();
              blinkScrimBox();
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
  display: flex;
  justify-content: center;
  box-shadow: none;
  margin: auto;
  box-sizing: inherit;
  &.collapsed {
    border-bottom: 2px solid #404040;

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
