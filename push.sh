set -e

git add -A

git commit -m '压缩js代码'

# 部署到 https://<USERNAME>.github.io/<REPO>
git push git@github.com:Oda-T/OPlayer.git master:master

cd -