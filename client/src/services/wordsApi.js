import axios from 'axios';

export const generateRandomLobbyName = async () => {
  try {
    const promise1 = axios.get('https://random-word-api.herokuapp.com/word');
    const promise2 = axios.get('https://random-word-api.herokuapp.com/word');

    const response = await Promise.all([promise1, promise2]);

    // this api is returning an object which contains an array but the array will always have 1 object, Idk I was scratching my head.
    const [{ data: first }, { data: second }] = response;

    return `${first} ${second}`;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
