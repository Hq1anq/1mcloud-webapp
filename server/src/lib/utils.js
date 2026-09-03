// Proxy parser
// Supports: ip:port:user:pass | user:pass@ip:port
export const parseProxy = (raw) => {
  const line = raw.trim();
  if (!line) return null;

  let ip, port, username, password;

  if (line.includes("@")) {
    // user:pass@ip:port
    const [auth, hostPart] = line.split("@");
    [username, password] = auth.split(":");
    [ip, port] = hostPart.split(":");
  } else {
    const parts = line.split(":");
    if (parts.length === 4) [ip, port, username, password] = parts;
    else if (parts.length === 2) [ip, port] = parts;
    else if (parts.length === 1) [ip] = parts;
    else return null;
  }

  if (!ip) return null;

  return {
    ip,
    port: port ? String(port) : undefined,
    username: username || undefined,
    password: password || undefined,
  };
};

export const normalizeText = (str) => {
  if (str == null) return "";
  return String(str)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
};

export const matchText = (val, keyword) => {
  if (val == null || !keyword) return false;
  const kw = String(keyword).trim().toLowerCase();
  if (!kw) return false;

  const strVal = String(val).toLowerCase();
  if (strVal.includes(kw)) return true;

  const normalizedVal = normalizeText(strVal);
  const normalizedKw = normalizeText(kw);
  return normalizedVal.includes(normalizedKw);
};

export const filterByKeyword = (data, keyword, targetFields = []) => {
  if (
    !Array.isArray(data) ||
    !keyword ||
    typeof keyword !== "string" ||
    keyword.trim() === ""
  ) {
    return data;
  }

  return data.filter((item) =>
    targetFields.some((field) => matchText(item[field], keyword)),
  );
};

/**
 * Parse a single proxy line formatted as `ip:port:username:password`
 */
export function parseProxyLine(line) {
  if (!line || typeof line !== "string") return null;
  const trimmed = line.trim();
  if (!trimmed) return null;

  const parts = trimmed.split(":");
  if (parts.length < 4) return null;

  const ip = parts[0].trim();
  const port = parts[1].trim();
  const username = parts[2].trim();
  const password = parts.slice(3).join(":").trim();

  if (!ip || !port || !username || !password) return null;

  return {
    ip,
    port,
    ip_port: `${ip}:${port}`,
    user_pass: `${username}:${password}`,
    username,
    password,
  };
}
