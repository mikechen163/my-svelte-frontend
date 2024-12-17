<!-- src/routes/protected/+layout.svelte -->
<script lang="ts">
    import { auth } from '$lib/stores/authStore';
    import { goto } from '$app/navigation';
    import { Button } from "$lib/components/ui/button";

    async function handleLogout() {
        if (confirm('确定要退出登录吗？')) {
            auth.logout();
            await goto('/login');
        }
    }

    // 获取当前用户信息
    $: user = $auth;
</script>



<div class="container mx-auto px-4 py-6">
    <slot />
</div>
