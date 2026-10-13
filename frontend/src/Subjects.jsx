import { useState } from "react";
import { save, remove, richText, relation } from "./api";

export default function Subjects({ exam, subjects, admin, onSelect, onBack, onRefresh }) {
  const [form, setForm] = useState(null); // null = modal closed, object = modal open
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const openForm = (subject = null) => {
    setForm({
      id: subject?.id || null,
      title: subject?.attributes?.title || "",
      description: richText(subject?.attributes?.field_em_description)
    });
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      await save(
        "subject",
        {
          title: form.title,
          field_em_description: { value: form.description, format: "plain_text" },
        },
        { field_em_exam: relation("exam", exam.id) }, // Link to parent Exam
        form.id
      );

      setForm(null);
      await onRefresh();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (subject) => {
    if (!admin || !window.confirm(`Delete "${subject.attributes.title}"?`)) return;
    try {
      setMessage("");
      await remove("subject", subject.id);
      await onRefresh();
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <section className="page-section">
      <button className="back-button" onClick={onBack}>← All Exams</button>

      <div className="section-header">
        <div>
          <p className="eyebrow">{exam.attributes.title}</p>
          <h2>Subjects</h2>
        </div>
        {admin && <button className="primary-button small" onClick={() => openForm()}>+ Add Subject</button>}
      </div>

      {message && <div className="error-box">{message}</div>}

      <div className="subject-list">
        {subjects.length === 0 && <div className="empty-state">No subjects found.</div>}

        {subjects.map((subject) => (
          <article className="subject-card" key={subject.id}>
            <button className="subject-main" onClick={() => onSelect(subject)}>
              <div>
                <h3>{subject.attributes.title}</h3>
                <p>{richText(subject.attributes.field_em_description)}</p>
              </div>
              <span>Open →</span>
            </button>

            {admin && (
              <div className="card-actions">
                <button onClick={() => openForm(subject)}>Edit</button>
                <button className="danger" onClick={() => handleDelete(subject)}>Delete</button>
              </div>
            )}
          </article>
        ))}
      </div>

      {/* ADD / EDIT MODAL */}
      {form && (
        <div className="modal">
          <form className="modal-card" onSubmit={handleSubmit}>
            <div className="modal-header">
              <h2>{form.id ? "Edit Subject" : "Add Subject"}</h2>
              <button type="button" onClick={() => setForm(null)}>×</button>
            </div>

            <label>
              Subject Name
              <input name="title" value={form.title} onChange={handleChange} required />
            </label>

            <label>
              Description
              <textarea name="description" value={form.description} onChange={handleChange} rows="4" />
            </label>

            <p className="relationship-info">Exam: <strong>{exam.attributes.title}</strong></p>

            <div className="form-actions">
              <button type="submit" className="primary-button" disabled={saving}>
                {saving ? "Saving..." : "Save Subject"}
              </button>
              <button type="button" className="secondary-button" onClick={() => setForm(null)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
