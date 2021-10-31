import styled from '@emotion/styled';

// learned from: https://www.instagram.com/coding.artist/

// this was a loading decoration for the 2021 halloween event. Not currently used anymore
export default function Witch() {
  return (
    <Wrapper>
      <div className="witch__container">
        <div className="witch__hair">
          <div className="witch__hat" />

          <div className="witch__face">
            <div className="witch__eye" />
            <div className="witch__mouth" />
          </div>
        </div>

        <div className="witch__cloak">
          <div className="witch__hand-left">
            <div className="witch__stick" />
          </div>
        </div>
        <div className="witch__hand-right" />
      </div>

      <div className="witch__stick2" />
      <div className="witch__bubbles">
        <div className="witch__bubble1" />
        <div className="witch__bubble2" />
      </div>

      <div className="witch__claudron">
        <div className="witch__cauldron-handle" />
        <div className="witch__cauldron-stand" />
        <div className="witch__cauldron-potion" />
      </div>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  position: relative;
  /* position: absolute; */
  /* left: 0;
  right: 0;
  top: 0;
  bottom: 0; */
  /* margin: auto; */

  width: 330px;
  height: 480px;

  .witch__container {
    position: absolute;
    top: 100px;
    left: 110px;
  }

  .witch__hair {
    height: 0;
    width: 118px;
    border-bottom: 80px solid #ff7903;
    border-left: 20px solid transparent;
    border-right: 20px solid transparent;
  }

  .witch__hat {
    /* circular bottom of hat */
    background-color: #0b081b;
    width: 160px;
    height: 25px;
    border-radius: 50%;
    position: relative;
    right: 38px;
    bottom: 5px;

    /* middle of hat   */
    &:before {
      content: '';
      position: relative;
      width: 0;
      height: 0;
      border-left: 50px solid transparent;
      border-right: 50px solid transparent;
      border-bottom: 100px solid #0b081b;
      bottom: 100px;
      left: 28px;
    }

    /* tip of hat */
    &:after {
      width: 0;
      height: 0;
      content: '';
      border-top: 10px solid transparent;
      border-bottom: 10px solid transparent;
      border-left: 40px solid #0b081b;
      position: absolute;
      right: 45px;
      bottom: 85px;
      transform: rotate(20deg);
    }
  }

  .witch__face {
    background-color: #ffcb9b;
    height: 60px;
    width: 80px;
    border-radius: 0 0 40px 40px;
    z-index: 1;
    position: relative;
  }

  .witch__eye {
    background-color: #6155bd;
    height: 9px;
    width: 9px;
    border-radius: 50%;
    position: relative;
    top: 18px;
    left: 15.2px;
    box-shadow: 0 -3px 0 5px #1f1a43, 37px 0 0 0 #6155bd,
      37px -3px 0 5px #1f1a43;
  }

  .witch__mouth {
    /* initial mouth line _) */
    height: 2px;
    background-color: #000;
    width: 40px;
    position: relative;
    left: 20px;
    top: 30px;

    &:before,
    &:after {
      /* witch teeth */
      content: '';
      position: absolute;
      width: 0;
      height: 0;
      border-left: 4px solid transparent;
      border-right: 4px solid transparent;
      border-top: 7px solid #fff;
      top: 2px;
    }

    &:before {
      left: 4px;
    }

    &:after {
      right: 4px;
    }
  }

  .witch__cloak {
    height: 0;
    width: 160px;
    border-bottom: 180px solid #0e0c29;
    border-left: 40px solid transparent;
    border-right: 40px solid transparent;
    position: relative;
    right: 20px;
  }

  .witch__hand-left {
    background-color: #0e0c29;
    height: 30px;
    width: 70px;
    position: relative;
    right: 65px;
    bottom: 0;
    transform: rotate(20deg);
    transform-origin: right; // set the origin for an element's transformations.
    animation: wave 2s infinite;

    &:before {
      content: '';
      position: absolute;
      background-color: #ffcb9b;
      height: 25px;
      width: 20px;
      right: 70px;
      top: 2px;
      border-radius: 10px 0 0 10px;
    }

    &:after {
      /* the thumb for left hand */
      content: '';
      position: absolute;
      background-color: #ffcb9b;
      height: 10px;
      width: 10px;
      border-radius: 15px;
      top: 10px;
      right: 71px;
    }
  }

  .witch__stick {
    background-color: #b35900;
    height: 100px;
    width: 10px;
    border-radius: 10px;
    position: relative;
    bottom: 80px;
    left: -15px;
  }

  .witch__hand-right {
    background-color: #0e0c29;
    height: 80px;
    width: 30px;
    position: absolute;
    left: 90px;
    bottom: 98px;
    transform: rotate(-25deg);

    &:before {
      content: '';
      position: absolute;
      background-color: #ffcb9b;
      height: 15px;
      width: 20px;
      border-radius: 0 0 15px 15px;
      left: 10px;
      top: 80px;
    }
  }

  .witch__stick2 {
    background-color: #b35900;
    height: 200px;
    width: 18px;
    border-radius: 25px;
    transform: rotate(23deg);
    position: relative;
    top: 220px;
    left: 210px;
    animation: mix 4s infinite;
  }

  @keyframes wave {
    50% {
      transform: rotate(5deg);
    }
  }

  @keyframes mix {
    50% {
      transform: translateX(-100px) rotate(-23deg);
    }
  }

  .witch__bubble1 {
    background-color: #29a329;
    height: 30px;
    width: 30px;
    opacity: 0.6;
    border-radius: 50%;
    position: relative;
    top: 130px;
    left: 130px;
    animation: move-up-1 3s 0.5s infinite;
  }

  @keyframes move-up-1 {
    100% {
      transform: translateY(-95px);
    }
  }

  .witch__bubble2 {
    background-color: #29a329;
    height: 20px;
    width: 20px;
    opacity: 0.6;
    position: relative;
    border-radius: 50%;
    top: 130px;
    left: 210px;
    animation: move-up-2 3.2s 1.5s infinite;
  }

  @keyframes move-up-2 {
    100% {
      transform: translateY(-90px);
    }
  }

  .witch__claudron {
    background: #222222;
    height: 150px;
    width: 200px;
    position: relative;
    margin: auto;
    top: 50px;
    border-radius: 100px;

    &:before {
      content: '';
      position: absolute;
      background-color: #222222;
      height: 40px;
      width: 100%;
      border-radius: 50%;
    }
  }

  .witch__claudron-handle {
    background-color: transparent;
    height: 40px;
    width: 240px;
    border: 7px solid #222222;
    position: absolute;
    border-radius: 40px;
    margin: auto;
    left: 27px;
    top: 55px;
  }

  .witch__cauldron-stand,
  .witch__cauldron-stand:before {
    height: 0;
    width: 5px;
    border-top: 15px solid #222222;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    position: absolute;
  }

  .witch__cauldron-stand {
    bottom: -10px;
    transform: rotate(20deg);
    left: 40px;

    &:before {
      content: '';
      position: absolute;
      bottom: 35px;
      left: 90px;
      transform: rotate(-40deg);
    }
  }

  .witch__cauldron-potion {
    background-color: #29a329;
    height: 70px;
    width: 20px;
    border-radius: 0 0 50px 50px;
    position: relative;
    bottom: 0;
    left: 120px;

    &:before {
      content: '';
      position: absolute;
      height: 35px;
      background-color: #29a329;
      width: 15px;
      left: 30px;
      border-radius: 0 0 30px 30px;
    }

    &:after {
      content: '';
      position: absolute;
      background-color: #29a329;
      height: 22px;
      width: 50px;
      bottom: 70px;
      right: 60px;
      border-radius: 25px 25px 0 0;
      top: -16px;
    }
  }
`;
