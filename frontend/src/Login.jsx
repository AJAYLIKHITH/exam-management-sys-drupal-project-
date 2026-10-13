import { useState } from "react";
import { login, registerStudent, currentUser } from "./api";

export default function Login({ onLogin }) {
  const [mode, setMode] = useState("student"); // 'student', 'admin', 'register'
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Dynamically update form state based on input 'name' attribute
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setMessage("");
    setForm({ username: "", email: "", password: "" }); // Reset form on tab switch
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      if (mode === "register") {
        await registerStudent(form.username.trim(), form.email.trim(), form.password);
        setMessage("Student account created successfully. Please login.");
        handleModeChange("student");
        return;
      }

      // Login Flow
      await login(form.username.trim(), form.password, mode);
      const user = await currentUser();

      // Frontend Safety / Role Validation
      if (mode === "admin" && !user.isAdmin) {
        throw new Error("Access denied. This account is not an administrator.");
      }
      if (mode === "student" && user.isAdmin) {
        throw new Error("Administrators must use the Admin Login.");
      }

      onLogin(user); // Success
    } catch (error) {
      setMessage(error.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const isRegister = mode === "register";

  return (
    <main className="login-page">
      <section className="login-intro">
        <div className="logo">CEMS</div>
        <p className="eyebrow">COMPETITIVE EXAM MANAGEMENT SYSTEM</p>
        <h1>Study smarter.<br />Prepare better.</h1>
        <p>A Drupal-powered exam management system for students and administrators.</p>
      </section>

      <section className="login-card">
        {/* Dynamic Tabs */}
        <div className="login-tabs">
          {["student", "admin", "register"].map((m) => (
            <button
              key={m}
              type="button"
              className={mode === m ? "active" : ""}
              onClick={() => handleModeChange(m)}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>

        <h2>{isRegister ? "Create Student Account" : `${mode === "admin" ? "Admin" : "Student"} Login`}</h2>

        <form onSubmit={handleSubmit}>
          <label>
            Username
            <input name="username" value={form.username} onChange={handleChange} required placeholder="Enter username" />
          </label>

          {isRegister && (
            <label>
              Email
              <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="student@example.com" />
            </label>
          )}

          <label>
            Password
            <input type="password" name="password" value={form.password} onChange={handleChange} required placeholder="Enter password" />
          </label>

          {message && <div className="message">{message}</div>}

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? "Please wait..." : isRegister ? "Create Account" : "Login"}
          </button>
        </form>
      </section>
    </main>
  );
}
