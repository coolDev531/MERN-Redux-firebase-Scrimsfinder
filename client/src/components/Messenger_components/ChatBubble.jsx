import styled from '@emotion/styled';
import { getRankImage } from './../../utils/getRankImage';
import Moment from 'react-moment';
import 'moment-timezone';

export default function ChatBubble({
  isCurrentUser,
  messageText,
  messageDate,
  userName,
  userRank,
}) {
  const rankImage = getRankImage(userRank);

  return (
    <StyledBubble isCurrentUser={isCurrentUser}>
      <div className="bubble__username">
        <img src={rankImage} width="20px" alt={`${userName}'s rank`} />
        <span>{userName}</span>
      </div>

      <p className={`${isCurrentUser ? 'from-me' : 'from-them'}`}>
        {messageText}
      </p>

      <div className="bubble__message-date">
        {/* Including ago with fromNow will omit the suffix from the relative time. */}
        <Moment fromNow>{messageDate}</Moment>
      </div>
    </StyledBubble>
  );
}

// https://freefrontend.com/css-speech-bubbles/

const StyledBubble = styled.div`
  display: flex;
  align-items: ${({ isCurrentUser }) =>
    isCurrentUser ? 'flex-end' : 'flex-start'};
  flex-direction: column;
  padding: 20px; // some padding to avoid overflow

  .bubble__username {
    display: flex;
    align-items: center;
    margin: 5px 0px;
    /* position: relative; */
    /* left: ${({ isCurrentUser }) => (isCurrentUser ? '-5px' : '5px')}; */
    /* top: 5px; */

    img {
      margin-right: 5px;
    }
  }

  p {
    border-radius: 1.15rem;
    line-height: 1.25;
    max-width: 75%;
    padding: 0.5rem 0.875rem;
    position: relative;
    word-wrap: break-word;
  }

  // little bubble bottom edge
  p::before,
  p::after {
    bottom: -0.1rem;
    content: '';
    height: 1rem;
    position: absolute;
  }

  p.from-me {
    /* align-self: flex-end; */
    background-color: #248bf5;
    color: #fff;
  }

  p.from-me::before {
    // bubble edge shape
    border-bottom-left-radius: 0.8rem 0.7rem;
    border-right: 1rem solid #248bf5;
    right: -0.35rem;
    transform: translate(0, -0.1rem);
  }

  p.from-me::after {
    /* fake edge of bubble with another shape (color of background) */
    background-color: #606060;
    border-bottom-left-radius: 0.5rem;
    right: -40px;
    transform: translate(-30px, -2px);
    width: 10px;
  }

  p[class^='from-'] {
    margin: 0.5rem 0;
    width: fit-content;
  }

  p.from-me ~ p.from-me {
    margin: 0.25rem 0 0;
  }

  p.from-me ~ p.from-me:not(:last-child) {
    margin: 0.25rem 0 0;
  }

  p.from-me ~ p.from-me:last-child {
    margin-bottom: 0.5rem;
  }

  p.from-them {
    align-items: flex-start;
    background-color: #e5e5ea;
    color: #000;
  }

  p.from-them:before {
    /* little edge shape */
    border-bottom-right-radius: 0.8rem 0.7rem;
    border-left: 1rem solid #e5e5ea;
    left: -0.35rem;
    transform: translate(0, -0.1rem);
  }

  p.from-them::after {
    // background cover
    background-color: #606060;
    border-bottom-right-radius: 0.5rem;
    left: 20px;
    transform: translate(-30px, -2px);
    width: 10px;
  }

  p[class^='from-'].emoji {
    background: none;
    font-size: 2.5rem;
  }

  p[class^='from-'].emoji::before {
    content: none;
  }

  .no-tail::before {
    display: none;
  }

  .margin-b_none {
    margin-bottom: 0 !important;
  }

  .margin-b_one {
    margin-bottom: 1rem !important;
  }

  .margin-t_one {
    margin-top: 1rem !important;
  }

  .bubble__message-date {
    font-size: 0.7rem;
    max-width: 30%;
    word-break: break-word;
    position: relative;
    left: ${({ isCurrentUser }) => (isCurrentUser ? '-5px' : '5px')};
  }
`;
