#!/bin/bash
#=========================================================================
# Title       : project-setup.sh
# Description : This script will create a pulumi project 
# Author      : Karunakaran Veerasamy
# Usage       : ../scripts/project-setup.sh [dev|test|stage|prod|current]
# Example     : ../scripts/project-setup.sh dev
#==========================================================================

ENV=$1

if [[ $ENV != "" && ($ENV == "dev" || $ENV == "test") ]]; then
    echo "Creating a pulumi project..."
else
    echo "Usage: $0 [dev|test]"
    exit 2
fi

source ../scripts/init.sh $ENV

# Create a new Pulumi project using Azure KeyVault Encryption/Secrets provider
pulumi new azure-typescript --secrets-provider=$SECRETS_PROVIDER_URL

mkdir src
mkdir test

mv index.ts src/
sed -i 's/index.ts/src\/index.ts/g' tsconfig.json

# EntryPoint for a project 
echo -e "main: src" >> Pulumi.yaml

# Setup Azure Environment
source ../scripts/config-setup.sh

# Pulumi logout using storage container
pulumi logout --cloud-url azblob://$STORAGE_ACCOUNT_CONTAINER_NAME