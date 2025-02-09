//DOCS: https://prometheus.io/docs/alerting/latest/configuration/

export type AlertManagerCortexConfig = {
  template_files: Record<string, string>;
  alertmanager_config: AlertmanagerConfig;
};

// NOTE - This type is incomplete! But currently, we don't need more.
export type AlertmanagerStatusPayload = {
  config: {
    original: string;
  };
};

export type TLSConfig = {
  ca_file: string;
  cert_file: string;
  key_file: string;
  server_name?: string;
  insecure_skip_verify?: boolean;
};

export type HTTPConfigCommon = {
  proxy_url?: string;
  tls_config?: TLSConfig;
};

export type HTTPConfigBasicAuth = {
  basic_auth: {
    username: string;
  } & ({ password: string } | { password_file: string });
};

export type HTTPConfigBearerToken = {
  bearer_token: string;
};

export type HTTPConfigBearerTokenFile = {
  bearer_token_file: string;
};

export type HTTPConfig = HTTPConfigCommon & (HTTPConfigBasicAuth | HTTPConfigBearerToken | HTTPConfigBearerTokenFile);

export type EmailConfig = {
  to: string;

  send_resolved?: string;
  from?: string;
  smarthost?: string;
  hello?: string;
  auth_username?: string;
  auth_password?: string;
  auth_secret?: string;
  auth_identity?: string;
  require_tls?: boolean;
  tls_config?: TLSConfig;
  html?: string;
  text?: string;
  headers?: Record<string, string>;
};

export type WebhookConfig = {
  url: string;

  send_resolved?: boolean;
  http_config?: HTTPConfig;
  max_alerts?: number;
};

export type GrafanaManagedReceiverConfig = {
  id?: number;
  frequency: number;
  disableResolveMessage: boolean;
  secureFields: Record<string, unknown>;
  settings: Record<string, unknown>;
  sendReminder: boolean;
  type: string;
  uid: string;
  updated?: string;
  created?: string;
};

export type Receiver = {
  name: string;

  email_configs?: EmailConfig[];
  pagerduty_configs?: unknown[];
  pushover_configs?: unknown[];
  slack_configs?: unknown[];
  opsgenie_configs?: unknown[];
  webhook_configs?: WebhookConfig[];
  victorops_configs?: unknown[];
  wechat_configs?: unknown[];
  grafana_managed_receiver_configs?: GrafanaManagedReceiverConfig[];
  [key: string]: unknown;
};

export type Route = {
  receiver?: string;
  group_by?: string[];
  continue?: boolean;
  match?: Record<string, string>;
  match_re?: Record<string, string>;
  group_wait?: string;
  group_interval?: string;
  repeat_itnerval?: string;
  routes?: Route[];
};

export type InhibitRule = {
  target_match: Record<string, string>;
  target_match_re: Record<string, string>;
  source_match: Record<string, string>;
  source_match_re: Record<string, string>;
  equal?: string[];
};

export type AlertmanagerConfig = {
  global?: {
    smtp_from?: string;
    smtp_smarthost?: string;
    smtp_hello?: string;
    smtp_auth_username?: string;
    smtp_auth_password?: string;
    smtp_auth_identity?: string;
    smtp_auth_secret?: string;
    smtp_require_tls?: boolean;
    slack_api_url?: string;
    victorops_api_key?: string;
    victorops_api_url?: string;
    pagerduty_url?: string;
    opsgenie_api_key?: string;
    opsgenie_api_url?: string;
    wechat_api_url?: string;
    wechat_api_secret?: string;
    wechat_api_corp_id?: string;
    http_config?: HTTPConfig;
    resolve_timeout?: string;
  };
  templates?: string[];
  route?: Route;
  inhibit_rules?: InhibitRule[];
  receivers?: Receiver[];
};

export type SilenceMatcher = {
  name: string;
  value: string;
  isRegex: boolean;
};

export enum SilenceState {
  Active = 'active',
  Expired = 'expired',
  Pending = 'pending',
}

export enum AlertState {
  Unprocessed = 'unprocessed',
  Active = 'active',
  Suppressed = 'suppressed',
}

export type Silence = {
  id: string;
  matchers?: SilenceMatcher[];
  startsAt: string;
  endsAt: string;
  updatedAt: string;
  createdBy: string;
  comment: string;
  status: {
    state: SilenceState;
  };
};

export type SilenceCreatePayload = {
  id?: string;
  matchers?: SilenceMatcher[];
  startsAt: string;
  endsAt: string;
  createdBy: string;
  comment: string;
};

export type AlertmanagerAlert = {
  startsAt: string;
  updatedAt: string;
  endsAt: string;
  generatorURL?: string;
  labels: { [key: string]: string };
  annotations: { [key: string]: string };
  receivers: [
    {
      name: string;
    }
  ];
  fingerprint: string;
  status: {
    state: AlertState;
    silencedBy: string[];
    inhibitedBy: string[];
  };
};

export type AlertmanagerGroup = {
  labels: { [key: string]: string };
  receiver: { name: string };
  alerts: AlertmanagerAlert[];
  id: string;
};
