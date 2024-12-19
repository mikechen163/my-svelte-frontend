<!-- src/routes/+layout.svelte -->
<script lang="ts">
    import "../app.postcss";
    import { onMount } from 'svelte';
    import { auth, isAuthenticated } from '$lib/stores/authStore';

    onMount(() => {
        console.log('Root layout mounted');
    });
</script>

<div class="min-h-screen bg-background">
    <slot />
</div>

<style>
    :global(html, body) {
        height: 100%;
        margin: 0;
        padding: 0;
    }
</style>
