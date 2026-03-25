const HEADERS = {
  accept: "application/json, text/plain, */*",
  "content-type": "application/json",
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
};

export async function list(req, res) {
  const url = `${process.env.BASE_URL}/server/list`;
  const { ips, amount, proxy } = req.query;

  const headers = { ...HEADERS, authorization: `Bearer ${req.token}` };

  const params = new URLSearchParams({
    page: 1,
    limit: amount || 200,
    by_status: "",
    by_time: "all",
    by_created: "",
    keyword: "",
    ips: ips || "",
  });

  const isProxy = proxy === "true";

  if (isProxy) {
    params.set("proxy", "true");
  }

  try {
    const response = await fetch(`${url}?${params.toString()}`, {
      method: "GET",
      headers: headers,
    });

    if (!response.ok || response.status !== 200) {
      console.error("Request failed:", response.status);
      return res
        .status(response.status)
        .json({ error: "getData Request failed" });
    }

    const json = await response.json();
    const servers = json.servers || [];

    const data = servers.map((server) => ({
      sid: server.server_id,
      ...(!isProxy && { plan_number: server.plan_number }),
      ip_port: server.ip_port,
      country: server.country,
      type: server.he_dieu_hanh,
      ...(!isProxy && { he_dieu_hanh: server.he_dieu_hanh }),
      ...(!isProxy && { price_vnd: server.price_vnd }),
      created: server.ngay_mua,
      expired: server.het_han,
      ip_changed: server.change_ip_time,
      status: server.trang_thai,
      note: server.note,
    }));

    return res.json({ data });
  } catch (err) {
    console.error("Error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function support(req, res) {
  const url = `${process.env.BASE_URL}/server/proxy/support`;
  const { nation } = req.query;
  const headers = { ...HEADERS, authorization: `Bearer ${req.token}` };

  const params = new URLSearchParams({
    nation: nation,
  });

  try {
    const response = await fetch(`${url}?${params.toString()}`, {
      method: "GET",
      headers,
    });

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

export async function create(req, res) {
  const {
    plan_id,
    duration,
    quantity,
    os_id,
    nation,
    proxy_type,
    random_username,
    random_password,
    random_remote_port,
    username,
    password,
    remote_port,
    range_ip,
    note,
    install_chrome,
    install_firefox,
    isp,
    state,
    coupon,
    auto_renew,
    is_proxy,
  } = req.body;

  const url = `${process.env.BASE_URL}/server/create`;
  const headers = { ...HEADERS, authorization: `Bearer ${req.token}` };

  const payload = {
    plan_id: Number(plan_id),
    duration: Number(duration) || 1,
    quantity: Number(quantity) || 1,
    auto_renew: Boolean(auto_renew),
    os_id: Number(os_id) || 1,
    random_username: Boolean(random_username),
    random_password: Boolean(random_password),
    random_remote_port: Boolean(random_remote_port),
    install_chrome: Boolean(install_chrome),
    install_firefox: Boolean(install_firefox),
    note: note || undefined,
    range_ip: range_ip || "Ngẫu nhiên",
    nation: nation || "VN",
    coupon: coupon || undefined,
    remote_port: random_remote_port ? undefined : remote_port,
    username: random_username ? undefined : username,
    password: random_password ? undefined : password,
    state: state || undefined,
    provider: isp || undefined,
    proxy_type: proxy_type || "proxy_https",
    is_proxy: is_proxy,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`Failed to BUY:`, response.status);
      return res.status(response.status).json({
        success: false,
        error: "BUY request failed",
      });
    }

    const json = await response.json();
    const servers = json.servers || [];
    const serverType =
      proxy_type === "proxy_https" ? "HTTPS Proxy" : "SOCKS5 Proxy";

    const today = new Date();
    const expiredDate = new Date(today);
    expiredDate.setDate(today.getDate() + Number(duration) * 30);

    const formatDate = (date) => {
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    };

    const tableData = servers.map((server) => ({
      sid: server.id,
      ip_port: `${server.ip}:${server.remote_port}`,
      ...(is_proxy && { country: nation }),
      ...(is_proxy && { type: serverType }),
      created: formatDate(today),
      expired: formatDate(expiredDate),
      ip_changed: 0,
      status: "Running",
      note: note,
      ...(is_proxy && { user_pass: `${server.username}:${server.password}` }),
      ...(!is_proxy && { user_pass: `${server.username}/${server.password}` }),
    }));

    return res.json({
      success: true,
      data: tableData,
    });
  } catch (error) {
    console.error("Failed to BUY PROXY", error.message);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}

export async function calculate(req, res) {
  const { plan_id, is_proxy, quantity, duration, nation, coupon } = req.body;
  const url = `${process.env.BASE_URL}/server/create/calculate`;
  const headers = { ...HEADERS, authorization: `Bearer ${req.token}` };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        plan_id: plan_id,
        nation: is_proxy ? nation : undefined,
        quantity: quantity,
        duration: duration,
        is_proxy: is_proxy || false,
        coupon: coupon,
      }),
    });

    if (!response.ok) {
      console.error(`Failed to CALC BUY:`, response.status);
      return res.status(response.status).json({
        success: false,
        error: "CALC BUY request failed",
      });
    }

    const data = await response.json();
    return res.json({ success: true, info: data });
  } catch (error) {
    console.error("Failed to CALC BUY", error.message);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
}

export async function changeIp(req, res) {
  const { ip, type = "proxy_https" } = req.body;
  const url = `${process.env.BASE_URL}/server/change-ip`;
  const headers = { ...HEADERS, authorization: `Bearer ${req.token}` };

  let data = {
    ip: ip,
    os_id: 0,
    proxy_type: type,
    range_ip: "Ngẫu nhiên",
    random_password: true,
    random_remote_port: true,
    isp: "Ngẫu nhiên",
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      console.error(`Failed to CHANGE IP for ${ip}:`, response.status);
      return res.status(response.status).json({
        success: false,
        error: "CHANGE IP request failed",
        ip,
      });
    }

    const rawData = await response.json();
    return res.json({
      success: true,
      proxyInfo: [
        rawData.new_ip,
        rawData.remote_port,
        rawData.username,
        rawData.password,
      ],
    });
  } catch (error) {
    console.error(`Failed to CHANGE IP for ${ip}`, error.message);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      ip,
    });
  }
}

export async function reinstall(req, res) {
  const { sid, custom_info, type } = req.body;
  const url = `${process.env.BASE_URL}/server/reinstall`;
  const headers = { ...HEADERS, authorization: `Bearer ${req.token}` };

  let range_ip = "",
    remote_port = "",
    username = "",
    password = "";
  let random_remote_port = "on",
    random_username = "on",
    random_password = "on";
  if (custom_info) {
    const reinstallInfo = custom_info.split(":");
    if (reinstallInfo.length === 4) {
      [range_ip, remote_port, username, password] = reinstallInfo;
      random_remote_port = "";
      random_username = "";
      random_password = "";
    } else if (reinstallInfo.length === 3) {
      [remote_port, username, password] = reinstallInfo;
      random_remote_port = "";
      random_username = "";
      random_password = "";
    } else if (reinstallInfo.length === 2) {
      [username, password] = reinstallInfo;
      random_username = "";
      random_password = "";
    } else {
      return res.status(400).json({
        error:
          "Invalid custom_info format. Expected format: remote_port:username:password or range_ip:remote_port:username:password or username:password",
      });
    }
  }
  const data = {
    random_remote_port,
    remote_port,
    random_username,
    username,
    random_password,
    password,
    type,
    sid,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      console.error(`Failed to REINSTALL for sid ${sid}:`, response.status);
      return res.status(response.status).json({
        success: false,
        error: "REINSTALL request failed",
      });
    }

    const rawData = await response.json();
    return res.json({
      success: true,
      proxyInfo: [
        rawData.ip,
        rawData.remote_port,
        rawData.username,
        rawData.password,
      ],
    });
  } catch (error) {
    console.error(`Failed to REINSTALL for sid: ${sid}`, error.message);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      sid,
    });
  }
}

export async function pause(req, res) {
  const { sids } = req.body;
  const url = `${process.env.BASE_URL}/server/pause`;
  const headers = { ...HEADERS, authorization: `Bearer ${req.token}` };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ sid: sids }),
    });

    if (!response.ok) {
      console.error(`Failed to PAUSE for sids: ${sids}:`, response.status);
      return res.status(response.status).json({
        success: false,
        error: "Request failed",
        sids,
      });
    }

    const data = await response.json();
    res.json({ success: true, result: data.result });
  } catch (error) {
    console.error(`Failed to PAUSE for sid: ${sids}`, error.message);
    res
      .status(500)
      .json({ success: false, error: "Internal server error", sids });
  }
}

export async function reboot(req, res) {
  const { sids } = req.body;
  const url = `${process.env.BASE_URL}/server/reboot`;
  const headers = { ...HEADERS, authorization: `Bearer ${req.token}` };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ sid: sids }),
    });

    if (!response.ok) {
      console.error(`Failed to REBOOT for sids: ${sids}:`, response.status);
      return res.status(response.status).json({
        success: false,
        error: "Request failed",
        sids,
      });
    }

    const data = await response.json();
    res.json({ success: true, result: data.result });
  } catch (error) {
    console.error(`Failed to REBOOT for sid: ${sids}`, error.message);
    res
      .status(500)
      .json({ success: false, error: "Internal server error", sids });
  }
}

export async function renew(req, res) {
  const { sids, month = 1 } = req.body;
  const url = `${process.env.BASE_URL}/server/renew`;
  const headers = { ...HEADERS, authorization: `Bearer ${req.token}` };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ sid: sids, month: month }),
    });

    if (!response.ok) {
      console.error(`Failed to RENEW for sids: ${sids}:`, response.status);
      return res.status(response.status).json({
        success: false,
        error: "Request failed",
        sids,
      });
    }

    const data = await response.json();
    res.json({ success: true, result: data.result });
  } catch (error) {
    console.error(`Failed to RENEW for sid: ${sids}`, error.message);
    res
      .status(500)
      .json({ success: false, error: "Internal server error", sids });
  }
}

export async function renewCalculate(req, res) {
  const { sids, month = 1 } = req.body;
  const url = `${process.env.BASE_URL}/server/renew/calculate`;
  const headers = { ...HEADERS, authorization: `Bearer ${req.token}` };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ sid: sids, month: month }),
    });

    if (!response.ok) {
      console.error(
        `Failed to RENEW CALCULATE for sids: ${sids}:`,
        response.status,
      );
      return res.status(response.status).json({
        success: false,
        error: "Request failed",
        sids,
      });
    }

    const data = await response.json();
    res.json({ success: true, result: data.result });
  } catch (error) {
    console.error(`Failed to RENEW CALCULATE for sid: ${sids}`, error.message);
    res
      .status(500)
      .json({ success: false, error: "Internal server error", sids });
  }
}

export async function updateNote(req, res) {
  const { sid, newNote } = req.body;
  const url = `${process.env.BASE_URL}/server/info/note`;
  const headers = {
    ...HEADERS,
    authorization: `Bearer ${req.token}`,
  };

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        sid: sid,
        note: newNote,
      }),
    });

    if (!response.ok) {
      console.log(
        `❌ Failed to CHANGE NOTE for sid: ${sid}: `,
        response.status,
      );
      return res.status(response.status).json({
        success: false,
        error: "Request failed",
        sid,
      });
    }

    const rawData = await response.json();
    res.json({ success: rawData.result === "success" });
  } catch (error) {
    console.log(error);
    console.error(`Failed to CHANGE NOTE for sid: ${sid}`, error.message);
    res
      .status(500)
      .json({ success: false, error: "Internal server error", sid });
  }
}

export async function resetPassword(req, res) {
  const { sids } = req.body;
  const url = `${process.env.BASE_URL}/server/reset-password`;
  const headers = { ...HEADERS, authorization: `Bearer ${req.token}` };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ sid: sids }),
    });

    if (!response.ok) {
      console.error(
        `Failed to RESET PASSWORD for sids: ${sids}:`,
        response.status,
      );
      return res.status(response.status).json({
        success: false,
        error: "Request failed",
        sids,
      });
    }

    const data = await response.json();
    res.json({ success: true, result: data.result });
  } catch (error) {
    console.error(`Failed to RESET PASSWORD for sid: ${sids}`, error.message);
    res
      .status(500)
      .json({ success: false, error: "Internal server error", sids });
  }
}

export async function autoFix(req, res) {
  const { sids } = req.body;
  const url = `${process.env.BASE_URL}/server/auto-fix`;
  const headers = { ...HEADERS, authorization: `Bearer ${req.token}` };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ sid: sids }),
    });

    if (!response.ok) {
      console.error(`Failed to AUTO FIX for sids: ${sids}:`, response.status);
      return res.status(response.status).json({
        success: false,
        error: "Request failed",
        sids,
      });
    }

    const data = await response.json();
    res.json({ success: true, result: data.result });
  } catch (error) {
    console.error(`Failed to AUTO FIX for sid: ${sids}`, error.message);
    res
      .status(500)
      .json({ success: false, error: "Internal server error", sids });
  }
}
