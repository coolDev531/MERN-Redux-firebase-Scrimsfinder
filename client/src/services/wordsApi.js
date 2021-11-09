import axios from 'axios';

export const generateRandomLobbyName = async () => {
  try {
    const promise1 = await axios.get(
      'https://random-words-api.vercel.app/word'
    );
    const promise2 = await axios.get(
      'https://random-words-api.vercel.app/word'
    );

    const response = await Promise.all([promise1, promise2]);

    // this api is returning an object which contains an array but the array will always have 1 object, Idk I was scratching my head.
    const [first, second] = response.map(({ data }) => data[0].word);

    return `${first} ${second}`;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
