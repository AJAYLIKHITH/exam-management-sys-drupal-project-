// import { useState } from "react";

// import {
//   login,
//   registerStudent,
//   currentUser,
// } from "./api";


// export default function Login({
//   onLogin,
// }) {

//   const [mode, setMode] =
//     useState("student");


//   const [form, setForm] =
//     useState({

//       username: "",
//       email: "",
//       password: "",

//     });


//   const [message, setMessage] =
//     useState("");


//   const [loading, setLoading] =
//     useState(false);


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


//   function changeMode(
//     newMode
//   ) {

//     setMode(
//       newMode
//     );

//     setMessage("");

//     setForm({

//       username: "",
//       email: "",
//       password: "",

//     });

//   }


//   async function submit(
//     event
//   ) {

//     event.preventDefault();

//     setMessage("");

//     setLoading(true);


//     try {

//       /* =================================================
//          REGISTER
//          ================================================= */

//       if (
//         mode === "register"
//       ) {

//         await registerStudent(

//           form.username.trim(),

//           form.email.trim(),

//           form.password

//         );


//         setMessage(
//           "Student account created successfully. Please login."
//         );


//         setMode(
//           "student"
//         );


//         setForm({

//           username:
//             form.username.trim(),

//           email:
//             "",

//           password:
//             "",

//         });


//         return;
//       }


//       /* =================================================
//          LOGIN
//          ================================================= */

//       await login(

//         form.username.trim(),

//         form.password,

//         mode

//       );


//       /*
//        * Drupal session was successfully created.
//        */
//       const user =
//         await currentUser();


//       /* =================================================
//          FRONTEND SAFETY
//          ================================================= */

//       if (
//         mode === "admin" &&
//         user.isAdmin !== true
//       ) {

//         setMessage(
//           "Access denied. This account is not an administrator."
//         );

//         return;
//       }


//       if (
//         mode === "student" &&
//         user.isAdmin === true
//       ) {

//         setMessage(
//           "Administrators must use the Admin Login."
//         );

//         return;
//       }


//       /*
//        * Login successful.
//        */
//       onLogin(
//         user
//       );

//     }
//     catch (error) {

//       console.error(
//         "Login error:",
//         error
//       );


//       setMessage(
//         error.message ||
//         "Login failed."
//       );

//     }
//     finally {

//       setLoading(false);
//     }

//   }


//   return (

//     <main className="login-page">


//       <section className="login-intro">

//         <div className="logo">
//           CEMS
//         </div>


//         <p className="eyebrow">
//           COMPETITIVE EXAM MANAGEMENT SYSTEM
//         </p>


//         <h1>
//           Study smarter.
//           <br />
//           Prepare better.
//         </h1>


//         <p>
//           A Drupal-powered exam management
//           system for students and administrators.
//         </p>


//         <div className="architecture-mini">

//           <span>
//             React
//           </span>

//           <b>
//             ↔
//           </b>

//           <span>
//             JSON:API
//           </span>

//           <b>
//             ↔
//           </b>

//           <span>
//             Drupal
//           </span>

//         </div>

//       </section>


//       <section className="login-card">


//         <div className="login-tabs">

//           <button

//             type="button"

//             className={
//               mode === "student"
//                 ? "active"
//                 : ""
//             }

//             onClick={() =>
//               changeMode(
//                 "student"
//               )
//             }

//           >
//             Student
//           </button>


//           <button

//             type="button"

//             className={
//               mode === "admin"
//                 ? "active"
//                 : ""
//             }

//             onClick={() =>
//               changeMode(
//                 "admin"
//               )
//             }

//           >
//             Admin
//           </button>


//           <button

//             type="button"

//             className={
//               mode === "register"
//                 ? "active"
//                 : ""
//             }

//             onClick={() =>
//               changeMode(
//                 "register"
//               )
//             }

//           >
//             Register
//           </button>

//         </div>


//         <h2>

//           {mode === "register"

//             ? "Create Student Account"

//             : mode === "admin"

//             ? "Admin Login"

//             : "Student Login"

//           }

//         </h2>


//         <p className="login-description">

//           {mode === "register"

//             ? "Create a normal Drupal account for student access."

//             : mode === "admin"

//             ? "Only Drupal Administrator accounts can login here."

//             : "Only authenticated non-admin Drupal users can login here."

//           }

//         </p>


//         <form
//           onSubmit={
//             submit
//           }
//         >


//           <label>

//             Username

//             <input

//               type="text"

//               value={
//                 form.username
//               }

//               onChange={(event) =>
//                 update(
//                   "username",
//                   event.target.value
//                 )
//               }

//               required

//               placeholder="Enter username"

//               autoComplete="username"

//             />

//           </label>


//           {mode === "register" && (

//             <label>

//               Email

//               <input

//                 type="email"

//                 value={
//                   form.email
//                 }

//                 onChange={(event) =>
//                   update(
//                     "email",
//                     event.target.value
//                   )
//                 }

//                 required

//                 placeholder="student@example.com"

//                 autoComplete="email"

//               />

//             </label>

//           )}


//           <label>

//             Password

//             <input

//               type="password"

//               value={
//                 form.password
//               }

//               onChange={(event) =>
//                 update(
//                   "password",
//                   event.target.value
//                 )
//               }

//               required

//               placeholder="Enter password"

//               autoComplete={
//                 mode === "register"
//                   ? "new-password"
//                   : "current-password"
//               }

//             />

//           </label>


//           {message && (

//             <div className="message">

//               {message}

//             </div>

//           )}


//           <button

//             type="submit"

//             className="primary-button"

//             disabled={
//               loading
//             }

//           >

//             {loading

//               ? "Please wait..."

//               : mode === "register"

//               ? "Create Student Account"

//               : mode === "admin"

//               ? "Login as Admin"

//               : "Login as Student"

//             }

//           </button>


//         </form>


//         <p className="login-note">

//           {mode === "admin" && (
//             <>
//               <strong>Admin:</strong>{" "}
//               Drupal Administrator role required.
//             </>
//           )}


//           {mode === "student" && (
//             <>
//               <strong>Student:</strong>{" "}
//               Authenticated non-admin account required.
//             </>
//           )}


//           {mode === "register" && (
//             <>
//               <strong>Registration:</strong>{" "}
//               Creates a normal authenticated Drupal account.
//             </>
//           )}

//         </p>

//       </section>

//     </main>
//   );
// }
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
