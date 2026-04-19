import { getPool } from "../lib/db.js";

const HEADERS = {
  accept: "application/json, text/plain, */*",
  "content-type": "application/json",
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
};

/**
 * Resolve the user_id from the Bearer token.
 * 1. Calls smartserver.vn /user/profile to get phone
 * 2. Looks up Users table by phone
 * 3. Returns user_id
 */
async function resolveUser(token) {
  // Fetch phone from smartserver.vn profile
  const url = `${process.env.BASE_URL}/user/profile`;
  const response = await fetch(url, {
    method: "GET",
    headers: { ...HEADERS, authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const error = new Error(`Failed to fetch profile: ${response.status}`);
    error.status = response.status;
    throw error;
  }

  const profile = await response.json();
  const phone = profile.phone;

  if (!phone) {
    const error = new Error("No phone found in profile");
    error.status = 401;
    throw error;
  }

  const pool = await getPool();

  // Look up user by phone (user row is created during login)
  const result = await pool
    .request()
    .input("phone", phone)
    .query(`SELECT user_id FROM Users WHERE phone = @phone`);

  if (!result.recordset || result.recordset.length === 0) {
    const error = new Error("User not found. Please login again.");
    error.status = 401;
    throw error;
  }

  return result.recordset[0].user_id;
}

/**
 * GET /api/proxy — Load all proxy rows for the authenticated user
 */
export async function getProxies(req, res) {
  try {
    const userId = await resolveUser(req.token);
    const pool = await getPool();

    const result = await pool
      .request()
      .input("userId", userId)
      .query(
        `SELECT sid, ip_port, user_pass, country, type, created, expired, status, note
         FROM Proxy WHERE user_id = @userId`,
      );

    return res.json({ success: true, data: result.recordset });
  } catch (error) {
    console.error("❌ getProxies error:", error.message);
    return res
      .status(error.status || 500)
      .json({ success: false, error: error.message });
  }
}

/**
 * POST /api/proxy — Save/upsert proxy rows for the authenticated user
 * Body: { proxies: [{ sid, ip_port, user_pass, country, type, created, expired, status, note }] }
 */
export async function saveProxies(req, res) {
  try {
    const userId = await resolveUser(req.token);
    const { proxies } = req.body;

    if (!Array.isArray(proxies) || proxies.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "proxies array is required" });
    }

    const pool = await getPool();

    // Use a transaction for batch upsert
    const transaction = pool.transaction();
    await transaction.begin();

    try {
      for (const proxy of proxies) {
        await transaction
          .request()
          .input("userId", userId)
          .input("sid", proxy.sid)
          .input("ip_port", proxy.ip_port || null)
          .input("user_pass", proxy.user_pass || null)
          .input("country", proxy.country || null)
          .input("type", proxy.type || null)
          .input("created", proxy.created || null)
          .input("expired", proxy.expired || null)
          .input("status", proxy.status || null)
          .input("note", proxy.note || null).query(`
            MERGE Proxy AS target
            USING (SELECT @userId AS user_id, @sid AS sid) AS source
            ON target.user_id = source.user_id AND target.sid = source.sid
            WHEN MATCHED THEN
              UPDATE SET
                ip_port = COALESCE(@ip_port, target.ip_port),
                user_pass = COALESCE(@user_pass, target.user_pass),
                country = COALESCE(@country, target.country),
                type = COALESCE(@type, target.type),
                created = COALESCE(@created, target.created),
                expired = COALESCE(@expired, target.expired),
                status = COALESCE(@status, target.status),
                note = COALESCE(@note, target.note)
            WHEN NOT MATCHED THEN
              INSERT (user_id, sid, ip_port, user_pass, country, type, created, expired, status, note)
              VALUES (@userId, @sid, @ip_port, @user_pass, @country, @type, @created, @expired, @status, @note);
          `);
      }

      await transaction.commit();
      return res.json({ success: true, count: proxies.length });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (error) {
    console.error("❌ saveProxies error:", error.message);
    return res
      .status(error.status || 500)
      .json({ success: false, error: error.message });
  }
}

/**
 * DELETE /api/proxy — Delete proxy rows by sid for the authenticated user
 * Body: { sids: [123, 456, ...] }
 */
export async function deleteProxies(req, res) {
  try {
    const userId = await resolveUser(req.token);
    const { sids } = req.body;

    if (!Array.isArray(sids) || sids.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "sids array is required" });
    }

    const pool = await getPool();

    // Build parameterized IN clause
    const params = sids.map((_, i) => `@sid${i}`).join(",");
    const request = pool.request().input("userId", userId);
    sids.forEach((sid, i) => request.input(`sid${i}`, sid));

    await request.query(
      `DELETE FROM Proxy WHERE user_id = @userId AND sid IN (${params})`,
    );

    return res.json({ success: true });
  } catch (error) {
    console.error("❌ deleteProxies error:", error.message);
    return res
      .status(error.status || 500)
      .json({ success: false, error: error.message });
  }
}
