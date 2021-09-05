import { useLocation } from 'react-router-dom';

export default function NotFound() {
  const { pathname } = useLocation();

  return (
    <main className="page-content">
      <div className="centered" style={{ width: 'auto' }}>
        <h1>
          Oops, <br />
          {pathname.replace('/', '')} doesn't exist!
        </h1>
      </div>
    </main>
  );
}
