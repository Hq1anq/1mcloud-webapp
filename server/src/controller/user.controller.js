const HEADERS = {
  accept: "application/json, text/plain, */*",
  "content-type": "application/json",
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
};

export const getProfile = async (req, res) => {
  const url = `${process.env.BASE_URL}/user/profile`;
  const headers = { ...HEADERS, authorization: `Bearer ${req.token}` };
  try {
    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    const rawData = await response.json();

    if (!response.ok) {
      const errorText = rawData.reason || rawData.error || "Unknown error";
      console.log("❌ Request failed:", response.status, errorText);
      return res.status(response.status).json({
        success: false,
        error: errorText || "Request failed",
      });
    }

    return res.json({
      success: true,
      user: rawData,
    });
  } catch (error) {
    console.log("❌ Error:", error.message);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

export const getLicenses = async (req, res) => {
  const url = `${process.env.BASE_URL}/user/licenses`;
  const headers = { ...HEADERS, authorization: `Bearer ${req.token}` };
  try {
    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    const rawData = await response.json();

    if (!response.ok) {
      const errorText = rawData.reason || rawData.error || "Unknown error";
      console.log("❌ Request failed:", response.status, errorText);
      return res.status(response.status).json({
        success: false,
        error: errorText || "Request failed",
      });
    }

    return res.json({
      success: true,
      licenses: rawData,
    });
  } catch (error) {
    console.log("❌ Error:", error.message);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

export const addLicenses = async (req, res) => {
  const url = `${process.env.BASE_URL}/user/licenses`;
  const headers = { ...HEADERS, authorization: `Bearer ${req.token}` };
  const payload = {
    license_key: req.body.license_key,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.log(
        `❌ Failed to ADD license_key: ${payload.license_key}: `,
        response.status,
      );
      return res.status(response.status).json({
        success: false,
        error: "Request failed",
        license_key: payload.license_key,
      });
    }

    const rawData = await response.json();
    res.json({ success: true, licenses: rawData });
  } catch (error) {
    console.log("❌ Error:", error.message);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

export const editLicenses = async (req, res) => {
  const url = `${process.env.BASE_URL}/user/licenses/${req.params.id}`;
  const headers = { ...HEADERS, authorization: `Bearer ${req.token}` };
  const payload = {
    license_key: req.body.license_key,
  };

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.log(
        `❌ Failed to EDIT LICENSE for license_key: ${payload.license_key}: `,
        response.status,
      );
      return res.status(response.status).json({
        success: false,
        error: "Request failed",
        license_key: payload.license_key,
      });
    }

    const rawData = await response.json();
    res.json({ success: true, licenses: rawData });
  } catch (error) {
    console.log("❌ Error:", error.message);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

export const deleteLicenses = async (req, res) => {
  const url = `${process.env.BASE_URL}/user/licenses/${req.params.id}`;
  const headers = { ...HEADERS, authorization: `Bearer ${req.token}` };

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers,
    });

    if (!response.ok) {
      console.log(`❌ Failed to DELETE LICENSE`, response.status);
      return res.status(response.status).json({
        success: false,
        error: "Request failed",
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.log("❌ Error:", error.message);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
