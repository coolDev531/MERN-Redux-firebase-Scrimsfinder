import axios from 'axios';

export const generateRandomLobbyName = async (wordsCount = 2) => {
  try {
    const randomWordUrl = `https://words-api-tkwg.onrender.com/api/words/random?count=${wordsCount}`;

    const { data: words } = await axios.get(randomWordUrl);

    return words.join(' ');
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// export const generateRandomLobbyName = async () => {
//   try {
//     const randomWordUrl = 'https://words-api-tkwg.onrender.com/api/word';

//     const promise1 = axios.get(randomWordUrl);
//     const promise2 = axios.get(randomWordUrl);

//     const [{ data: first }, { data: second }] = await Promise.all([
//       promise1,
//       promise2,
//     ]);

//     return `${first} ${second}`;
//   } catch (error) {
//     console.error(error);
//     throw error;
//   }
// };
