import {Log, User, UserManager, UserManagerSettings, WebStorageStateStore} from 'oidc-client';
import {EmployeeInfoDto} from '../employee-publisher/Models/EmployeeModels';
import {CookieStorage} from 'cookie-storage';
import {axios, getConfigs, IRequestConfig, IRequestOptions, serviceOptions} from '../employee-publisher/index.defs';

export class AuthService {
  private static instance: AuthService;
  public userManager: UserManager;
  public storage: CookieStorage;
  private isAuthenticating: boolean = false;

  constructor() {
    if (AuthService.instance) {
      return AuthService.instance;
    }

    let cookieStorage = new CookieStorage({
      path: "/",
      expires: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      secure: true
    });

    this.storage = cookieStorage;
    const settings: UserManagerSettings = {
      authority: window["SERVICE_ENVS"].IDENTITY.URL,
      client_id: window["SERVICE_ENVS"].IDENTITY.CLIENT,
      redirect_uri: `${window["SERVICE_ENVS"].API_URL}signin/`,
      monitorSession: false,
      post_logout_redirect_uri: window["SERVICE_ENVS"].API_URL,
      response_type: 'code',
      scope: 'read openid profile ldap_identity orii dot-net-service-resources',
      userStore: new WebStorageStateStore({ store: cookieStorage }),
      client_secret: window["SERVICE_ENVS"].IDENTITY.SECRET,
      automaticSilentRenew: true,
      extraQueryParams: { provider: "oidc" },
    };

    this.userManager = new UserManager(settings);
    Log.logger = console;
    Log.level = Log.INFO;

    this.setupEventHandlers();
    AuthService.instance = this;
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private setupEventHandlers(): void {
    const events = this.userManager.events;

    events.addUserLoaded(() => {
      this.dispatchAuthEvent('user-authenticated');
    });

    events.addUserSignedOut(() => {
      this.dispatchAuthEvent('user-logged-out');
    });

    events.addSilentRenewError(() => {
      this.dispatchAuthEvent('auth-token-renew-failed');
    });
  }

  private dispatchAuthEvent(eventName: string): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(eventName));
    }
  }

  public getUser(): Promise<User | null> {
    return this.userManager.getUser();
  }

  private shouldSkipLogin(): boolean {
    const path = window.location.pathname.toLowerCase();
    const search = window.location.search;
    return path.includes('/signin') || search.includes('code=') || search.includes('error=');
  }

  public async login(): Promise<void> {
    if (this.shouldSkipLogin() || this.isAuthenticating) {
      return;
    }

    try {
      this.isAuthenticating = true;
      await this.userManager.signinRedirect({
        state: { returnUrl: window.location.pathname + window.location.search }
      });
    } finally {
      this.isAuthenticating = false;
    }
  }

  public async logout(): Promise<void> {
    if (this.isAuthenticating) return;

    try {
      this.isAuthenticating = true;
      const user = await this.getUser();
      if (!user) return;

      await this.userManager.clearStaleState();
      await this.userManager.signoutRedirect({ 'id_token_hint': user.id_token });
    } finally {
      this.isAuthenticating = false;
    }
  }

  public async handleAuthenticationError(): Promise<void> {
    if (this.isAuthenticating) return;

    try {
      this.isAuthenticating = true;
      await this.logout();
      await this.login();
    } finally {
      this.isAuthenticating = false;
    }
  }

  public checkForRoles(user: User | null, employeeRoles: Array<string>): boolean {
    if (!user?.profile) return false;

    if (typeof user.profile.roles === 'string') {
      return employeeRoles.includes(user.profile.roles);
    }

    if (Array.isArray(user.profile.roles)) {
      return employeeRoles.filter(role => user.profile.roles.includes(role)).length > 0;
    }

    return false;
  }

  public async getUserInfo(): Promise<EmployeeInfoDto | null> {
    const user = await this.getUser();
    return user?.profile == null ? null : await this.getEmployeeInfo({ guid: user.profile.employee_uid });
  }

  private getEmployeeInfo(params: { guid: string } = {} as any, options: IRequestOptions = {}): Promise<EmployeeInfoDto> {
    return new Promise((resolve, reject) => {
      let url = serviceOptions.axios?.defaults.baseURL + 'api/Employee/{guid}';
      url = url.replace('{guid}', params['guid'] + '');
      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);
      configs.data = null;
      axios(configs, resolve, reject);
    });
  }
}