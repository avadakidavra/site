import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, getUser } from '../api/client.js';

const emptyQuestion = () => ({ question: '', answer: '' });

export default function AdminPanel() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState('');
  const [courseForm, setCourseForm] = useState({ title: '', description: '' });
  const [lessonForm, setLessonForm] = useState({ title: '', content: '', courseId: '' });
  const [testForm, setTestForm] = useState({ courseId: '', questions: [emptyQuestion(), emptyQuestion()] });

  const selectedCourse = useMemo(
    () => courses.find((course) => String(course.id) === String(testForm.courseId || lessonForm.courseId)),
    [courses, lessonForm.courseId, testForm.courseId]
  );

  useEffect(() => {
    if (getUser()?.role !== 'ADMIN') {
      navigate('/auth');
      return;
    }

    loadCourses();
  }, [navigate]);

  function showToast(title, details) {
    setToast({ title, details });
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => setToast(null), 3200);
  }

  async function loadCourses() {
    const data = await api('/courses');
    setCourses(data);
    const firstCourseId = data[0]?.id ? String(data[0].id) : '';
    setLessonForm((value) => ({ ...value, courseId: value.courseId || firstCourseId }));
    setTestForm((value) => ({ ...value, courseId: value.courseId || firstCourseId }));
  }

  async function submitCourse(event) {
    event.preventDefault();
    await submitAdmin('/courses', courseForm, () => {
      setCourseForm({ title: '', description: '' });
      loadCourses();
      showToast('Курс сохранён', 'Он уже появился в каталоге.');
    });
  }

  async function submitLesson(event) {
    event.preventDefault();
    await submitAdmin('/lessons', lessonForm, () => {
      setLessonForm({ title: '', content: '', courseId: lessonForm.courseId });
      showToast('Урок добавлен', 'Материал прикреплён к выбранному курсу.');
    });
  }

  async function submitTest(event) {
    event.preventDefault();
    const questions = testForm.questions.filter((item) => item.question.trim() && item.answer.trim());
    await submitAdmin('/tests', { courseId: testForm.courseId, questions }, () => {
      setTestForm({ courseId: testForm.courseId, questions: [emptyQuestion(), emptyQuestion()] });
      showToast('Квиз сохранён', `${questions.length} вопросов готовы для студентов.`);
      loadCourses();
    });
  }

  async function submitAdmin(path, payload, onSuccess) {
    setError('');

    try {
      await api(path, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      onSuccess();
    } catch (err) {
      setError(err.message);
    }
  }

  function updateQuestion(index, field, value) {
    setTestForm((current) => ({
      ...current,
      questions: current.questions.map((item, itemIndex) => (
        itemIndex === index ? { ...item, [field]: value } : item
      ))
    }));
  }

  function addQuestion() {
    setTestForm((current) => ({
      ...current,
      questions: [...current.questions, emptyQuestion()]
    }));
  }

  function removeQuestion(index) {
    setTestForm((current) => ({
      ...current,
      questions: current.questions.filter((_, itemIndex) => itemIndex !== index)
    }));
  }

  return (
    <section className="studio-page">
      {toast && <SaveToast title={toast.title} details={toast.details} onClose={() => setToast(null)} />}

      <div className="studio-hero">
        <div className="studio-hero-copy">
          <span className="eyebrow">Content cockpit</span>
          <h1>Собирай обучение как плейлист, а не как таблицу</h1>
          <p>Курс, урок и квиз живут рядом. Сохранил блок - он сразу появляется у студентов.</p>
        </div>
        <div className="studio-radar" aria-hidden="true">
          <span className="radar-node node-course">Course</span>
          <span className="radar-node node-lesson">Lesson</span>
          <span className="radar-node node-quiz">Quiz</span>
          <span className="radar-core">{courses.length}</span>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="studio-layout">
        <aside className="studio-sidebar">
          <span className="eyebrow text-primary">Курсы</span>
          <h2>Библиотека</h2>
          <div className="mini-course-list">
            {courses.length === 0 && <p className="text-muted">Создай первый курс, и он появится здесь.</p>}
            {courses.map((course) => (
              <div className="mini-course" key={course.id}>
                <span>{String(course.title || 'OL').slice(0, 2).toUpperCase()}</span>
                <div>
                  <strong>{course.title}</strong>
                  <small>{course._count?.lessons || 0} уроков • {course._count?.tests || 0} вопросов</small>
                </div>
              </div>
            ))}
          </div>
          {selectedCourse && (
            <div className="selected-course-note">
              <small>Сейчас наполняется</small>
              <strong>{selectedCourse.title}</strong>
            </div>
          )}
        </aside>

        <div className="studio-workspace">
          <form className="craft-card course-craft" onSubmit={submitCourse}>
            <div className="craft-head">
              <span className="craft-number">01</span>
              <div>
                <h2>Новый курс</h2>
                <p>Обложка создаётся автоматически из названия.</p>
              </div>
            </div>
            <label className="form-label">
              Название
              <input className="form-control form-control-lg" value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} required />
            </label>
            <label className="form-label">
              Описание
              <textarea className="form-control" value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} />
            </label>
            <button className="btn btn-ink w-100" type="submit">Опубликовать курс</button>
          </form>

          <form className="craft-card lesson-craft" onSubmit={submitLesson}>
            <div className="craft-head">
              <span className="craft-number">02</span>
              <div>
                <h2>Урок</h2>
                <p>Добавь короткий материал или полноценный конспект.</p>
              </div>
            </div>
            <CourseSelect courses={courses} value={lessonForm.courseId} onChange={(courseId) => setLessonForm({ ...lessonForm, courseId })} />
            <label className="form-label">
              Название
              <input className="form-control" value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} required />
            </label>
            <label className="form-label">
              Контент
              <textarea className="form-control tall-textarea" value={lessonForm.content} onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })} required />
            </label>
            <button className="btn btn-ink w-100" type="submit">Добавить урок</button>
          </form>

          <form className="craft-card quiz-craft" onSubmit={submitTest}>
            <div className="craft-head">
              <span className="craft-number">03</span>
              <div>
                <h2>Квиз из нескольких вопросов</h2>
                <p>Студент пройдёт их одним блоком и увидит итоговый результат.</p>
              </div>
            </div>
            <CourseSelect courses={courses} value={testForm.courseId} onChange={(courseId) => setTestForm({ ...testForm, courseId })} />

            <div className="question-builder">
              {testForm.questions.map((item, index) => (
                <div className="question-row" key={index}>
                  <div className="question-row-head">
                    <strong>Вопрос {index + 1}</strong>
                    {testForm.questions.length > 1 && (
                      <button className="tiny-button" type="button" onClick={() => removeQuestion(index)}>Удалить</button>
                    )}
                  </div>
                  <input
                    className="form-control"
                    placeholder="Например: Что делает Prisma?"
                    value={item.question}
                    onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                    required
                  />
                  <input
                    className="form-control"
                    placeholder="Правильный ответ"
                    value={item.answer}
                    onChange={(e) => updateQuestion(index, 'answer', e.target.value)}
                    required
                  />
                </div>
              ))}
            </div>

            <div className="quiz-actions">
              <button className="btn btn-outline-dark" type="button" onClick={addQuestion}>Добавить вопрос</button>
              <button className="btn btn-ink" type="submit">Сохранить квиз</button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

function CourseSelect({ courses, value, onChange }) {
  return (
    <label className="form-label">
      Курс
      <select className="form-select" value={value} onChange={(e) => onChange(e.target.value)} required>
        <option value="">Выберите курс</option>
        {courses.map((course) => (
          <option key={course.id} value={course.id}>{course.title}</option>
        ))}
      </select>
    </label>
  );
}

function SaveToast({ title, details, onClose }) {
  return (
    <div className="save-toast" role="status">
      <button type="button" onClick={onClose} aria-label="Закрыть">×</button>
      <div className="toast-mark">
        <span />
      </div>
      <div>
        <strong>{title}</strong>
        <p>{details}</p>
      </div>
      <div className="toast-progress" />
    </div>
  );
}
