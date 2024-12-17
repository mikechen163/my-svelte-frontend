// src/routes/+page.ts
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const ssr = false;

export const load = (async ({ url }) => {
    console.log('Root page load, redirecting to /login');
    throw redirect(303, '/login');
}) satisfies PageLoad;
