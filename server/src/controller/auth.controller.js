export const login = async (req, res) => {
  const url = `${process.env.BASE_URL}/token`;
  try {
    const { email, password } = req.body;
    const headers = {
      accept: "application/json, text/plain, */*",
      "content-type": "application/x-www-form-urlencoded",
    };

    const formData = new URLSearchParams({
      email: email,
      password: password,
      client_id: "nNrWRrQrwGSj78HBSU05yxM9jW1wq6Br3SsFxRTN",
      grant_type: "password",
    });

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
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
      token: rawData.access_token,
      user: rawData.user,
    });
  } catch (error) {
    console.log("❌ Error:", error.message);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

export const getProfile = async (req, res) => {
  const url = `${process.env.BASE_URL}/user/profile`;
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json, text/plain, */*",
        "content-type": "application/json",
        authorization: `Bearer ${req.headers.authorization}`,
      },
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
