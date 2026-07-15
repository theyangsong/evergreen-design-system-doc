import { createRouter, createWebHistory } from 'vue-router';
import DocsLayout from '@/layouts/DocsLayout.vue';
import DocPageView from '@/views/DocPageView.vue';
import HomeView from '@/views/HomeView.vue';
import NotFoundView from '@/views/NotFoundView.vue';
import UnderConstructionView from '@/views/UnderConstructionView.vue';
import {
  docPages,
  sectionDefaultRoute,
} from '@/config/navigation';
import { scrollToSectionById, cancelDocScrollAnimation, getDocScrollContainer } from '@/utils/scrollToSection';

const docRoutes = Object.keys(docPages).map((fullPath) => ({
  path: fullPath.slice(1),
  name: fullPath.slice(1).replace(/\//g, '-'),
  component: DocPageView,
  meta: { docPath: fullPath },
}));

const sectionRedirects = Object.entries(sectionDefaultRoute).map(([section, fullPath]) => ({
  path: section,
  redirect: fullPath,
}));

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/',
      component: DocsLayout,
      children: [
        {
          path: 'explore',
          name: 'explore',
          component: UnderConstructionView,
        },
        ...sectionRedirects,
        ...docRoutes,
        {
          path: ':pathMatch(.*)*',
          name: 'not-found',
          component: NotFoundView,
        },
      ],
    },
  ],
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }

    if (to.hash) {
      return new Promise((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const id = to.hash.replace(/^#/, '');
            scrollToSectionById(id, 'smooth');
            resolve(false);
          });
        });
      });
    }

    return false;
  },
});

router.beforeEach((to, from) => {
  if (to.path !== from.path) {
    cancelDocScrollAnimation();
    getDocScrollContainer()?.scrollTo({ top: 0, behavior: 'auto' });
  }
});
