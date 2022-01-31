#!/bin/bash
for f in cypress/integration/e2e/*.feature
do
  fileName=$(basename -- "$f")
  echo "Processing $fileName ..."
  node_modules/cypress/bin/cypress run --spec **/e2e/**/$fileName  || exit 1
done
