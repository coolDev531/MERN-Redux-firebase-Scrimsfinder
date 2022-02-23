import axios from 'axios';

export const generateRandomLobbyName = async () => {
  try {
    const randomWordUrl = 'https://gitcat-words-api.herokuapp.com/api/word';

    const promise1 = axios.get(randomWordUrl);
    const promise2 = axios.get(randomWordUrl);

    const [
      {
        data: { word: first },
      },
      {
        data: { word: second },
      },
    ] = await Promise.all([promise1, promise2]);

    return `${first} ${second}`;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
