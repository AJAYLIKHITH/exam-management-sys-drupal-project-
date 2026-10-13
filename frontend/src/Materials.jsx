import { useState } from "react";
import { save, remove, relation, richText, getVideoUrlEmbed, getLinkUrl } from "./api";

export default function Materials({ materials, admin, subject, onRefresh }) {
  const [form, setForm] = useState(null); // null = modal closed, object = modal open
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const openForm = (mat = null) => {
    setForm({
      id: mat?.id || null,
      title: mat?.attributes?.title || "",
      type: mat?.attributes?.field_em_type || "video",
      url: getLinkUrl(mat?.attributes?.field_em_url),
      content: richText(mat?.attributes?.field_em_content)
    });
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      await save(
        "material",
        {
          title: form.title,
          field_em_type: form.type,
          field_em_url: { uri: form.url },
          field_em_content: { value: form.content, format: "plain_text" },
        },
        { field_em_subject: relation("subject", subject.id) },
        form.id
      );

      setForm(null);
      await onRefresh();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (mat) => {
    if (!admin || !window.confirm(`Delete "${mat.attributes.title}"?`)) return;
    try {
      setMessage("");
      await remove("material", mat.id);
      await onRefresh();
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <section>
      <div className="section-header">
        <div>
          <p className="eyebrow">LEARNING RESOURCES</p>
          <h2>Videos & PDFs</h2>
        </div>
        {admin && <button className="primary-button small" onClick={() => openForm()}>+ Add Material</button>}
      </div>

      {message && <div className="error-box">{message}</div>}

      <div className="resource-grid">
        {materials.length === 0 && <div className="empty-state">No learning materials available.</div>}

        {materials.map((mat) => {
          const a = mat.attributes;
          const isVideo = a.field_em_type === "video";
          const url = getLinkUrl(a.field_em_url);

          return (
            <article className="resource-card" key={mat.id}>
              <div className="resource-type">{isVideo ? "▶ VIDEO" : "▣ PDF"}</div>

              {isVideo && url && (
                <div className="video-container">
                  <iframe src={getVideoUrlEmbed(url)} title={a.title} allowFullScreen />
                </div>
              )}

              <div className="resource-body">
                <h3>{a.title}</h3>
                <p>{richText(a.field_em_content)}</p>

                {!isVideo && url && (
                  <a href={url} target="_blank" rel="noreferrer" className="resource-link">Open PDF →</a>
                )}

                {admin && (
                  <div className="card-actions">
                    <button onClick={() => openForm(mat)}>Edit</button>
                    <button className="danger" onClick={() => handleDelete(mat)}>Delete</button>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* ADD / EDIT MODAL */}
      {form && (
        <div className="modal">
          <form className="modal-card" onSubmit={handleSubmit}>
            <div className="modal-header">
              <h2>{form.id ? "Edit Material" : "Add Material"}</h2>
              <button type="button" onClick={() => setForm(null)}>×</button>
            </div>

            <label>
              Title
              <input name="title" value={form.title} onChange={handleChange} required />
            </label>

            <label>
              Material Type
              <select name="type" value={form.type} onChange={handleChange}>
                <option value="video">Video</option>
                <option value="pdf">PDF</option>
              </select>
            </label>

            <label>
              URL
              <input
                name="url"
                value={form.url}
                onChange={handleChange}
                required
                placeholder={form.type === "video" ? "https://youtube.com/watch?v=..." : "https://example.com/file.pdf"}
              />
            </label>

            <label>
              Description / Content
              <textarea name="content" value={form.content} onChange={handleChange} rows="4" />
            </label>

            <p className="relationship-info">Subject: <strong>{subject.attributes.title}</strong></p>
            {message && <p className="error">{message}</p>}

            <div className="form-actions">
              <button className="primary-button" disabled={saving}>{saving ? "Saving..." : "Save Material"}</button>
              <button type="button" className="secondary-button" onClick={() => setForm(null)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
