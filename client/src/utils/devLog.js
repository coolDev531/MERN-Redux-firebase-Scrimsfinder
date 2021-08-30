export default function devLog(...args) {
  if (process.env.NODE_ENV === 'development') {
    console.log(...args);
  }
}
