# Build Stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Run Stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Copy custom nginx config if we had one, but default works for basic static serving
# If client-side routing (React Router) is used, we might need a custom default.conf. 
# For now, adding a simple one inline is complex, so we'll rely on default and assume basic setup or handle 404s later.
# Actually, for React Router to work on refresh, we need a small config tweak.
RUN echo 'server { listen 80; location / { root /usr/share/nginx/html; index index.html index.htm; try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
