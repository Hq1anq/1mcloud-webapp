const HEADERS = {
  accept: "application/json, text/plain, */*",
  "content-type": "application/json",
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
};

export async function transaction(req, res) {
  const url = `${process.env.BASE_URL}/logs/transaction`;
  const headers = { ...HEADERS, authorization: `Bearer ${req.token}` };

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: headers,
    });

    if (!response.ok || response.status !== 200) {
      console.error("Request failed:", response.status);
      return res
        .status(response.status)
        .json({ error: "Get Log Transactions Request failed" });
    }

    const data = await response.json();
    return res.json({ success: true, info: data });
  } catch (err) {
    console.error("Error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function changeIp(req, res) {
  const url = `${process.env.BASE_URL}/logs/change-ip`;
  const headers = { ...HEADERS, authorization: `Bearer ${req.token}` };

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: headers,
    });

    if (!response.ok || response.status !== 200) {
      console.error("Request failed:", response.status);
      return res
        .status(response.status)
        .json({ error: "Get Log Change IPs Request failed" });
    }

    const data = await response.json();
    return res.json({ success: true, info: data });
  } catch (err) {
    console.error("Error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
}
