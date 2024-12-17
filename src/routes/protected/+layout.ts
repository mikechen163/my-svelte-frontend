// src/routes/protected/+layout.ts
import { browser } from '$app/environment';
import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

export const ssr = false;

export const load = (async () => {
    if (browser) {
        const user = localStorage.getItem('user');
        console.log('Protected route check - User:', user);
        if (!user) {
            console.log('No user found, redirecting to login...');
            throw redirect(303, '/login');
        }
    }
    return {};
}) satisfies LayoutLoad;
