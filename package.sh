#!/bin/bash
echo "Packaging Lambda function..."

# Create a temporary directory
TEMP_DIR="./lambda-package"
mkdir -p $TEMP_DIR

# Copy compiled JS files to the temp directory
cp -r ./dist/* $TEMP_DIR/

# Install production dependencies in the temp directory
cd $TEMP_DIR
npm init -y
npm install --production axios aws-sdk pg winston

# Go back to the project root
cd ..

# Update the CDK code to use the new package
# (The CDK will automatically zip this directory when deploying)
sed -i 's|code: lambda.Code.fromAsset('\''../dist'\''),|code: lambda.Code.fromAsset('\''../lambda-package'\''),|g' ./cdk/lib/solar-data-stack.ts

echo "Lambda package prepared. You can now deploy with 'cd cdk && npm run cdk:deploy'"
