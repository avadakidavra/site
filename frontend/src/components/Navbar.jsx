import { Link, NavLink, useNavigate } from 'react-router-dom';
import { clearSession, getUser } from '../api/client.js';

export default function Navbar() {
  const navigate = useNavigate();
  const user = getUser();

  function logout() {
    clearSession();
    navigate('/auth');
  }

  return (
    <nav className="navbar navbar-expand-lg app-navbar sticky-top">
      <div className="container">
        <Link className="navbar-brand brand-mark" to="/courses">
          <span className="brand-icon">OL</span>
          <span>Online Learning</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
          aria-controls="mainNavbar"
          aria-expanded="false"
          aria-label="Открыть меню"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="mainNavbar">
          <div className="navbar-nav ms-auto align-items-lg-center gap-lg-2">
            <NavLink className="nav-link" to="/courses">Курсы</NavLink>
            {user?.role === 'ADMIN' && <NavLink className="nav-link" to="/admin">Студия</NavLink>}
            {user ? (
              <div className="dropdown">
                <button className="btn btn-light user-chip dropdown-toggle" data-bs-toggle="dropdown" type="button">
                  {user.email}
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li><span className="dropdown-item-text text-muted">{user.role.toLowerCase()}</span></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><button className="dropdown-item" type="button" onClick={logout}>Выйти</button></li>
                </ul>
              </div>
            ) : (
              <NavLink className="btn btn-primary nav-action" to="/auth">Войти</NavLink>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
