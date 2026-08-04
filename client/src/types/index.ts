export type Role = 'USER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  apikey?: string;
  role?: Role;
  admin?: boolean;
  banned?: boolean;
  verified?: boolean;
  created_at?: string;
  updated_at?: string;
  domains?: Domain[];
}

export interface UserAdmin extends User {
  links_count?: string | number;
  relative_created_at?: string;
  relative_updated_at?: string;
}

export interface Domain {
  id: string;
  address: string;
  homepage?: string;
  banned?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DomainAdmin extends Domain {
  user_id?: string;
  user_email?: string;
  links_count?: string | number;
  relative_created_at?: string;
  relative_updated_at?: string;
}

export interface Link {
  id: string;
  address: string;
  target: string;
  description?: string;
  link: string;
  domain?: string;
  password?: boolean;
  banned?: boolean;
  expire_in?: string | null;
  relative_expire_in?: string | null;
  visit_count: number | string;
  created_at: string;
  updated_at: string;
  relative_created_at?: string;
}

export interface LinkAdmin extends Link {
  user_id?: string;
  user_email?: string;
  banned_by_id?: string;
}

export interface CreateLinkPayload {
  target: string;
  customurl?: string;
  password?: string;
  domain?: string;
  expire_in?: string;
  description?: string;
  reuse?: boolean;
}

export interface EditLinkPayload {
  target?: string;
  customurl?: string;
  password?: string;
  expire_in?: string;
  address?: string;
}

export interface LinkStatsVisit {
  name: string;
  value: number;
}

export interface LinkStats {
  visit_count: number;
  browser: LinkStatsVisit[];
  os: LinkStatsVisit[];
  country: LinkStatsVisit[];
  referrer: LinkStatsVisit[];
  timeline?: { [key: string]: number };
}

export interface LinkStatsResponse extends LinkStats {
  id: string;
  target: string;
  link: string;
}

export interface QRXOptions {
  data: string;
  size?: number;
  color?: string;
  bgColor?: string;
  format?: 'png' | 'svg';
  apiKey?: string;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface AdminSettings {
  platform: {
    site_name: string;
    default_domain: string;
    link_length: number;
    link_custom_alphabet: string;
    disallow_registration: boolean;
    disallow_anonymous_links: boolean;
    disallow_login_form: boolean;
    trust_proxy: boolean;
    enable_rate_limit: boolean;
  };
  server: {
    port: number;
    node_env: string;
    node_app_instance: number;
    server_ip_address: string | null;
    server_cname_address: string | null;
  };
  database: {
    client: string;
    host: string | null;
    port: number | null;
    name: string;
    user: string | null;
    password_set: boolean | null;
    ssl: boolean;
    pool_min: number;
    pool_max: number;
  };
  redis: {
    enabled: boolean;
    url_set: boolean;
    url_preview: string | null;
    host: string | null;
    port: number | null;
    db: number | null;
    password_set: boolean | null;
    tls: boolean;
  };
  mail: {
    enabled: boolean;
    host: string | null;
    port: number;
    secure: boolean;
    user: string | null;
    from: string | null;
    report_email: string | null;
    contact_email: string | null;
  };
  oidc: {
    enabled: boolean;
    issuer: string | null;
    client_id_set: boolean;
    client_secret_set: boolean;
    scope: string;
    email_claim: string;
    prompt: string | null;
    button_text: string;
  };
  security: {
    jwt_secret_set: boolean;
    custom_domain_use_https: boolean;
  };
}
