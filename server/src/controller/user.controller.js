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
