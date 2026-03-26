FROM nginx:1.27-alpine

# Serve the game as static files
WORKDIR /usr/share/nginx/html
COPY . .

# Optional hardening: ensure default nginx index is replaced by project files
RUN rm -f /usr/share/nginx/html/50x.html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
