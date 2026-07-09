export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8080',
  // Phase A services (auth, jobs, applications, assessments, offers, joining letters,
  // locations) always call the real nexHIRE backend. Modules not yet built on the
  // backend (BGV, trainees, projects, assets, admin users) keep returning mock data
  // while this flag is true, so the whole app stays demoable.
  useMockData: true,
  tokenKey: 'nexhire_token',
  userKey: 'nexhire_user',
  appName: 'NexHire',
  version: '1.0.0',
};
