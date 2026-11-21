# =============================================================================
# Production Dockerfile for React 19 Frontend (High-Performance Nginx)
# =============================================================================
FROM nginx:alpine

# Copy custom Nginx configuration for client-side routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy production build assets
COPY dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Run Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
