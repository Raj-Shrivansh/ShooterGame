FROM nginx:1.27-alpine

# Railway provides PORT at runtime; nginx template renders it on startup.
ENV NGINX_ENTRYPOINT_WORKER_PROCESSES_AUTOTUNE=0
ENV PORT=8080

WORKDIR /usr/share/nginx/html

# Copy only static site assets.
COPY index.html ./
COPY style.css ./
COPY js ./js

# Provide an nginx config template that binds to ${PORT}.
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 8080
