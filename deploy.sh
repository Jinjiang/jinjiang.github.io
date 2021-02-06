#!/usr/bin/env sh

# abort on errors
set -e

# build
npm run docs:build

# clone the circleci config
cp -r .circleci docs/.vitepress/dist/

# navigate into the build output directory
cd docs/.vitepress/dist

# if you are deploying to a custom domain
# echo 'www.example.com' > CNAME
echo 'jinjiang.dev' > CNAME

git init
git config user.email "zhaojinjiang@me.com"
git config user.name "Jinjiang"
git add -A
git commit -m 'deploy'

# if you are deploying to https://<USERNAME>.github.io
# git push -f git@github.com:<USERNAME>/<USERNAME>.github.io.git master
# git push -f git@github.com:Jinjiang/jinjiang.github.io.git master
git push -f https://jinjiang:$GITHUB_TOKEN@github.com/Jinjiang/jinjiang.github.io.git master

# if you are deploying to https://<USERNAME>.github.io/<REPO>
# git push -f git@github.com:<USERNAME>/<REPO>.git master:gh-pages

cd -
