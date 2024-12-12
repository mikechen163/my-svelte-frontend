// vite.config.ts  
import { sveltekit } from '@sveltejs/kit/vite';  
import { defineConfig } from 'vite';  

export default defineConfig({  
    plugins: [sveltekit()],  
    server: {  
        proxy: {  
            '/api': {  
                target: 'http://192.168.191.56:4000',  
                changeOrigin: true,  
                rewrite: (path) => path.replace(/^\/api/, ''),  
                configure: (proxy, _options) => {  
                    proxy.on('error', (err, _req, _res) => {  
                        console.log('proxy error', err);  
                    });  
                    proxy.on('proxyReq', (proxyReq, req, _res) => {  
                        console.log('Sending Request:', req.method, req.url);  
                    });  
                    proxy.on('proxyRes', (proxyRes, req, _res) => {  
                        console.log('Received Response:', proxyRes.statusCode, req.url);  
                    });  
                }  
            }  
        }  
    }  
});  
