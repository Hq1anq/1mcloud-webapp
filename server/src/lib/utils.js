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
