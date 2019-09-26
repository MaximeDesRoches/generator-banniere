#!/bin/bash

  rsync -avzL --progress --chmod=Du=rwx,Dgo=rx,Fu=rw,Fgo=r --exclude-from=.rsync.exclude  ./minified/. ubuntu@enclos.ca:/var/www/clients.enclos.ca/public_html/richmedia/<%= projectName %>