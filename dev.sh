#!/bin/sh
# starts parcel dev server and backend server

(cd packages/werewolf-backend; yarn build) # so watch-node doesn't crash immediately

concurrently -k -n TypeScript,Node,Parcel -c cyan.bold,green.bold,yellow.bold\
    "cd packages/werewolf-backend; yarn watch-ts"\
    "cd packages/werewolf-backend; yarn watch-node"\
    "cd packages/werewolf-frontend; yarn serve"
