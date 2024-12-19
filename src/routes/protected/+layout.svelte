<!-- src/routes/protected/+layout.svelte -->
<script lang="ts">
    import { auth } from '$lib/stores/authStore';
    import { goto } from '$app/navigation';
    import Sidebar from '$lib/components/Sidebar.svelte';

    async function handleLogout() {
        if (confirm('确定要退出登录吗？')) {
            auth.logout();
            await goto('/login');
        }
    }

    // 获取当前用户信息
    $: user = $auth;
</script>

<div class="flex h-screen">
    <!-- Sidebar -->
    <Sidebar />
    
    <!-- Main Content -->
    <div class="flex-1 ml-64 overflow-auto">
        <div class="p-6">
            <slot />
        </div>
    </div>
</div>

<style>
    :global(body) {
        margin: 0;
        padding: 0;
    }
</style>