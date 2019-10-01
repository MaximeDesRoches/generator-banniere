#!/bin/bash

gulp build
gulp enclos
rsync -avzL --progress --chmod=Du=rwx,Dgo=rx,Fu=rw,Fgo=r ./minified/. ubuntu@enclos.ca:/var/www/clients.enclos.ca/public_html/richmedia/<%= projectName %>