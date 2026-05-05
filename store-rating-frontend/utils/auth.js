export const getTokenPayload = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
};

export const getEmailFromToken = () => {
  const payload = getTokenPayload();
  return payload?.sub || null;
};

export const getRoleFromToken = () => {
  const payload = getTokenPayload();
  return payload?.role || null;
};

export const getUserIdFromToken = () => {
  const payload = getTokenPayload();
  return payload?.userId || null;
};
