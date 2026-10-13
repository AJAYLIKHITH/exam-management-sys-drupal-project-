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
