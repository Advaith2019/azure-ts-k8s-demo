#!/bin/bash
#=========================================================================
# Title       : vars.sh
# Description : This script will initialize common variables 
# Usage       : ../scripts/vars.sh [dev|test]
# Example     : ../scripts/vars.sh dev
#==========================================================================

ENV=$1

if [[ $ENV != "" && ($ENV == "dev" || $ENV == "test") ]]; then
    echo "Initializing common variables..."
else
    echo "Usage: $0 [dev|test]"
    exit 2
fi

# General
ORG=hi3g
COUNTRY=3se
PULUMI=pulumi
USERNAME=karna

# Environments
UPPERCASE_ENV=`echo $ENV | tr 'a-z' 'A-Z']`

# Azure
AZURE_ENV=public
LOCATION=WestEurope
TENANT_ID=d3d38dff-f85c-4026-842d-c215eb6b3560
INFRA_DEV_SUBSCRIPTION_ID=9b31b157-221f-4439-855f-802897026654

# Pulumi
RESOURCE_GROUP=rg
PULUMI_KEYVAULT_KEY=pulumi-encryption-key

# Storage
PULUMI_STATE="ps"
HI3G_PULUMI_STATE="${ORG}$PULUMI_STATE"

SUBSCRIPTION_ID=$INFRA_DEV_SUBSCRIPTION_ID
SUBSCRIPTION=$ENV
PULUMI_RESOURCE_GROUP="${RESOURCE_GROUP}-${ENV}-${PULUMI}-${USERNAME}-${COUNTRY}"
STORAGE_ACCOUNT_NAME="${HI3G_PULUMI_STATE}${USERNAME}${ENV}${COUNTRY}"
STORAGE_ACCOUNT_CONTAINER_NAME="${PULUMI_STATE}${USERNAME}${ENV}${COUNTRY}"

PULUMI_KEYVAULT_NAME="${ORG}-kv-${ENV}-${USERNAME}-${COUNTRY}"

