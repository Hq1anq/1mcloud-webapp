import { ProductAction } from "../types/action.types.ts";

export interface ServerRow {
  sid: number;
  ip_port?: string;
  country?: string;
  type?: string;
  created?: string;
  expired?: string;
  status?: string;
  note?: string;
  is_auto_renew?: boolean;
  user_pass?: string;
  plan_number?: string;
  he_dieu_hanh?: string;
  price_vnd?: string;
  last_action: ProductAction;
  last_action_time: string;
  [key: string]: any;
}

export interface DbRecord {
  sid: number;
  user_pass?: string;
  he_dieu_hanh?: string;
  last_action: ProductAction;
  last_action_time: Date;
  [key: string]: any;
}

/**
 * Merge remote Proxy list (Data 1) with local DB Proxy records (Data 2)
 */
export function mergeProxyData(
  remoteServers: ServerRow[],
  dbProxies: DbRecord[],
): ServerRow[] {
  const dbMap = new Map<number, DbRecord>(
    dbProxies.map((row) => [row.sid, row]),
  );

  return remoteServers.map((server) => {
    const dbRow = dbMap.get(server.sid);
    let userPass: string | undefined = undefined;

    if (dbRow && dbRow.user_pass) {
      userPass = dbRow.user_pass;
    } else if (server.user_pass !== undefined) {
      userPass = server.user_pass;
    }

    const lastAction = dbRow ? dbRow.last_action : ProductAction.CREATE;
    const lastActionTime = (dbRow ? dbRow.last_action_time : new Date()).toISOString();

    return {
      ...server,
      ...(userPass !== undefined && { user_pass: userPass }),
      last_action: lastAction,
      last_action_time: lastActionTime,
    };
  });
}

/**
 * Merge remote VPS list (Data 1) with local DB VPS records (Data 2)
 * Applies OS-based default username if user_pass is missing or has no '/'
 */
export function mergeVpsData(
  remoteServers: ServerRow[],
  dbVpsList: DbRecord[],
): ServerRow[] {
  const dbMap = new Map<number, DbRecord>(
    dbVpsList.map((row) => [row.sid, row]),
  );

  return remoteServers.map((server) => {
    const dbRow = dbMap.get(server.sid);
    let userPass: string | undefined = undefined;

    if (dbRow && dbRow.user_pass) {
      userPass = dbRow.user_pass;
    } else if (server.user_pass !== undefined) {
      userPass = server.user_pass;
    }

    // Default OS user if userPass is empty or missing '/'
    if (!userPass || !userPass.includes("/")) {
      const os = (
        server.he_dieu_hanh ||
        dbRow?.he_dieu_hanh ||
        ""
      ).toLowerCase();
      const defaultUser = os.includes("ubuntu")
        ? "root"
        : os.includes("win")
          ? "Administrator"
          : "";

      if (defaultUser) {
        userPass = `${defaultUser}/`;
      }
    }

    const lastAction = dbRow ? dbRow.last_action : ProductAction.CREATE;
    const lastActionTime = (dbRow ? dbRow.last_action_time : new Date()).toISOString();

    return {
      ...server,
      ...(userPass !== undefined && { user_pass: userPass }),
      last_action: lastAction,
      last_action_time: lastActionTime,
    };
  });
}
