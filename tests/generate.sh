#!/usr/bin/env bash

openapi_file=$(mktemp)

yq "$PWD/../server/api/openapi.yaml" --output-format json > "$openapi_file"

uvx --python 3.13 openapi-python-client@0.21.6 generate \
    --config "$PWD/python-openapi-client.yaml" \
    --path "$openapi_file" \
    --output-path "$PWD/shifttree-api-client" \
    --meta pdm \
    --overwrite \
