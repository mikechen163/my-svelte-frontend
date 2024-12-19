<!-- src/lib/components/Sidebar.svelte -->
<script lang="ts">
    import { goto } from '$app/navigation';
    import { auth } from '$lib/stores/authStore';

    async function handleLogout() {
        try {
            await auth.logout();
            await goto('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    }
</script>

<aside class="fixed left-0 top-0 h-screen w-64 bg-gray-800 text-white shadow-lg">
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
