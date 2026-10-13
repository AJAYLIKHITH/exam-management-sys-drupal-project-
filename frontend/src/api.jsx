const drupalUrl = (import.meta.env.VITE_DRUPAL_URL || "http://localhost/drupal_test/web").replace(/\/$/, "");
const jsonApiUrl = `${drupalUrl}/jsonapi`;

// Reusable header configurations to prevent typos and reduce code
const stdHeaders = { Accept: "application/json", "Content-Type": "application/json" };
const apiHeaders = { Accept: "application/vnd.api+json", "Content-Type": "application/vnd.api+json" };

/* =====================================================
   1. CORE REQUEST HANDLER
   ===================================================== */
async function request(url, options = {}) {
  try {
    const response = await fetch(url, { credentials: "include", ...options });
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
      throw new Error(data?.message || data?.error || `Request failed (${response.status})`);
    }
    return data;
  } catch (err) {
    console.error("Fetch error:", err);
    throw new Error(err.message || "Cannot connect to Drupal.");
  }
}

/* =====================================================
   2. AUTH & CUSTOM ENDPOINTS
   ===================================================== */
export const login = (name, pass, mode) =>
  request(`${drupalUrl}/api/exam-management/login`, { method: "POST", headers: stdHeaders, body: JSON.stringify({ name, pass, mode }) });

export const logout = () =>
  request(`${drupalUrl}/api/exam-management/logout`, { method: "POST", headers: { Accept: "application/json" } });

export const registerStudent = (name, mail, pass) =>
  request(`${drupalUrl}/api/exam-management/register`, { method: "POST", headers: stdHeaders, body: JSON.stringify({ name, mail, pass }) });

export const currentUser = () =>
  request(`${drupalUrl}/api/exam-management/me`, { method: "GET", headers: { Accept: "application/json" } });

export const remove = (type, id) => {
  if (!type || !id) throw new Error("Content type and ID are required.");
  return request(`${drupalUrl}/api/exam-management/delete`, { method: "POST", headers: stdHeaders, body: JSON.stringify({ type, id }) });
};

/* =====================================================
   3. JSON:API CRUD OPERATIONS
   ===================================================== */
export const csrfToken = async () => {
  const res = await fetch(`${drupalUrl}/session/token`, { method: "GET", credentials: "include", headers: { Accept: "text/plain" }, cache: "no-store" });
  if (!res.ok) throw new Error(`Unable to get Drupal CSRF token (${res.status}).`);
  return (await res.text()).trim();
};

export const list = async (type, filter = "") =>
  (await request(`${jsonApiUrl}/node/${type}${filter ? `?${filter}` : ""}`, { headers: apiHeaders }))?.data || [];

export async function save(type, attributes, relationships = {}, id = null) {
  const token = await csrfToken();
  const body = {
    data: {
      type: `node--${type}`,
      attributes,
      ...(id && { id }),
      ...(Object.keys(relationships).length > 0 && { relationships })
    }
  };

  return request(`${jsonApiUrl}/node/${type}${id ? `/${id}` : ""}`, {
    method: id ? "PATCH" : "POST",
    headers: { ...apiHeaders, "X-CSRF-Token": token },
    body: JSON.stringify(body)
  });
}

/* =====================================================
   4. DATA FORMATTING HELPERS
   ===================================================== */
export const richText = (field) => typeof field === "string" ? field : field?.value || "";
export const getLinkUrl = (field) => typeof field === "string" ? field : field?.uri || "";
export const relation = (type, id) => ({ data: { type: `node--${type}`, id } });

/* =====================================================
   5. YOUTUBE URL PARSER
   ===================================================== */
export function getVideoUrlEmbed(url) {
  if (!url) return "";
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
}
