// import {
//   useEffect,
//   useState,
// } from "react";

// import {
//   currentUser,
//   logout,
//   list,
// } from "./api";

// import Login from "./Login";
// import Exams from "./Exams";
// import Subjects from "./Subjects";
// import Materials from "./Materials";
// import Quiz from "./Quiz";


// const AUTH_KEY =
//   "cems_authenticated";

// const NAV_KEY =
//   "cems_navigation";


// export default function App() {

//   const [user, setUser] =
//     useState(null);

//   const [exams, setExams] =
//     useState([]);

//   const [subjects, setSubjects] =
//     useState([]);

//   const [materials, setMaterials] =
//     useState([]);

//   const [quizzes, setQuizzes] =
//     useState([]);

//   const [selectedExam, setSelectedExam] =
//     useState(null);

//   const [selectedSubject, setSelectedSubject] =
//     useState(null);

//   const [tab, setTab] =
//     useState("materials");

//   const [loading, setLoading] =
//     useState(true);

//   const [error, setError] =
//     useState("");


//   /* =====================================================
//      RESTORE LOGIN SESSION
//      ===================================================== */

//   useEffect(() => {

//     const authenticated =
//       sessionStorage.getItem(
//         AUTH_KEY
//       );

//     /*
//      * Do not trust an old Drupal browser session
//      * if this React application was not logged in.
//      */
//     if (
//       authenticated !== "true"
//     ) {

//       setLoading(false);

//       return;
//     }


//     currentUser()

//       .then((data) => {

//         if (
//           data?.uid &&
//           (
//             data.isAdmin === true ||
//             data.isStudent === true
//           )
//         ) {

//           setUser(data);

//         }
//         else {

//           sessionStorage.removeItem(
//             AUTH_KEY
//           );

//           sessionStorage.removeItem(
//             NAV_KEY
//           );

//           setUser(null);
//         }

//       })

//       .catch(() => {

//         sessionStorage.removeItem(
//           AUTH_KEY
//         );

//         sessionStorage.removeItem(
//           NAV_KEY
//         );

//         setUser(null);

//       })

//       .finally(() => {

//         setLoading(false);

//       });

//   }, []);


//   /* =====================================================
//      LOAD EXAMS FROM DRUPAL
//      ===================================================== */

//   async function loadExams() {

//     try {

//       setError("");

//       const data =
//         await list("exam");

//       /*
//        * Always replace React state with
//        * fresh Drupal data.
//        */
//       setExams(data);

//       return data;

//     }
//     catch (e) {

//       setError(
//         e.message
//       );

//       throw e;
//     }
//   }


//   /* =====================================================
//      LOAD EXAMS AFTER LOGIN
//      ===================================================== */

//   useEffect(() => {

//     if (!user) {
//       return;
//     }

//     loadExams()
//       .catch(() => {});

//   }, [user]);


//   /* =====================================================
//      LOGIN
//      ===================================================== */

//   function handleLogin(data) {

//     sessionStorage.setItem(
//       AUTH_KEY,
//       "true"
//     );

//     setUser(data);

//     setError("");

//   }


//   /* =====================================================
//      LOGOUT
//      ===================================================== */

//   async function handleLogout() {

//     try {

//       await logout();

//     }
//     catch (error) {

//       console.error(
//         "Logout error:",
//         error
//       );

//     }


//     sessionStorage.removeItem(
//       AUTH_KEY
//     );

//     sessionStorage.removeItem(
//       NAV_KEY
//     );


//     setUser(null);

//     setExams([]);

//     setSubjects([]);

//     setMaterials([]);

//     setQuizzes([]);

//     setSelectedExam(null);

//     setSelectedSubject(null);

//     setTab("materials");

//   }


//   /* =====================================================
//      SELECT EXAM
//      ===================================================== */

//   async function selectExam(
//     exam
//   ) {

//     setSelectedExam(exam);

//     setSelectedSubject(null);

//     setMaterials([]);

//     setQuizzes([]);

//     setError("");


//     /*
//      * Store ONLY navigation.
//      *
//      * Do NOT store exam/subject/material content.
//      */
//     sessionStorage.setItem(

//       NAV_KEY,

//       JSON.stringify({

//         examId:
//           exam.id,

//         subjectId:
//           null,

//         tab:
//           "materials",

//       })

//     );


//     try {

//       /*
//        * Fetch subjects freshly from Drupal.
//        */
//       const data =
//         await list(
//           "subject",
//           `filter[field_em_exam.id]=${exam.id}`
//         );

//       setSubjects(data);

//     }
//     catch (e) {

//       setError(
//         e.message
//       );

//     }

//   }


//   /* =====================================================
//      SELECT SUBJECT
//      ===================================================== */

//   async function selectSubject(
//     subject
//   ) {

//     setSelectedSubject(
//       subject
//     );

//     setError("");


//     /*
//      * Store ONLY navigation.
//      */
//     sessionStorage.setItem(

//       NAV_KEY,

//       JSON.stringify({

//         examId:
//           selectedExam?.id,

//         subjectId:
//           subject.id,

//         tab:
//           tab,

//       })

//     );


//     try {

//       /*
//        * Fetch BOTH materials and quizzes
//        * freshly from Drupal.
//        */
//       const [
//         materialsData,
//         quizzesData,
//       ] =
//         await Promise.all([

//           list(
//             "material",
//             `filter[field_em_subject.id]=${subject.id}`
//           ),

//           list(
//             "quiz",
//             `filter[field_em_subject.id]=${subject.id}`
//           ),

//         ]);


//       setMaterials(
//         materialsData
//       );

//       setQuizzes(
//         quizzesData
//       );

//     }
//     catch (e) {

//       setError(
//         e.message
//       );

//     }

//   }


//   /* =====================================================
//      REFRESH CURRENT SUBJECT CONTENT
//      -----------------------------------------------------
//      IMPORTANT:
//      This does NOT change the current page.
//      It only fetches fresh content from Drupal.
//      ===================================================== */

//   async function refreshSubjectContent() {

//     if (!selectedSubject) {
//       return;
//     }


//     try {

//       setError("");


//       const [
//         materialsData,
//         quizzesData,
//       ] =
//         await Promise.all([

//           list(
//             "material",
//             `filter[field_em_subject.id]=${selectedSubject.id}`
//           ),

//           list(
//             "quiz",
//             `filter[field_em_subject.id]=${selectedSubject.id}`
//           ),

//         ]);


//       /*
//        * Replace old React data with fresh
//        * Drupal data.
//        */
//       setMaterials(
//         materialsData
//       );

//       setQuizzes(
//         quizzesData
//       );

//     }
//     catch (e) {

//       setError(
//         e.message
//       );

//     }

//   }


//   /* =====================================================
//      TAB CHANGE
//      ===================================================== */

//   function changeTab(
//     newTab
//   ) {

//     setTab(newTab);


//     /*
//      * Store ONLY where the user is.
//      */
//     sessionStorage.setItem(

//       NAV_KEY,

//       JSON.stringify({

//         examId:
//           selectedExam?.id,

//         subjectId:
//           selectedSubject?.id,

//         tab:
//           newTab,

//       })

//     );

//   }


//   /* =====================================================
//      RESTORE NAVIGATION
//      -----------------------------------------------------
//      IMPORTANT:
//      sessionStorage stores ONLY:
//        examId
//        subjectId
//        tab

//      Actual content is ALWAYS fetched again
//      from Drupal.
//      ===================================================== */

//   useEffect(() => {

//     if (
//       !user ||
//       exams.length === 0
//     ) {
//       return;
//     }


//     const saved =
//       sessionStorage.getItem(
//         NAV_KEY
//       );


//     if (!saved) {
//       return;
//     }


//     let navigation;


//     try {

//       navigation =
//         JSON.parse(saved);

//     }
//     catch {

//       sessionStorage.removeItem(
//         NAV_KEY
//       );

//       return;
//     }


//     const {
//       examId,
//       subjectId,
//       tab: savedTab = "materials",
//     } =
//       navigation;


//     if (!examId) {
//       return;
//     }


//     /*
//      * Find the exam from the FRESH
//      * Drupal exam list.
//      */
//     const foundExam =
//       exams.find(
//         (exam) =>
//           String(exam.id) ===
//           String(examId)
//       );


//     if (!foundExam) {

//       sessionStorage.removeItem(
//         NAV_KEY
//       );

//       return;
//     }


//     /*
//      * Restore the page location.
//      */
//     setSelectedExam(
//       foundExam
//     );

//     setTab(
//       savedTab
//     );


//     /*
//      * Fetch subjects FRESHLY from Drupal.
//      */
//     list(
//       "subject",
//       `filter[field_em_exam.id]=${foundExam.id}`
//     )

//       .then(
//         (subjectData) => {

//           /*
//            * Replace subjects with fresh data.
//            */
//           setSubjects(
//             subjectData
//           );


//           /*
//            * No subject selected.
//            *
//            * User should remain on the
//            * Subjects page.
//            */
//           if (!subjectId) {

//             setSelectedSubject(
//               null
//             );

//             setMaterials([]);

//             setQuizzes([]);

//             return null;
//           }


//           /*
//            * Find the selected subject from
//            * the freshly loaded Drupal data.
//            */
//           const foundSubject =
//             subjectData.find(
//               (subject) =>
//                 String(subject.id) ===
//                 String(subjectId)
//             );


//           if (!foundSubject) {

//             setSelectedSubject(
//               null
//             );

//             setMaterials([]);

//             setQuizzes([]);


//             /*
//              * Navigation is still valid for
//              * the exam, but subject no longer exists.
//              */
//             sessionStorage.setItem(

//               NAV_KEY,

//               JSON.stringify({

//                 examId:
//                   foundExam.id,

//                 subjectId:
//                   null,

//                 tab:
//                   "materials",

//               })

//             );

//             return null;
//           }


//           /*
//            * Stay on the same subject.
//            */
//           setSelectedSubject(
//             foundSubject
//           );


//           /*
//            * IMPORTANT:
//            * Fetch Materials and Quiz FRESHLY.
//            */
//           return Promise.all([

//             list(
//               "material",
//               `filter[field_em_subject.id]=${foundSubject.id}`
//             ),

//             list(
//               "quiz",
//               `filter[field_em_subject.id]=${foundSubject.id}`
//             ),

//           ]);

//         }
//       )

//       .then(
//         (result) => {

//           if (!result) {
//             return;
//           }


//           const [
//             freshMaterials,
//             freshQuizzes,
//           ] =
//             result;


//           /*
//            * Replace React state with
//            * current Drupal content.
//            */
//           setMaterials(
//             freshMaterials
//           );

//           setQuizzes(
//             freshQuizzes
//           );

//         }
//       )

//       .catch(
//         (e) => {

//           console.error(
//             "Navigation restore error:",
//             e
//           );

//           setError(
//             e.message
//           );

//         }
//       );

//   }, [user, exams]);


//   /* =====================================================
//      LOADING SCREEN
//      ===================================================== */

//   if (loading) {

//     return (

//       <div className="loading-screen">

//         Loading...

//       </div>

//     );

//   }


//   /* =====================================================
//      LOGIN SCREEN
//      ===================================================== */

//   if (!user) {

//     return (

//       <Login
//         onLogin={
//           handleLogin
//         }
//       />

//     );

//   }


//   /* =====================================================
//      ROLE
//      ===================================================== */

//   const isAdmin =
//     user.isAdmin === true;


//   /* =====================================================
//      MAIN APPLICATION
//      ===================================================== */

//   return (

//     <main className="app">


//       {/* HEADER */}

//       <header className="topbar">

//         <div>

//           <p className="eyebrow">

//             {isAdmin
//               ? "ADMIN PORTAL"
//               : "STUDENT PORTAL"}

//           </p>


//           <h1>
//             Competitive Exam Management
//           </h1>


//           <p className="welcome">

//             Welcome{" "}

//             <strong>
//               {user.name}
//             </strong>

//           </p>

//         </div>


//         <button
//           className="logout-button"
//           onClick={
//             handleLogout
//           }
//         >

//           Sign out

//         </button>

//       </header>


//       {/* ERROR */}

//       {error && (

//         <div className="error-box">

//           {error}

//         </div>

//       )}


//       {/* =================================================
//           EXAMS
//           ================================================= */}

//       {!selectedExam && (

//         <Exams

//           exams={
//             exams
//           }

//           admin={
//             isAdmin
//           }

//           onSelect={
//             selectExam
//           }

//           onRefresh={
//             loadExams
//           }

//         />

//       )}


//       {/* =================================================
//           SUBJECTS
//           ================================================= */}

//       {selectedExam &&
//         !selectedSubject && (

//         <Subjects

//           exam={
//             selectedExam
//           }

//           subjects={
//             subjects
//           }

//           admin={
//             isAdmin
//           }

//           onSelect={
//             selectSubject
//           }

//           onBack={() => {

//             setSelectedExam(
//               null
//             );

//             setSelectedSubject(
//               null
//             );

//             setSubjects([]);

//             setMaterials([]);

//             setQuizzes([]);

//             sessionStorage.removeItem(
//               NAV_KEY
//             );

//           }}

//           onRefresh={() =>
//             selectExam(
//               selectedExam
//             )
//           }

//         />

//       )}


//       {/* =================================================
//           MATERIALS / QUIZ
//           ================================================= */}

//       {selectedSubject && (

//         <section className="workspace">


//           <button
//             className="back-button"
//             onClick={() => {

//               setSelectedSubject(
//                 null
//               );

//               setMaterials([]);

//               setQuizzes([]);


//               sessionStorage.setItem(

//                 NAV_KEY,

//                 JSON.stringify({

//                   examId:
//                     selectedExam?.id,

//                   subjectId:
//                     null,

//                   tab:
//                     "materials",

//                 })

//               );

//             }}
//           >

//             ← Back to Subjects

//           </button>


//           <div className="workspace-heading">

//             <p className="eyebrow">

//               {
//                 selectedExam
//                   ?.attributes
//                   ?.title
//               }

//             </p>


//             <h2>

//               {
//                 selectedSubject
//                   ?.attributes
//                   ?.title
//               }

//             </h2>

//           </div>


//           {/* TABS */}

//           <nav className="content-tabs">

//             <button

//               className={
//                 tab === "materials"
//                   ? "active"
//                   : ""
//               }

//               onClick={() =>
//                 changeTab(
//                   "materials"
//                 )
//               }

//             >

//               Materials

//             </button>


//             <button

//               className={
//                 tab === "quiz"
//                   ? "active"
//                   : ""
//               }

//               onClick={() =>
//                 changeTab(
//                   "quiz"
//                 )
//               }

//             >

//               Quiz

//             </button>

//           </nav>


//           {/* MATERIALS */}

//           {tab === "materials" && (

//             <Materials

//               materials={
//                 materials
//               }

//               admin={
//                 isAdmin
//               }

//               subject={
//                 selectedSubject
//               }

//               /*
//                * Add/edit/delete material will
//                * refresh ONLY the current subject
//                * content.
//                */
//               onRefresh={
//                 refreshSubjectContent
//               }

//             />

//           )}


//           {/* QUIZ */}

//           {tab === "quiz" && (

//             <Quiz

//               quizzes={
//                 quizzes
//               }

//               admin={
//                 isAdmin
//               }

//               subject={
//                 selectedSubject
//               }

//               /*
//                * Add/edit/delete quiz will
//                * refresh ONLY the current subject
//                * content.
//                */
//               onRefresh={
//                 refreshSubjectContent
//               }

//             />

//           )}

//         </section>

//       )}

//     </main>

//   );

// }
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
