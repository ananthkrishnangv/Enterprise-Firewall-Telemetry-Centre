import { createRouter, createWebHistory } from 'vue-router';
import DashboardView from '../views/DashboardView.vue';
import TrafficView from '../views/TrafficView.vue';
import PolicyView from '../views/PolicyView.vue';
import DevicesView from '../views/DevicesView.vue';
import ConfigDiffView from '../views/ConfigDiffView.vue';
import LiveLogsView from '../views/LiveLogsView.vue';
import ComplianceView from '../views/ComplianceView.vue';
import SettingsView from '../views/SettingsView.vue';
import UserManagementView from '../views/UserManagementView.vue';
import LoginView from '../views/LoginView.vue';
import WizardView from '../views/WizardView.vue';
import { useAuthStore } from '../stores/auth.store.js';
import { useFirewallStore } from '../stores/firewall.store.js';

const routes = [
  { path: '/login', name: 'Login', component: LoginView, meta: { public: true } },
  { path: '/wizard', name: 'Wizard', component: WizardView, meta: { public: true } },
  { path: '/', name: 'Dashboard', component: DashboardView },
  { path: '/traffic', name: 'Traffic', component: TrafficView },
  { path: '/policies', name: 'Policies', component: PolicyView },
  { path: '/devices', name: 'Devices', component: DevicesView },
  { path: '/config-diff', name: 'ConfigDiff', component: ConfigDiffView },
  { path: '/logs', name: 'Logs', component: LiveLogsView },
  { path: '/compliance', name: 'Compliance', component: ComplianceView },
  { path: '/users', name: 'UserManagement', component: UserManagementView },
  { path: '/settings', name: 'Settings', component: SettingsView },
  { path: '/:pathMatch(.*)*', redirect: '/' }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const fwStore = useFirewallStore();

  // If settings haven't been fetched yet, attempt to fetch to check setup state
  if (!fwStore.settings) {
    try {
      await fwStore.fetchSettings();
    } catch (e) {
      // ignore in offline/initial mode
    }
  }

  const isSetupComplete = fwStore.branding.isSetupComplete !== false;

  // If wizard is not completed, redirect to /wizard
  if (!isSetupComplete && to.path !== '/wizard') {
    return next('/wizard');
  }

  if (!to.meta.public && !authStore.isAuthenticated) {
    next('/login');
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/');
  } else {
    next();
  }
});

export default router;
