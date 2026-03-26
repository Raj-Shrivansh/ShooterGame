FROM nginx:1.27-alpine

# Railway provides PORT at runtime.
ENV PORT=8080

WORKDIR /usr/share/nginx/html

# Copy only static site assets.
COPY index.html ./
COPY style.css ./
COPY js ./js

# Provide an nginx config template that binds to ${PORT}.
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template

# Remove default site config and render ours at container start.
RUN rm -f /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["sh", "-c", "envsubst '$PORT' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off; worker_processes 1;'"]
