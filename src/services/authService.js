// Client-side fake backend using localStorage.
// Swap these with real API calls when ready.
const USERS_KEY = "app_users";
const TOKEN_KEY = "app_token";
const PROFILE_KEY = "app_profile";

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function loadUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; }
  catch { return []; }
}
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export async function register({ email, password, nickname }) {
  const users = loadUsers();
  await wait(250);
  if (users.some((u) => u.email === email)) {
    throw new Error("This email is already registered.");
  }
  users.push({ email, password, nickname: nickname || email.split("@")[0] });
  saveUsers(users);
  return { ok: true };
}

export async function login({ email, password }) {
  const users = loadUsers();
  await wait(250);
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) throw new Error("Invalid email or password.");
  const token = `t_${Math.random().toString(36).slice(2)}`;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(
    PROFILE_KEY,
    JSON.stringify({ email: user.email, nickname: user.nickname || "" })
  );
  return { token, user: { email: user.email, nickname: user.nickname || "" } };
}

export async function logout() {
  await wait(120);
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(PROFILE_KEY);
  return { ok: true };
}

export function getStoredAuth() {
  const token = localStorage.getItem(TOKEN_KEY);
  const raw = localStorage.getItem(PROFILE_KEY);
  const user = raw ? JSON.parse(raw) : null;
  return { token, user };
}
