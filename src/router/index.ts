import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/profile/:username',
            component: async () => import('@/pages/ProfilePage.vue'),
        },
        {
            path: '/stats',
            component: async () => import('@/pages/StatsPage.vue'),
        },
        {
            path: '/',
            component: async () => import('@/pages/CanvasPage.vue'),
        },
        {
            path: '/:pathMatch(.*)*',
            component: async () => import('@/pages/NotFoundPage.vue'),
        },
    ],
});

export default router;
