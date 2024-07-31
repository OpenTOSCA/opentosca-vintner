```shell linenums="1"
git clone https://github.com/OpenTOSCA/opentosca-vintner.git
cd opentosca-vintner
git lfs install
git lfs pull
./task install
./task tasks:build
./task examples:pull:link
```