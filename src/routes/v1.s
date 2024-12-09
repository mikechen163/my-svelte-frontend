<script lang="ts">  
    import { Button } from "$lib/components/ui/button";  
    import { Card } from "$lib/components/ui/card";  
    import { Input } from "$lib/components/ui/input";  
    import { onMount } from "svelte";  

    let message = "";  
    let loading = false;  
    let error = "";  

    // Function to fetch data from backend  
    async function fetchMessage() {  
        loading = true;  
        try {  
            const response = await fetch('http://192.168.191.56:8000/api/hello');  // Replace with your actual IP  
            const data = await response.json();  
            message = data.message;  
        } catch (e) {  
            error = "Failed to fetch data from server";  
            console.error(e);  
        } finally {  
            loading = false;  
        }  
    }  

    // Fetch data when component mounts  
    onMount(() => {  
        fetchMessage();  
    });  
</script>  

<div class="container mx-auto p-4">  
    <Card class="w-full max-w-md mx-auto">  
        <div class="p-6">  
            <h1 class="text-3xl font-bold mb-6">My Full Stack App</h1>  

            {#if loading}  
                <p class="text-gray-600">Loading...</p>  
            {:else if error}  
                <p class="text-red-500">{error}</p>  
            {:else}  
                <p class="text-lg mb-4">Message from backend: {message}</p>  
            {/if}  

            <div class="space-y-4">  
                <Input type="text" placeholder="Enter something..." />  
                <Button on:click={fetchMessage} class="w-full">  
                    Refresh Data  
                </Button>  
            </div>  
        </div>  
    </Card>  
</div>  

<style>  
    :global(body) {  
        background-color: #f0f0f0;  
    }  
</style>  
