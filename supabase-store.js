(function () {
  const config = window.EGE_SUPABASE;
  const sdk = window.supabase;
  if (!config?.url || !config?.publishableKey || !sdk?.createClient) {
    window.egeCloudStore = null;
    return;
  }

  const client = sdk.createClient(config.url, config.publishableKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });

  const DEFAULT_GROUP_ID = "00000000-0000-0000-0000-000000000001";

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

  async function getProfile(userId) {
    const { data, error } = await client
      .from("profiles")
      .select("id, role, name, login, created_at")
      .eq("id", userId)
      .single();
    if (error) throw error;
    return publicProfile(data);
  }

  async function getSessionProfile() {
    const { data } = await client.auth.getSession();
    if (!data.session?.user) return null;
    return getProfile(data.session.user.id);
  }

  async function registerStudent({ name, login, password }) {
    const email = String(login).trim().toLowerCase();
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: { name, login, role: "student" }
      }
    });
    if (error) throw error;
    if (!data.user) throw new Error("Пользователь не создан.");

    const profile = {
      id: data.user.id,
      role: "student",
      name,
      login
    };
    const { error: profileError } = await client.from("profiles").insert(profile);
    if (profileError) throw profileError;

    await client.from("group_students").insert({
      group_id: DEFAULT_GROUP_ID,
      student_id: data.user.id
    });

    return publicProfile({ ...profile, created_at: new Date().toISOString() });
  }

  async function signIn({ login, password }) {
    const { data, error } = await client.auth.signInWithPassword({
      email: String(login).trim().toLowerCase(),
      password
    });
    if (error) throw error;
    return getProfile(data.user.id);
  }

  async function signOut() {
    await client.auth.signOut();
  }

  async function loadProgress(userId) {
    const { data, error } = await client
      .from("progress")
      .select("variant_id, data")
      .eq("user_id", userId);
    if (error) throw error;
    return Object.fromEntries((data || []).map((item) => [item.variant_id, item.data || {}]));
  }

  async function saveVariantProgress(userId, variantId, data) {
    const { error } = await client.from("progress").upsert({
      user_id: userId,
      variant_id: variantId,
      data,
      updated_at: new Date().toISOString()
    });
    if (error) throw error;
  }

  async function loadHomework() {
    const { data, error } = await client
      .from("homework")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async function assignHomework(payload) {
    const { data, error } = await client
      .from("homework")
      .upsert({
        group_id: DEFAULT_GROUP_ID,
        subject_id: payload.subjectId,
        source_id: payload.sourceId,
        variant_id: payload.variantId,
        subject_title: payload.subjectTitle,
        source_title: payload.sourceTitle,
        variant_title: payload.variantTitle,
        assigned_by: payload.assignedBy
      }, { onConflict: "group_id,variant_id" })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async function loadStudents() {
    const { data, error } = await client
      .from("profiles")
      .select("id, role, name, login, created_at")
      .eq("role", "student")
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data || [];
  }

  async function loadSubmissions() {
    const { data, error } = await client
      .from("submissions")
      .select("*")
      .order("submitted_at", { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async function saveSubmission(payload) {
    const { error } = await client.from("submissions").upsert({
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
    }, { onConflict: "user_id,variant_id,attempt_mode" });
    if (error) throw error;
  }

  window.egeCloudStore = {
    client,
    getSessionProfile,
    registerStudent,
    signIn,
    signOut,
    loadProgress,
    saveVariantProgress,
    loadHomework,
    assignHomework,
    loadStudents,
    loadSubmissions,
    saveSubmission
  };
})();
