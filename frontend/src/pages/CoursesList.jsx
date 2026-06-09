import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';

export default function CoursesList() {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/courses')
      .then(setCourses)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <section className="container py-4">
      <div className="learning-hero mb-4">
        <div className="hero-copy">
          <span className="eyebrow">MVP платформа</span>
          <h1>Курсы, уроки и тесты в одном рабочем кабинете</h1>
          <p>Создавайте учебные материалы, открывайте курсы и проверяйте знания без лишней настройки.</p>
          <div className="hero-actions">
            <Link className="btn btn-light btn-lg" to="/auth">Начать обучение</Link>
            <Link className="btn btn-outline-light btn-lg" to="/admin">Админ-панель</Link>
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="visual-card visual-card-main">
            <span className="visual-dot" />
            <strong>React</strong>
            <small>frontend</small>
          </div>
          <div className="visual-card visual-card-side">
            <strong>JWT</strong>
            <small>auth</small>
          </div>
          <div className="visual-card visual-card-bottom">
            <strong>Prisma</strong>
            <small>PostgreSQL</small>
          </div>
        </div>
      </div>

      <div className="section-heading">
        <div>
          <span className="eyebrow text-primary">Каталог</span>
          <h2>Доступные курсы</h2>
        </div>
        <span className="course-count">{courses.length} курсов</span>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {courses.length === 0 && !error && (
        <div className="empty-state">
          <h3>Пока нет курсов</h3>
          <p>Зайдите администратором и создайте первый курс.</p>
          <Link className="btn btn-primary" to="/admin">Создать курс</Link>
        </div>
      )}

      <div className="course-grid">
        {courses.map((course, index) => (
          <article className="course-card" key={course.id}>
            <div className={`course-cover cover-${index % 4}`}>
              <span>{String(course.title || 'OL').slice(0, 2).toUpperCase()}</span>
            </div>
            <div className="course-body">
              <div className="course-meta">
                <span>{course._count?.lessons || 0} уроков</span>
                <span>{course._count?.tests || 0} тестов</span>
              </div>
              <h3>{course.title}</h3>
              <p>{course.description || 'Короткое описание курса появится здесь.'}</p>
              <Link className="btn btn-dark w-100" to={`/courses/${course.id}`}>Открыть курс</Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
