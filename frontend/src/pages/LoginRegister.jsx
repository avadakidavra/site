import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, setSession } from '../api/client.js';

export default function LoginRegister() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', role: 'USER' });
  const [error, setError] = useState('');

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submit(event) {
    event.preventDefault();
    setError('');

    try {
      const path = mode === 'login' ? '/auth/login' : '/auth/register';
      const payload = mode === 'login'
        ? { email: form.email, password: form.password }
        : form;
      const result = await api(path, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      setSession(result);
      navigate('/courses');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-visual">
        <span className="eyebrow">Online Learning</span>
        <h1>Учебный кабинет для курсов, уроков и быстрых тестов</h1>
        <p>Минимальный MVP уже подключен к PostgreSQL, JWT и ролям. Осталось войти и наполнить платформу.</p>
        <div className="stat-row">
          <div><strong>JWT</strong><span>авторизация</span></div>
          <div><strong>Admin</strong><span>контент</span></div>
          <div><strong>Tests</strong><span>проверка</span></div>
        </div>
      </div>

      <div className="auth-card">
        <span className="eyebrow text-primary">Аккаунт</span>
        <h2>{mode === 'login' ? 'Вход' : 'Регистрация'}</h2>
        <div className="btn-group w-100 mb-4" role="group" aria-label="Выбор режима">
          <button type="button" className={`btn ${mode === 'login' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setMode('login')}>Вход</button>
          <button type="button" className={`btn ${mode === 'register' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setMode('register')}>Регистрация</button>
        </div>
        <form onSubmit={submit}>
          <label className="form-label">
            Email
            <input className="form-control form-control-lg" name="email" type="email" value={form.email} onChange={updateField} required />
          </label>
          <label className="form-label">
            Пароль
            <input className="form-control form-control-lg" name="password" type="password" minLength="6" value={form.password} onChange={updateField} required />
          </label>
          {mode === 'register' && (
            <label className="form-label">
              Роль
              <select className="form-select form-select-lg" name="role" value={form.role} onChange={updateField}>
                <option value="USER">user</option>
                <option value="ADMIN">admin</option>
              </select>
            </label>
          )}
          {error && <div className="alert alert-danger">{error}</div>}
          <button className="btn btn-dark btn-lg w-100" type="submit">{mode === 'login' ? 'Войти' : 'Создать аккаунт'}</button>
        </form>
      </div>
    </section>
  );
}
