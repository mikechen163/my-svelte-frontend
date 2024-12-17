<!-- src/routes/+layout.svelte -->
<script lang="ts">
    import "../app.postcss";
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { auth, isAuthenticated } from '$lib/stores/authStore';  // 修改这里

    onMount(() => {
        console.log('Root layout mounted');
    });

    async function handleLogout() {
        try {
            await auth.logout();  // 使用 auth 而不是 authStore
            await goto('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    }
</script>

<div class="min-h-screen bg-background">
    <nav class="bg-white shadow-lg">
        <div class="max-w-7xl mx-auto px-4">
            <div class="flex justify-between h-16">
                <div class="flex items-center">
                    <a href="/" class="text-xl font-bold">Your App</a>
                </div>
                
                {#if $isAuthenticated}
                    <div class="flex items-center">
                        <span class="mr-4">{$auth?.email}</span>
                        <button
                            on:click={handleLogout}
                            class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                        >
                            退出
                        </button>
                    </div>
                {/if}
            </div>
        </div>
    </nav>

    <main>
        <slot />
    </main>
</div>
