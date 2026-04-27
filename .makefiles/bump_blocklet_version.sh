#!/bin/bash

NEW_VERSION=$(cat version | awk '{$1=$1;print}')

cd blocklets/blocklet-store && blocklet version $NEW_VERSION && git add blocklet.yml && cd ../../
echo "bump blocklet store to version $NEW_VERSION"

cd blocklets/store-kit && blocklet version $NEW_VERSION && git add blocklet.yml && cd ../../
echo "bump store-kit to version $NEW_VERSION"
