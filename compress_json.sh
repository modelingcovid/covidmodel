#!/bin/bash
ls public/json/**/*.json | xargs -Ifile sh -c "sed -i '' 's/^[[:space:]]*//;s/\(\.[0-9]\{4\}\)[0-9]*/\1/g' 'file' && printf '.'"
echo
