import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';

export default function App() {
  return (
    <>
      <Navbar />
      <main className="app-shell">
        <Outlet />
      </main>
    </>
  );
}
