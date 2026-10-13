import { useEffect, useState } from "react";
import { currentUser, logout, list } from "./api";
import Login from "./Login";
import Exams from "./Exams";
import Subjects from "./Subjects";
import Materials from "./Materials";
import Quiz from "./Quiz";

const AUTH_KEY = "cems_authenticated";
const NAV_KEY = "cems_navigation";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Data States
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [quizzes, setQuizzes] = useState([]);

  // Consolidated Navigation State
  const [nav, setNav] = useState({ exam: null, subject: null, tab: "materials" });

  /* =====================================================
     1. INITIAL AUTHENTICATION CHECK
     ===================================================== */
  useEffect(() => {
    if (sessionStorage.getItem(AUTH_KEY) === "true") {
      currentUser()
        .then(data => (data?.uid ? setUser(data) : handleLogout()))
        .catch(handleLogout)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  /* =====================================================
     2. LOAD EXAMS ON LOGIN
     ===================================================== */
  useEffect(() => {
    if (user) list("exam").then(setExams).catch(e => setError(e.message));
  }, [user]);

  /* =====================================================
     3. RESTORE NAVIGATION (Refresh-Safe Routing)
     ===================================================== */
  useEffect(() => {
    if (!user || !exams.length) return;
    try {
      const saved = JSON.parse(sessionStorage.getItem(NAV_KEY));
      if (!saved?.examId) return;

      const foundExam = exams.find(e => String(e.id) === String(saved.examId));
      if (!foundExam) return sessionStorage.removeItem(NAV_KEY);

      list("subject", `filter[field_em_exam.id]=${foundExam.id}`).then(subs => {
        setSubjects(subs);
        const foundSub = subs.find(s => String(s.id) === String(saved.subjectId));
        setNav({ exam: foundExam, subject: foundSub || null, tab: saved.tab || "materials" });
        if (foundSub) loadSubjectContent(foundSub);
      });
    } catch (e) {
      sessionStorage.removeItem(NAV_KEY);
    }
  }, [user, exams]);

  /* =====================================================
     4. HELPER FUNCTIONS
     ===================================================== */
  const loadSubjectContent = (subject) => {
    Promise.all([
      list("material", `filter[field_em_subject.id]=${subject.id}`),
      list("quiz", `filter[field_em_subject.id]=${subject.id}`)
    ]).then(([mats, qs]) => {
      setMaterials(mats);
      setQuizzes(qs);
    }).catch(e => setError(e.message));
  };

  const updateNav = (updates) => {
    const newNav = { ...nav, ...updates };
    setNav(newNav);
    sessionStorage.setItem(NAV_KEY, JSON.stringify({
      examId: newNav.exam?.id || null,
      subjectId: newNav.subject?.id || null,
      tab: newNav.tab
    }));
  };

  const handleLogin = (data) => {
    sessionStorage.setItem(AUTH_KEY, "true");
    setUser(data);
    setError("");
  };

  const handleLogout = async () => {
    try { await logout(); } catch (e) { console.error(e); }
    sessionStorage.clear();
    setUser(null);
    setExams([]); setSubjects([]); setMaterials([]); setQuizzes([]);
    setNav({ exam: null, subject: null, tab: "materials" });
  };

  /* =====================================================
     5. RENDER UI
     ===================================================== */
  if (loading) return <div className="loading-screen">Loading...</div>;
  if (!user) return <Login onLogin={handleLogin} />;

  const isAdmin = user.isAdmin === true;

  return (
    <main className="app">
      <header className="topbar">
        <div>
          <p className="eyebrow">{isAdmin ? "ADMIN PORTAL" : "STUDENT PORTAL"}</p>
          <h1>Competitive Exam Management</h1>
          <p className="welcome">Welcome <strong>{user.name}</strong></p>
        </div>
        <button className="logout-button" onClick={handleLogout}>Sign out</button>
      </header>

      {error && <div className="error-box">{error}</div>}

      {/* VIEW: ALL EXAMS */}
      {!nav.exam && (
        <Exams
          exams={exams} admin={isAdmin}
          onSelect={(exam) => {
            updateNav({ exam, subject: null, tab: "materials" });
            list("subject", `filter[field_em_exam.id]=${exam.id}`).then(setSubjects).catch(e => setError(e.message));
          }}
          onRefresh={() => list("exam").then(setExams)}
        />
      )}

      {/* VIEW: SUBJECTS FOR SELECTED EXAM */}
      {nav.exam && !nav.subject && (
        <Subjects
          exam={nav.exam} subjects={subjects} admin={isAdmin}
          onSelect={(subject) => { updateNav({ subject }); loadSubjectContent(subject); }}
          onBack={() => updateNav({ exam: null, subject: null })}
          onRefresh={() => list("subject", `filter[field_em_exam.id]=${nav.exam.id}`).then(setSubjects)}
        />
      )}

      {/* VIEW: WORKSPACE (MATERIALS & QUIZZES) */}
      {nav.subject && (
        <section className="workspace">
          <button className="back-button" onClick={() => updateNav({ subject: null })}>← Back to Subjects</button>

          <div className="workspace-heading">
            <p className="eyebrow">{nav.exam?.attributes?.title}</p>
            <h2>{nav.subject?.attributes?.title}</h2>
          </div>

          <nav className="content-tabs">
            <button className={nav.tab === "materials" ? "active" : ""} onClick={() => updateNav({ tab: "materials" })}>Materials</button>
            <button className={nav.tab === "quiz" ? "active" : ""} onClick={() => updateNav({ tab: "quiz" })}>Quiz</button>
          </nav>

          {nav.tab === "materials" && (
            <Materials materials={materials} admin={isAdmin} subject={nav.subject} onRefresh={() => loadSubjectContent(nav.subject)} />
          )}
          {nav.tab === "quiz" && (
            <Quiz quizzes={quizzes} admin={isAdmin} subject={nav.subject} onRefresh={() => loadSubjectContent(nav.subject)} />
          )}
        </section>
      )}
    </main>
  );
}
