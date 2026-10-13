// import { useState } from "react";

// import {
//   save,
//   remove,
//   relation,
//   richText,
// } from "./api";


// export default function Quiz({
//   quizzes,
//   admin,
//   subject,
//   onRefresh,
// }) {

//   const [answers, setAnswers] =
//     useState({});

//   const [submitted, setSubmitted] =
//     useState(false);

//   /*
//    * null = adding a new question
//    * object = editing existing question
//    */
//   const [editing, setEditing] =
//     useState(null);

//   /*
//    * Controls whether the modal is visible.
//    */
//   const [showForm, setShowForm] =
//     useState(false);


//   const [form, setForm] =
//     useState({

//       question: "",
//       option_1: "",
//       option_2: "",
//       option_3: "",
//       option_4: "",
//       correct_answer: "1",

//     });


//   const [message, setMessage] =
//     useState("");


//   /* =====================================================
//      RESET FORM
//      ===================================================== */

//   function resetForm() {

//     setForm({

//       question: "",
//       option_1: "",
//       option_2: "",
//       option_3: "",
//       option_4: "",
//       correct_answer: "1",

//     });

//     setEditing(null);

//     setMessage("");
//   }


//   /* =====================================================
//      ADD QUESTION
//      ===================================================== */

//   function openAddForm() {

//     resetForm();

//     /*
//      * Explicitly mark this as ADD mode.
//      */
//     setEditing(null);

//     /*
//      * Explicitly open modal.
//      */
//     setShowForm(true);

//   }


//   /* =====================================================
//      EDIT QUESTION
//      ===================================================== */

//   function openEditForm(quiz) {

//     setEditing(quiz);

//     setForm({

//       question:
//         richText(
//           quiz?.attributes
//             ?.field_em_question
//         ),

//       option_1:
//         quiz?.attributes
//           ?.field_em_option_1 || "",

//       option_2:
//         quiz?.attributes
//           ?.field_em_option_2 || "",

//       option_3:
//         quiz?.attributes
//           ?.field_em_option_3 || "",

//       option_4:
//         quiz?.attributes
//           ?.field_em_option_4 || "",

//       correct_answer:
//         quiz?.attributes
//           ?.field_em_correct_answer ||
//         "1",

//     });

//     setMessage("");

//     setShowForm(true);

//   }


//   /* =====================================================
//      CLOSE FORM
//      ===================================================== */

//   function closeForm() {

//     setShowForm(false);

//     setEditing(null);

//     setMessage("");

//   }


//   /* =====================================================
//      UPDATE FORM
//      ===================================================== */

//   function update(
//     key,
//     value
//   ) {

//     setForm((old) => ({

//       ...old,

//       [key]:
//         value,

//     }));

//   }


//   /* =====================================================
//      SAVE QUESTION
//      ===================================================== */

//   async function submitQuestion(e) {

//     e.preventDefault();

//     setMessage("");


//     try {

//       await save(

//         "quiz",

//         {

//           title:
//             form.question,

//           field_em_question: {

//             value:
//               form.question,

//             format:
//               "plain_text",

//           },

//           field_em_option_1:
//             form.option_1,

//           field_em_option_2:
//             form.option_2,

//           field_em_option_3:
//             form.option_3,

//           field_em_option_4:
//             form.option_4,

//           field_em_correct_answer:
//             form.correct_answer,

//         },

//         {

//           field_em_subject:
//             relation(
//               "subject",
//               subject.id
//             ),

//         },

//         /*
//          * Existing ID = PATCH
//          * No ID = POST
//          */
//         editing?.id || null

//       );


//       /*
//        * Close modal.
//        */
//       closeForm();


//       /*
//        * Reload questions.
//        */
//       await onRefresh();

//     }

//     catch (e) {

//       console.error(
//         "Save question error:",
//         e
//       );

//       setMessage(
//         e.message ||
//         "Unable to save question."
//       );

//     }

//   }


//   /* =====================================================
//      DELETE QUESTION
//      ===================================================== */

//  async function deleteQuestion(quiz) {

//   if (!admin) return;

//   if (
//     !window.confirm(
//       "Delete this question?"
//     )
//   ) {
//     return;
//   }

//   try {

//     setMessage("");

//     await remove(
//       "quiz",
//       quiz.id
//     );

//     await onRefresh();

//   }
//   catch (error) {

//     console.error(
//       "Delete quiz error:",
//       error
//     );

//     setMessage(
//       error.message
//     );
//   }
// }


//   /* =====================================================
//      SELECT ANSWER
//      ===================================================== */

//   function selectAnswer(
//     quizId,
//     answer
//   ) {

//     if (submitted) {
//       return;
//     }


//     setAnswers((old) => ({

//       ...old,

//       [quizId]:
//         answer,

//     }));

//   }


//   /* =====================================================
//      CALCULATE SCORE
//      ===================================================== */

//   function calculateScore() {

//     return quizzes.reduce(

//       (score, quiz) => {

//         return (

//           score +

//           (
//             answers[quiz.id] ===
//             String(
//               quiz.attributes
//                 .field_em_correct_answer
//             )
//               ? 1
//               : 0
//           )

//         );

//       },

//       0

//     );

//   }


//   /* =====================================================
//      UI
//      ===================================================== */

//   return (

//     <section>


//       {/* =================================================
//           HEADER
//           ================================================= */}

//       <div className="section-header">

//         <div>

//           <p className="eyebrow">
//             ASSESSMENT
//           </p>

//           <h2>
//             Quiz
//           </h2>

//           <p>
//             Test your knowledge of this subject.
//           </p>

//         </div>


//         {admin && (

//           <button

//             type="button"

//             className="primary-button small"

//             onClick={
//               openAddForm
//             }

//           >
//             + Add Question

//           </button>

//         )}

//       </div>


//       {/* =================================================
//           MESSAGE
//           ================================================= */}

//       {message && (

//         <div className="error-box">

//           {message}

//         </div>

//       )}


//       {/* =================================================
//           QUESTIONS
//           ================================================= */}

//       {quizzes.map(
//         (quiz, index) => {

//           const a =
//             quiz.attributes;


//           return (

//             <article

//               className="quiz-card"

//               key={
//                 quiz.id
//               }

//             >

//               <h3>

//                 {index + 1}.{" "}

//                 {richText(
//                   a.field_em_question
//                 )}

//               </h3>


//               <div className="quiz-options">

//                 {[1, 2, 3, 4].map(
//                   (number) => (

//                     <label

//                       key={
//                         number
//                       }

//                       className={

//                         submitted &&

//                         String(number) ===
//                           String(
//                             a.field_em_correct_answer
//                           )

//                           ? "quiz-option correct"

//                           : "quiz-option"

//                       }

//                     >

//                       <input

//                         type="radio"

//                         name={
//                           quiz.id
//                         }

//                         checked={

//                           answers[
//                             quiz.id
//                           ] ===
//                           String(number)

//                         }

//                         onChange={() =>
//                           selectAnswer(
//                             quiz.id,
//                             String(number)
//                           )
//                         }

//                         disabled={
//                           submitted
//                         }

//                       />


//                       <span>

//                         {
//                           a[
//                             `field_em_option_${number}`
//                           ]
//                         }

//                       </span>

//                     </label>

//                   )
//                 )}

//               </div>


//               {/* ADMIN ACTIONS */}

//               {admin && (

//                 <div className="card-actions">

//                   <button

//                     type="button"

//                     onClick={() =>
//                       openEditForm(
//                         quiz
//                       )
//                     }

//                   >
//                     Edit
//                   </button>


//                   <button

//                     type="button"

//                     className="danger"

//                     onClick={() =>
//                       deleteQuestion(
//                         quiz
//                       )
//                     }

//                   >
//                     Delete

//                   </button>

//                 </div>

//               )}

//             </article>

//           );

//         }
//       )}


//       {/* =================================================
//           SUBMIT QUIZ
//           ================================================= */}

//       {quizzes.length > 0 &&
//         !submitted && (

//         <button

//           type="button"

//           className="primary-button"

//           onClick={() =>
//             setSubmitted(true)
//           }

//         >
//           Submit Quiz

//         </button>

//       )}


//       {/* =================================================
//           SCORE
//           ================================================= */}

//       {submitted && (

//         <div className="score-card">

//           <span>
//             Your Score
//           </span>

//           <strong>

//             {calculateScore()}

//             {" / "}

//             {quizzes.length}

//           </strong>

//         </div>

//       )}


//       {/* =================================================
//           EMPTY
//           ================================================= */}

//       {quizzes.length === 0 && (

//         <div className="empty-state">

//           No quiz questions available.

//         </div>

//       )}


//       {/* =================================================
//           ADD / EDIT MODAL
//           ================================================= */}

//       {showForm && (

//         <div className="modal">

//           <form

//             className="modal-card"

//             onSubmit={
//               submitQuestion
//             }

//           >

//             <div className="modal-header">

//               <h2>

//                 {editing
//                   ? "Edit Question"
//                   : "Add Question"}

//               </h2>


//               <button

//                 type="button"

//                 onClick={
//                   closeForm
//                 }

//               >
//                 ×
//               </button>

//             </div>


//             {/* QUESTION */}

//             <label>

//               Question

//               <textarea

//                 value={
//                   form.question
//                 }

//                 onChange={(e) =>
//                   update(
//                     "question",
//                     e.target.value
//                   )
//                 }

//                 required

//                 rows="3"

//                 placeholder="Enter question"

//               />

//             </label>


//             {/* OPTIONS */}

//             {[1, 2, 3, 4].map(
//               (number) => (

//                 <label
//                   key={number}
//                 >

//                   Option {number}

//                   <input

//                     value={
//                       form[
//                         `option_${number}`
//                       ]
//                     }

//                     onChange={(e) =>
//                       update(

//                         `option_${number}`,

//                         e.target.value

//                       )
//                     }

//                     required

//                     placeholder={
//                       `Enter option ${number}`
//                     }

//                   />

//                 </label>

//               )
//             )}


//             {/* CORRECT ANSWER */}

//             <label>

//               Correct Answer

//               <select

//                 value={
//                   form.correct_answer
//                 }

//                 onChange={(e) =>
//                   update(
//                     "correct_answer",
//                     e.target.value
//                   )
//                 }

//               >

//                 {[1, 2, 3, 4].map(
//                   (number) => (

//                     <option

//                       key={
//                         number
//                       }

//                       value={
//                         number
//                       }

//                     >

//                       Option {number}

//                     </option>

//                   )
//                 )}

//               </select>

//             </label>


//             {/* SUBJECT */}

//             <p className="relationship-info">

//               Subject:{" "}

//               <strong>

//                 {
//                   subject
//                     ?.attributes
//                     ?.title
//                 }

//               </strong>

//             </p>


//             {/* ERROR */}

//             {message && (

//               <p className="error">

//                 {message}

//               </p>

//             )}


//             {/* BUTTONS */}

//             <div className="form-actions">

//               <button

//                 type="submit"

//                 className="primary-button"

//               >

//                 {editing
//                   ? "Update Question"
//                   : "Save Question"}

//               </button>


//               <button

//                 type="button"

//                 className="secondary-button"

//                 onClick={
//                   closeForm
//                 }

//               >

//                 Cancel

//               </button>

//             </div>

//           </form>

//         </div>

//       )}

//     </section>

//   );

// }
import { useState } from "react";
import { save, remove, relation, richText } from "./api";

export default function Quiz({ quizzes, admin, subject, onRefresh }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState(null); // null = modal closed, object = modal open
  const [message, setMessage] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const openForm = (quiz = null) => {
    const attr = quiz?.attributes || {};
    setForm({
      id: quiz?.id || null,
      question: richText(attr.field_em_question) || "",
      option_1: attr.field_em_option_1 || "",
      option_2: attr.field_em_option_2 || "",
      option_3: attr.field_em_option_3 || "",
      option_4: attr.field_em_option_4 || "",
      correct_answer: String(attr.field_em_correct_answer || "1"),
    });
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await save("quiz", {
        title: form.question,
        field_em_question: { value: form.question, format: "plain_text" },
        field_em_option_1: form.option_1,
        field_em_option_2: form.option_2,
        field_em_option_3: form.option_3,
        field_em_option_4: form.option_4,
        field_em_correct_answer: form.correct_answer,
      }, { field_em_subject: relation("subject", subject.id) }, form.id);

      setForm(null);
      await onRefresh();
    } catch (err) {
      setMessage(err.message || "Unable to save question.");
    }
  };

  const handleDelete = async (quiz) => {
    if (!admin || !window.confirm("Delete this question?")) return;
    try {
      setMessage("");
      await remove("quiz", quiz.id);
      await onRefresh();
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleSelectAnswer = (quizId, answer) => {
    if (!submitted) setAnswers({ ...answers, [quizId]: answer });
  };

  // Calculate score in a single, efficient pass
  const score = quizzes.reduce((total, q) =>
    total + (answers[q.id] === String(q.attributes.field_em_correct_answer) ? 1 : 0), 0
  );

  return (
    <section>
      <div className="section-header">
        <div>
          <p className="eyebrow">ASSESSMENT</p>
          <h2>Quiz</h2>
          <p>Test your knowledge of this subject.</p>
        </div>
        {admin && <button className="primary-button small" onClick={() => openForm()}>+ Add Question</button>}
      </div>

      {message && <div className="error-box">{message}</div>}

      {quizzes.length === 0 && <div className="empty-state">No quiz questions available.</div>}

      {quizzes.map((quiz, index) => {
        const a = quiz.attributes;
        return (
          <article className="quiz-card" key={quiz.id}>
            <h3>{index + 1}. {richText(a.field_em_question)}</h3>

            <div className="quiz-options">
              {[1, 2, 3, 4].map((num) => {
                const isCorrect = String(num) === String(a.field_em_correct_answer);
                return (
                  <label key={num} className={submitted && isCorrect ? "quiz-option correct" : "quiz-option"}>
                    <input
                      type="radio"
                      name={quiz.id}
                      checked={answers[quiz.id] === String(num)}
                      onChange={() => handleSelectAnswer(quiz.id, String(num))}
                      disabled={submitted}
                    />
                    <span>{a[`field_em_option_${num}`]}</span>
                  </label>
                );
              })}
            </div>

            {admin && (
              <div className="card-actions">
                <button type="button" onClick={() => openForm(quiz)}>Edit</button>
                <button type="button" className="danger" onClick={() => handleDelete(quiz)}>Delete</button>
              </div>
            )}
          </article>
        );
      })}

      {quizzes.length > 0 && !submitted && (
        <button type="button" className="primary-button" onClick={() => setSubmitted(true)}>Submit Quiz</button>
      )}

      {submitted && (
        <div className="score-card">
          <span>Your Score</span>
          <strong>{score} / {quizzes.length}</strong>
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {form && (
        <div className="modal">
          <form className="modal-card" onSubmit={handleSubmit}>
            <div className="modal-header">
              <h2>{form.id ? "Edit Question" : "Add Question"}</h2>
              <button type="button" onClick={() => setForm(null)}>×</button>
            </div>

            <label>
              Question
              <textarea name="question" value={form.question} onChange={handleChange} required rows="3" placeholder="Enter question" />
            </label>

            {[1, 2, 3, 4].map((num) => (
              <label key={num}>
                Option {num}
                <input name={`option_${num}`} value={form[`option_${num}`]} onChange={handleChange} required placeholder={`Enter option ${num}`} />
              </label>
            ))}

            <label>
              Correct Answer
              <select name="correct_answer" value={form.correct_answer} onChange={handleChange}>
                {[1, 2, 3, 4].map((num) => (
                  <option key={num} value={num}>Option {num}</option>
                ))}
              </select>
            </label>

            <p className="relationship-info">Subject: <strong>{subject?.attributes?.title}</strong></p>
            {message && <p className="error">{message}</p>}

            <div className="form-actions">
              <button type="submit" className="primary-button">
                {form.id ? "Update Question" : "Save Question"}
              </button>
              <button type="button" className="secondary-button" onClick={() => setForm(null)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
