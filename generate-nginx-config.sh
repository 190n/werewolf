#!/bin/sh

(cat <<BLOCK
server {
    listen       80;
    listen  [::]:80;
    server_name  localhost;

    location / {
        root   /usr/share/nginx/html;
        index  index.html index.htm;
    }

    error_page  404              /index.html;

    # redirect server error pages to the static page /50x.html
    #
    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }

    location /connect {
        proxy_pass http://BACKEND_HOST_PORT/connect;
        # proxy_http_version 1.1;
        # proxy_set_header Upgrade "$http_upgrade";
        # proxy_set_header Connection "upgrade";
    }

    location /games {
        proxy_pass http://BACKEND_HOST_PORT/games;
    }
}
BLOCK
) | sed "s/BACKEND_HOST_PORT/$BACKEND_HOST_PORT/g"


                 /games/create?nick=ben
BACKEND_HOST_PORT/games/create?nick=ben
{"payerId": slkfjsalkdfj}

WS /connect?gameId=123456&playerId=sdlkfjsdlkjfkf
