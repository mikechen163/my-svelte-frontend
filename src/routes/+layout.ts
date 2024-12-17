// src/routes/+layout.ts
import { browser } from '$app/environment';
import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ url }) => {
    // 只在客户端检查认证状态
    if (browser) {
        const user = localStorage.getItem('user');
        const isLoginPage = url.pathname === '/login';

        if (!user && !isLoginPage) {
            throw redirect(307, '/login');
        }
    }

    return {};
};
