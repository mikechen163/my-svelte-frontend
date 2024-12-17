<!-- src/routes/login/+page.svelte -->
<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import { Card } from "$lib/components/ui/card";
    import { Input } from "$lib/components/ui/input";
    import { auth } from '$lib/stores/authStore';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';

    let email = '';
    let password = '';
    let error = '';
    let isLoading = false;

    onMount(async () => {
        console.log('Login page mounted');
        // 检查是否已经登录
        if (await auth.checkAuth()) {
            goto('/protected');
        }
    });

    async function handleLogin(event: SubmitEvent) {
        event.preventDefault();
        isLoading = true;
        error = '';
        
        try {
            await auth.login({ email, password });
            console.log('Login successful, redirecting...');
            await goto('/protected');
        } catch (err) {
            console.error('Login error:', err);
            if (err instanceof Error) {
                error = err.message;
            } else {
                error = '登录失败，请稍后重试';
            }
        } finally {
            isLoading = false;
        }
    }
</script>

<div class="flex items-center justify-center min-h-screen">
    <Card class="w-[350px] p-6">
        <div class="space-y-6">
            <h2 class="text-2xl font-bold text-center">用户登录</h2>
            
            <form on:submit={handleLogin} class="space-y-4">
                <div class="space-y-2">
                    <label for="email" class="text-sm font-medium">邮箱</label>
                    <Input 
                        type="email" 
                        id="email"
                        bind:value={email}
                        placeholder="请输入邮箱"
                        required
                        disabled={isLoading}
                    />
                </div>

                <div class="space-y-2">
                    <label for="password" class="text-sm font-medium">密码</label>
                    <Input 
                        type="password" 
                        id="password"
                        bind:value={password}
                        placeholder="请输入密码"
                        required
                        disabled={isLoading}
                    />
                </div>

                {#if error}
                    <p class="text-red-500 text-sm">{error}</p>
                {/if}

                <Button 
                    type="submit" 
                    class="w-full" 
                    disabled={isLoading}
                >
                    {isLoading ? '登录中...' : '登录'}
                </Button>
            </form>
        </div>
    </Card>
</div>
