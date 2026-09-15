(function () {
  const config = window.EGE_SUPABASE;
  if (!config?.url || !config?.publishableKey || typeof fetch !== "function") {
    window.egeCloudStore = null;
    return;
  }

  const AUTH_KEY = "ege-supabase-session-v1";
  const DEFAULT_GROUP_ID = "00000000-0000-0000-0000-000000000001";
  const baseUrl = config.url.replace(/\/+$/, "");

  function readSession() {
    try {
      return JSON.parse(localStorage.getItem(AUTH_KEY)) || null;
    } catch {
      return null;
    }
  }

  function writeSession(session) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(session));
  }

  function clearSession() {
    localStorage.removeItem(AUTH_KEY);
  }

  function authHeaders(token) {
    return {
      apikey: config.publishableKey,
      Authorization: `Bearer ${token || config.publishableKey}`,
      "Content-Type": "application/json"
    };
  }

  async function request(path, options = {}) {
    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        ...authHeaders(options.token),
        Prefer: options.prefer || "return=representation",
        ...(options.headers || {})
      }
    });
    const text = await response.text();
    const body = text ? JSON.parse(text) : null;
    if (!response.ok) {
      throw new Error(body?.msg || body?.message || body?.error_description || body?.error || `HTTP ${response.status}`);
    }
    return body;
  }

  function publicProfile(profile) {
    return {
      id: profile.id,
      role: profile.role,
      name: profile.name,
      login: profile.login,
      deviceId: "cloud",
      createdAt: profile.created_at
    };
  }

  async function getProfile(userId, token = readSession()?.access_token) {
    const rows = await request(`/rest/v1/profiles?select=id,role,name,login,created_at&id=eq.${encodeURIComponent(userId)}`, {
      method: "GET",
      token,
      prefer: ""
    });
    if (!rows?.[0]) throw new Error("Профиль пользователя не найден.");
    return publicProfile(rows[0]);
  }

  async function getSessionProfile() {
    const session = readSession();
    if (!session?.access_token || !session?.user?.id) return null;
    return getProfile(session.user.id, session.access_token);
  }

  async function registerStudent({ name, login, password }) {
    const email = String(login).trim().toLowerCase();
    const session = await request("/auth/v1/signup", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        data: { name, login: email, role: "student" }
      })
    });
    const token = session.access_token;
    if (!session.user?.id || !token) {
      throw new Error("Проверьте почту или отключите подтверждение email в Supabase.");
    }
    writeSession(session);

    await request("/rest/v1/profiles", {
      method: "POST",
      token,
      body: JSON.stringify({
        id: session.user.id,
        role: "student",
        name,
        login: email
      })
    });

    await request("/rest/v1/group_students", {
      method: "POST",
      token,
      body: JSON.stringify({
        group_id: DEFAULT_GROUP_ID,
        student_id: session.user.id
      })
    });

    return getProfile(session.user.id, token);
  }

  async function signIn({ login, password }) {
    const session = await request("/auth/v1/token?grant_type=password", {
      method: "POST",
      body: JSON.stringify({
        email: String(login).trim().toLowerCase(),
        password
      })
    });
    writeSession(session);
    return getProfile(session.user.id, session.access_token);
  }

  async function signOut() {
    const session = readSession();
    if (session?.access_token) {
      await request("/auth/v1/logout", {
        method: "POST",
        token: session.access_token,
        prefer: "return=minimal"
      }).catch(() => {});
    }
    clearSession();
  }

  async function loadProgress(userId) {
    const session = readSession();
    const rows = await request(`/rest/v1/progress?select=variant_id,data&user_id=eq.${encodeURIComponent(userId)}`, {
      method: "GET",
      token: session?.access_token,
      prefer: ""
    });
    return Object.fromEntries((rows || []).map((item) => [item.variant_id, item.data || {}]));
  }

  async function saveVariantProgress(userId, variantId, data) {
    const session = readSession();
    await request("/rest/v1/progress?on_conflict=user_id,variant_id", {
      method: "POST",
      token: session?.access_token,
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({
        user_id: userId,
        variant_id: variantId,
        data,
        updated_at: new Date().toISOString()
      })
    });
  }

  async function loadHomework() {
    const session = readSession();
    return request("/rest/v1/homework?select=*&order=created_at.desc", {
      method: "GET",
      token: session?.access_token,
      prefer: ""
    });
  }

  async function assignHomework(payload) {
    const session = readSession();
    const rows = await request("/rest/v1/homework?on_conflict=group_id,variant_id", {
      method: "POST",
      token: session?.access_token,
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify({
        group_id: DEFAULT_GROUP_ID,
        subject_id: payload.subjectId,
        source_id: payload.sourceId,
        variant_id: payload.variantId,
        subject_title: payload.subjectTitle,
        source_title: payload.sourceTitle,
        variant_title: payload.variantTitle,
        assigned_by: payload.assignedBy
      })
    });
    return rows?.[0] || null;
  }

  async function removeHomework(payload) {
    const session = readSession();
    const filter = payload.homeworkId
      ? `id=eq.${encodeURIComponent(payload.homeworkId)}`
      : `group_id=eq.${DEFAULT_GROUP_ID}&variant_id=eq.${encodeURIComponent(payload.variantId)}`;
    await request(`/rest/v1/homework?${filter}`, {
      method: "DELETE",
      token: session?.access_token,
      headers: { Prefer: "return=minimal" }
    });
  }

  async function loadStudents() {
    const session = readSession();
    return request("/rest/v1/profiles?select=id,role,name,login,created_at&role=eq.student&order=created_at.asc", {
      method: "GET",
      token: session?.access_token,
      prefer: ""
    });
  }

  async function loadSubmissions() {
    const session = readSession();
    return request("/rest/v1/submissions?select=*&order=submitted_at.desc", {
      method: "GET",
      token: session?.access_token,
      prefer: ""
    });
  }

  async function saveSubmission(payload) {
    const session = readSession();
    await request("/rest/v1/submissions?on_conflict=user_id,variant_id,attempt_mode", {
      method: "POST",
      token: session?.access_token,
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({
        user_id: payload.userId,
        homework_id: payload.homeworkId,
        subject_title: payload.subjectTitle,
        source_title: payload.sourceTitle,
        variant_id: payload.variantId,
        variant_title: payload.variantTitle,
        score: payload.score,
        total: payload.total,
        attempt_mode: payload.attemptMode,
        submitted_at: payload.at
      })
    });
  }

  window.egeCloudStore = {
    getSessionProfile,
    registerStudent,
    signIn,
    signOut,
    loadProgress,
    saveVariantProgress,
    loadHomework,
    assignHomework,
    removeHomework,
    loadStudents,
    loadSubmissions,
    saveSubmission
  };
})();
