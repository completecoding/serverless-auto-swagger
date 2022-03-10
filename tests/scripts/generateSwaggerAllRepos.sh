# Run this from the root of the project

cd test-repos &&

cd nodeJS-v2 && npm i && sls generate-swagger && cd ../ &&

cd python3-v2 && npm i && sls generate-swagger && cd ../ &&

cd ../