import { getPool } from "../lib/db.js";

const HEADERS = {
  accept: "application/json, text/plain, */*",
  "content-type": "application/json",
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
};

export async function resolveUser(token?: string): Promise<number> {
  if (!token) {
    const error: any = new Error("No token provided");
    error.status = 401;
    throw error;
  }

  const url = `${process.env.BASE_URL}/user/profile`;
  const response = await fetch(url, {
    method: "GET",
    headers: { ...HEADERS, authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const error: any = new Error(`Failed to fetch profile: ${response.status}`);
    error.status = response.status;
    throw error;
  }

  const profile = await response.json();
  const phone = profile.phone;

  if (!phone) {
    const error: any = new Error("No phone found in profile");
    error.status = 401;
    throw error;
  }

  const pool = await getPool();
  const result = await pool
    .request()
    .input("phone", phone)
    .query(`SELECT user_id FROM Users WHERE phone = @phone`);

  if (!result.recordset || result.recordset.length === 0) {
    const error: any = new Error("User not found. Please login again.");
    error.status = 401;
    throw error;
  }

  return result.recordset[0].user_id;
}
