// import { useState } from "react";
// import {
//   save,
//   remove,
//   richText,
// } from "./api";

// export default function Exams({
//   exams,
//   admin,
//   onSelect,
//   onRefresh,
// }) {

// const [editing, setEditing] = useState(null);
// const [formOpen, setFormOpen] = useState(false);

//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");

//   const [saving, setSaving] = useState(false);
//   const [message, setMessage] = useState("");

//   function openForm(exam = null) {

//   setEditing(exam);

//   setFormOpen(true);

//   setTitle(
//     exam?.attributes?.title || ""
//   );

//   setDescription(
//     richText(
//       exam?.attributes?.field_em_description
//     )
//   );

//   setMessage("");
// }

//   async function submit(e) {

//     e.preventDefault();

//     if (!admin) return;

//     setSaving(true);

//     try {

//       await save(
//         "exam",
//         {
//           title,
//           field_em_description: {
//             value: description,
//             format: "plain_text",
//           },
//         },
//         {},
//         editing?.id || null
//       );

//       setEditing(null);
//       setFormOpen(false);
//       await onRefresh();

//     } catch (e) {
//       setMessage(e.message);
//     } finally {
//       setSaving(false);
//     }
//   }

//  async function deleteExam(exam) {

//   if (!admin) return;

//   if (
//     !window.confirm(
//       `Delete "${exam.attributes.title}"?`
//     )
//   ) {
//     return;
//   }

//   try {

//     setMessage("");

//     await remove(
//       "exam",
//       exam.id
//     );

//     await onRefresh();

//   }
//   catch (error) {

//     console.error(
//       "Delete exam error:",
//       error
//     );

//     setMessage(
//       error.message
//     );
//   }
// }

//   return (
//     <section className="page-section">

//       <div className="section-header">

//         <div>
//           <p className="eyebrow">
//             EXAM CATALOG
//           </p>

//           <h2>
//             Available Exams
//           </h2>

//           <p>
//             Select an exam to view its subjects.
//           </p>
//         </div>

//         {admin && (
//           <button
//             className="primary-button small"
//             onClick={() => openForm()}
//           >
//             + Add Exam
//           </button>
//         )}

//       </div>

//       {message && (
//         <div className="error-box">
//           {message}
//         </div>
//       )}

//       <div className="exam-grid">

//         {exams.map((exam) => (

//           <article
//             className="exam-card"
//             key={exam.id}
//           >

//             <button
//               className="exam-main"
//               onClick={() => onSelect(exam)}
//             >
//               <span className="card-number">
//                 EXAM
//               </span>

//               <h3>
//                 {exam.attributes.title}
//               </h3>

//               <p>
//                 {richText(
//                   exam.attributes
//                     .field_em_description
//                 )}
//               </p>

//               <span className="view-link">
//                 View Subjects →
//               </span>
//             </button>

//             {admin && (
//               <div className="card-actions">

//                 <button
//                   onClick={() => openForm(exam)}
//                 >
//                   Edit
//                 </button>

//                 <button
//                   className="danger"
//                   onClick={() =>
//                     deleteExam(exam)
//                   }
//                 >
//                   Delete
//                 </button>

//               </div>
//             )}

//           </article>

//         ))}

//       </div>

//       {formOpen && (
//         <div className="modal">

//           <form
//             className="modal-card"
//             onSubmit={submit}
//           >

//             <div className="modal-header">
//               <h2>
//                 {editing
//                   ? "Edit Exam"
//                   : "Add Exam"}
//               </h2>

//               <button
//                 type="button"
//                 onClick={() => {
//   setEditing(null);
//   setFormOpen(false);
// }}
//               >
//                 ×
//               </button>
//             </div>

//             <label>
//               Exam Title
//               <input
//                 value={title}
//                 onChange={(e) =>
//                   setTitle(e.target.value)
//                 }
//                 required
//               />
//             </label>

//             <label>
//               Description
//               <textarea
//                 value={description}
//                 onChange={(e) =>
//                   setDescription(
//                     e.target.value
//                   )
//                 }
//                 rows="5"
//               />
//             </label>

//             {message && (
//               <p className="error">
//                 {message}
//               </p>
//             )}

//             <div className="form-actions">

//               <button
//                 className="primary-button"
//                 disabled={saving}
//               >
//                 {saving
//                   ? "Saving..."
//                   : "Save Exam"}
//               </button>

//               <button
//                 type="button"
//                 className="secondary-button"
//                 onClick={() => {
//   setEditing(null);
//   setFormOpen(false);
// }}
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
import { save, remove, richText } from "./api";

export default function Exams({ exams, admin, onSelect, onRefresh }) {
  // null = closed, {} = adding new, { id, title... } = editing existing
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const openForm = (exam = {}) => {
    setForm({
      id: exam.id || null,
      title: exam?.attributes?.title || "",
      description: richText(exam?.attributes?.field_em_description)
    });
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!admin) return;
    setSaving(true);

    try {
      await save("exam", {
        title: form.title,
        field_em_description: { value: form.description, format: "plain_text" }
      }, {}, form.id);

      setForm(null); // Close form
      await onRefresh();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (exam) => {
    if (!admin || !window.confirm(`Delete "${exam.attributes.title}"?`)) return;
    try {
      setMessage("");
      await remove("exam", exam.id);
      await onRefresh();
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <section className="page-section">
      <div className="section-header">
        <h2>Available Exams</h2>
        <p>Select an exam to view its subjects.</p>
        {admin && <button onClick={() => openForm({})}>+ Add Exam</button>}
      </div>

      {message && <div className="error-box">{message}</div>}

      <div className="exam-grid">
        {exams.map((exam) => (
          <article className="exam-card" key={exam.id}>
            <div onClick={() => onSelect(exam)} style={{ cursor: "pointer" }}>
              <h3>{exam.attributes.title}</h3>
              <p>{richText(exam.attributes.field_em_description)}</p>
            </div>

            {admin && (
              <div className="card-actions">
                <button onClick={() => openForm(exam)}>Edit</button>
                <button className="danger" onClick={() => handleDelete(exam)}>Delete</button>
              </div>
            )}
          </article>
        ))}
      </div>

      {/* ADD / EDIT MODAL */}
      {form && (
        <div className="modal">
          <form className="modal-card" onSubmit={handleSubmit}>
            <h2>{form.id ? "Edit Exam" : "Add Exam"}</h2>

            <input
              placeholder="Exam Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />

            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows="4"
            />

            <div className="form-actions">
              <button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Exam"}
              </button>
              <button type="button" onClick={() => setForm(null)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
