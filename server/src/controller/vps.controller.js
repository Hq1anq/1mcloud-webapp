import { getPool } from "../lib/db.js";

const HEADERS = {
  accept: "application/json, text/plain, */*",
  "content-type": "application/json",
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
};

export async function getVpsPlan(req, res) {
  const { plan } = req.query;
  if (!plan) {
    return res.status(400).json({
      success: false,
      error: "Plan is required",
    });
  }
  const url = `${process.env.BASE_URL}/plan/vps`;
  const headers = { ...HEADERS, authorization: `Bearer ${req.token}` };

  const params = new URLSearchParams({
    region: plan,
  });

  try {
    const response = await fetch(
      `${plan === "gpu" ? `${process.env.BASE_URL}/plan/gpu` : url + "?" + params.toString()}`,
      {
        method: "GET",
        headers,
      },
    );

    if (!response.ok) {
      console.error(`Failed to GET VPS PLAN:`, response.status);
      return res.status(response.status).json({
        success: false,
        error: "GET VPS PLAN request failed",
      });
    }

    const data = await response.json();
    return res.json({ success: true, info: data });
  } catch (error) {
    console.error("Failed to GET VPS PLAN", error.message);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
}

export async function support(req, res) {
  const url = `${process.env.BASE_URL}/server/vps/support`;
  const { plan_id } = req.query;
  const headers = { ...HEADERS, authorization: `Bearer ${req.token}` };

  const params = new URLSearchParams({
    plan_id: plan_id,
  });

  try {
    const response = await fetch(
      `${plan_id === "gpu" ? `${process.env.BASE_URL}/server/gpu/support` : url + "?" + params.toString()}`,
      {
        method: "GET",
        headers,
      },
    );

    if (!response.ok) {
      console.error(`Failed to GET SUPPORT:`, response.status);
      return res.status(response.status).json({
        success: false,
        error: "GET SUPPORT request failed",
      });
    }

    const data = await response.json();
    return res.json({ success: true, info: data });
  } catch (error) {
    console.error("Failed to GET SUPPORT", error.message);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
}

/**
 * Resolve the user_id from the Bearer token.
 */
async function resolveUser(token) {
  const url = `${process.env.BASE_URL}/user/profile`;
  const response = await fetch(url, {
    method: "GET",
    headers: { ...HEADERS, authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch profile: ${response.status}`);
  }

  const profile = await response.json();
  const phone = profile.phone;

  if (!phone) {
    throw new Error("No phone found in profile");
  }

  const pool = await getPool();

  const result = await pool
    .request()
    .input("phone", phone)
    .query(`SELECT user_id FROM Users WHERE phone = @phone`);

  if (!result.recordset || result.recordset.length === 0) {
    throw new Error("User not found. Please login again.");
  }

  return result.recordset[0].user_id;
}

/**
 * GET /api/vps — Load all VPS rows for the authenticated user
 */
export async function getVpsList(req, res) {
  try {
    const userId = await resolveUser(req.token);
    const pool = await getPool();

    const result = await pool
      .request()
      .input("userId", userId)
      .query(
        `SELECT sid, plan_number, ip_port, user_pass, country, he_dieu_hanh, price_vnd, created, expired, status, note
         FROM Vps WHERE user_id = @userId`,
      );

    return res.json({ success: true, data: result.recordset });
  } catch (error) {
    console.error("❌ getVpsList error:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * POST /api/vps — Save/upsert VPS rows for the authenticated user
 * Body: { vpsList: [{ sid, plan_number, ip_port, user_pass, country, he_dieu_hanh, price_vnd, created, expired, status, note }] }
 */
export async function saveVpsList(req, res) {
  try {
    const userId = await resolveUser(req.token);
    const { vpsList } = req.body;

    if (!Array.isArray(vpsList) || vpsList.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "vpsList array is required" });
    }

    const pool = await getPool();

    const transaction = pool.transaction();
    await transaction.begin();

    try {
      for (const vps of vpsList) {
        await transaction
          .request()
          .input("userId", userId)
          .input("sid", vps.sid)
          .input("plan_number", vps.plan_number || null)
          .input("ip_port", vps.ip_port || null)
          .input("user_pass", vps.user_pass || null)
          .input("country", vps.country || null)
          .input("he_dieu_hanh", vps.he_dieu_hanh || null)
          .input("price_vnd", vps.price_vnd || null)
          .input("created", vps.created || null)
          .input("expired", vps.expired || null)
          .input("status", vps.status || null)
          .input("note", vps.note || null).query(`
            MERGE Vps AS target
            USING (SELECT @userId AS user_id, @sid AS sid) AS source
            ON target.user_id = source.user_id AND target.sid = source.sid
            WHEN MATCHED THEN
              UPDATE SET
                plan_number = COALESCE(@plan_number, target.plan_number),
                ip_port = COALESCE(@ip_port, target.ip_port),
                user_pass = COALESCE(@user_pass, target.user_pass),
                country = COALESCE(@country, target.country),
                he_dieu_hanh = COALESCE(@he_dieu_hanh, target.he_dieu_hanh),
                price_vnd = COALESCE(@price_vnd, target.price_vnd),
                created = COALESCE(@created, target.created),
                expired = COALESCE(@expired, target.expired),
                status = COALESCE(@status, target.status),
                note = COALESCE(@note, target.note)
            WHEN NOT MATCHED THEN
              INSERT (user_id, sid, plan_number, ip_port, user_pass, country, he_dieu_hanh, price_vnd, created, expired, status, note)
              VALUES (@userId, @sid, @plan_number, @ip_port, @user_pass, @country, @he_dieu_hanh, @price_vnd, @created, @expired, @status, @note);
          `);
      }

      await transaction.commit();
      return res.json({ success: true, count: vpsList.length });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (error) {
    console.error("❌ saveVpsList error:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * DELETE /api/vps — Delete VPS rows by sid for the authenticated user
 * Body: { sids: [123, 456, ...] }
 */
export async function deleteVpsList(req, res) {
  try {
    const userId = await resolveUser(req.token);
    const { sids } = req.body;

    if (!Array.isArray(sids) || sids.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "sids array is required" });
    }

    const pool = await getPool();

    const params = sids.map((_, i) => `@sid${i}`).join(",");
    const request = pool.request().input("userId", userId);
    sids.forEach((sid, i) => request.input(`sid${i}`, sid));

    await request.query(
      `DELETE FROM Vps WHERE user_id = @userId AND sid IN (${params})`,
    );

    return res.json({ success: true });
  } catch (error) {
    console.error("❌ deleteVpsList error:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
