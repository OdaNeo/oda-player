set -e

git add -A

git commit -m 'npm publish'

git push -f git@github.com:Oda-T/OdaPlayer.git master:master

cd -