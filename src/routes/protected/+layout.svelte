<!-- src/routes/protected/+layout.svelte -->
<script lang="ts">
    import { auth } from '$lib/stores/authStore';
    import { goto } from '$app/navigation';

    async function handleLogout() {
        if (confirm('确定要退出登录吗？')) {
            auth.logout();
            await goto('/login');
        }
    }

    // 获取当前用户信息
    $: user = $auth;
</script>

<div class="flex h-screen w-full overflow-hidden">
    <!-- Sidebar -->
    <aside class="w-64 h-screen bg-gray-800 text-white shrink-0">
        <div class="p-4">
            <h2 class="text-xl font-bold mb-6">Menu</h2>
            <nav class="space-y-2">
                <a 
                    href="/protected"
                    class="block px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                >
                    Query
                </a>
                <a 
                    href="/protected/settings"
                    class="block px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                >
                    Settings
                </a>
                <a 
                    href="/protected/tracking"
                    class="block px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                >
                    Tracking List
                </a>
                <button
                    on:click={handleLogout}
                    class="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors text-red-400"
                >
                    Logout
                </button>
            </nav>
        </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-auto">
        <div class="p-6">
            <slot />
        </div>
    </main>
</div>

<style>
    /* Reset any inherited styles that might interfere */
    :global(body) {
        margin: 0;
        padding: 0;
        overflow: hidden;
    }

    /* Ensure the layout container takes full height */
    :global(#svelte) {
        height: 100vh;
        overflow: hidden;
    }

    /* Remove margin from main content since we're using flex */
    main {
        margin-left: 0 !important;
    }
</style>
