export const APP_CONFIG = {
  name: 'VFSTR Smart Transport Management System',
  shortName: 'VFSTR Transport',
  version: '0.1.0',
  institution: 'Vignan Foundation for Science, Technology & Research',
  routes: {
    home: '/',
    login: '/login',
    student: {
      dashboard: '/student',
      applyPass: '/student/apply',
      renewPass: '/student/renew',
      busPassCard: '/student/pass',
      payments: '/student/payments',
      routes: '/student/routes',
    },
    admin: {
      dashboard: '/admin',
      applications: '/admin/applications',
      buses: '/admin/buses',
      routes: '/admin/routes',
      payments: '/admin/payments',
      students: '/admin/students',
    },
  },
} as const;
