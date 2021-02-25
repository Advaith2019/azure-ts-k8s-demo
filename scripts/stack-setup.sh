#!/bin/bash
#=========================================================================
# Title       : stack-setup.sh
# Description : This script will create a pulumi project 
# Usage       : ../scripts/stack-setup.sh [dev|test]
# Example     : ../scripts/stack-setup.sh dev
#==========================================================================

ENV=$1

if [[ $ENV != "" && ($ENV == 'dev' || $ENV == 'test') ]]; then
    echo "Creating a pulumi stack..."
else
    echo "Usage: $0 [dev|test]"
    exit 2
fi

source ../scripts/init.sh $ENV

# Create a new Pulumi project using Azure KeyVault Encryption/Secrets provider
pulumi stack init --secrets-provider=$SECRETS_PROVIDER_URL

source ../scripts/config-setup.sh

# Pulumi logout using storage container
pulumi logout --cloud-url azblob://$STORAGE_ACCOUNT_CONTAINER_NAME