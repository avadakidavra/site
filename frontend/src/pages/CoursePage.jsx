import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, getToken } from '../api/client.js';

export default function CoursePage() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api(`/courses/${id}`)
      .then((data) => {
        setCourse(data);
        setSubmitted(false);
        setResults({});
      })
      .catch((err) => setError(err.message));
  }, [id]);

  const answeredCount = useMemo(() => {
    if (!course) return 0;
    return course.tests.filter((test) => String(answers[test.id] || '').trim()).length;
  }, [answers, course]);

  const correctCount = Object.values(results).filter(Boolean).length;
  const quizProgress = course?.tests.length ? Math.round((answeredCount / course.tests.length) * 100) : 0;
  const scoreProgress = course?.tests.length && submitted ? Math.round((correctCount / course.tests.length) * 100) : 0;

  async function submitQuiz(event) {
    event.preventDefault();
    setError('');

    if (!getToken()) {
      setError('Нужно войти, чтобы проходить тест');
      return;
    }

    if (!course?.tests.length) return;

    try {
      const pairs = await Promise.all(course.tests.map(async (test) => {
        const result = await api(`/tests/${test.id}/submit`, {
          method: 'POST',
          body: JSON.stringify({ answer: answers[test.id] || '' })
        });
        return [test.id, result.correct];
      }));

      setResults(Object.fromEntries(pairs));
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    }
  }

  if (error && !course) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container py-5">
        <div className="loading-card">Загрузка курса...</div>
      </div>
    );
  }

  return (
    <section className="course-page">
      <Link className="back-link" to="/courses">Назад к курсам</Link>

      <div className="course-stage">
        <div className="course-stage-copy">
          <span className="eyebrow">Курс #{course.id}</span>
          <h1>{course.title}</h1>
          <p>{course.description || 'Описание курса пока не заполнено.'}</p>
        </div>
        <div className="course-orbit" aria-hidden="true">
          <span className="orbit-label top">{course.lessons.length} уроков</span>
          <span className="orbit-core">{course.tests.length}</span>
          <span className="orbit-label bottom">вопросов в квизе</span>
        </div>
      </div>

      <div className="learning-path">
        <div className="path-column">
          <div className="section-heading">
            <div>
              <span className="eyebrow text-primary">Учебный маршрут</span>
              <h2>Уроки</h2>
            </div>
          </div>

          {course.lessons.length === 0 && (
            <div className="empty-state compact">
              <h3>Уроков пока нет</h3>
              <p>Администратор может добавить материалы в студии.</p>
            </div>
          )}

          <div className="timeline-lessons">
            {course.lessons.map((lesson, index) => (
              <article className="timeline-card" key={lesson.id}>
                <span className="timeline-index">{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{lesson.title}</h3>
                  <p>{lesson.content}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="quiz-lab">
          <div className="quiz-lab-head">
            <span className="eyebrow">Финальный квиз</span>
            <h2>{course.tests.length > 1 ? `${course.tests.length} вопросов` : '1 вопрос'}</h2>
            <p>Ответь на всё и отправь тест целиком. Результат появится одной красивой сводкой.</p>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}
          {course.tests.length === 0 && <p className="text-muted">Тестов пока нет.</p>}

          {course.tests.length > 0 && (
            <form onSubmit={submitQuiz}>
              <div className="quiz-progress-wrap">
                <div className="quiz-progress-copy">
                  <span>Заполнено</span>
                  <strong>{answeredCount}/{course.tests.length}</strong>
                </div>
                <div className="quiz-progress">
                  <span style={{ width: `${quizProgress}%` }} />
                </div>
              </div>

              <div className="quiz-stack">
                {course.tests.map((test, index) => (
                  <label className="quiz-question" key={test.id}>
                    <span className="quiz-badge">Q{index + 1}</span>
                    <strong>{test.question}</strong>
                    <input
                      className="form-control"
                      value={answers[test.id] || ''}
                      onChange={(event) => {
                        setSubmitted(false);
                        setAnswers({ ...answers, [test.id]: event.target.value });
                      }}
                      placeholder="Ваш ответ"
                    />
                    {submitted && (
                      <span className={`answer-status ${results[test.id] ? 'is-correct' : 'is-wrong'}`}>
                        {results[test.id] ? 'Верно' : 'Неверно'}
                      </span>
                    )}
                  </label>
                ))}
              </div>

              <button className="btn btn-ink btn-lg w-100" type="submit">Проверить весь квиз</button>

              {submitted && (
                <div className="quiz-result-panel">
                  <div className="result-ring" style={{ '--score': `${scoreProgress}%` }}>
                    <span>{scoreProgress}%</span>
                  </div>
                  <div>
                    <strong>{correctCount} из {course.tests.length} правильных</strong>
                    <p>{scoreProgress >= 70 ? 'Отлично, курс усвоен уверенно.' : 'Есть что повторить, но теперь видно где именно.'}</p>
                  </div>
                </div>
              )}
            </form>
          )}
        </aside>
      </div>
    </section>
  );
}
