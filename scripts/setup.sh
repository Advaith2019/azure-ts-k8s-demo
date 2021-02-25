#!/bin/bash
#=========================================================================
# Title       : setup.sh
# Description : This script will set up a pulumi backend and keep azure
#               resources ready for that matter
# Usage       : ../scripts/setup.sh [dev|test|stage|current|prod|blue]
# Example     : ../scripts/setup.sh dev
#==========================================================================

ENV=$1

if [[ $ENV != "" && ($ENV == "dev" || $ENV == "test") ]]; then
    echo "Setting up a pulumi backend..."
else
    echo "Usage: $0 [dev|test]"
    exit 2
fi

source ../scripts/vars.sh $ENV

az login --tenant $TENANT_ID 
# Set subscription
az account set --subscription $SUBSCRIPTION_ID

az group create --name $PULUMI_RESOURCE_GROUP --location $LOCATION --tags "Environment=Spoke"

IP_ADDRESS=$(wget -qO- http://checkip.amazonaws.com)

# Create storage account and a container to hold the Pulumi state
# Storage Account
echo "Creating storage account '$STORAGE_ACCOUNT_NAME' for environment '$ENV'"
az storage account create --name $STORAGE_ACCOUNT_NAME --resource-group $PULUMI_RESOURCE_GROUP --location $LOCATION --sku Standard_LRS --access-tier Hot --https-only true --kind StorageV2
az storage account network-rule add -g $PULUMI_RESOURCE_GROUP --account-name $STORAGE_ACCOUNT_NAME --ip-address $IP_ADDRESS > /dev/null

KEYS=$(az storage account keys list --account-name $STORAGE_ACCOUNT_NAME --resource-group $PULUMI_RESOURCE_GROUP --output json)
export AZURE_STORAGE_ACCOUNT=$STORAGE_ACCOUNT_NAME
export AZURE_STORAGE_KEY=$(echo $KEYS | jq -r .[0].value)

# Storage Container
echo "Creating storage container '$STORAGE_ACCOUNT_CONTAINER_NAME' for environment '$ENV'"
az storage container create --name $STORAGE_ACCOUNT_CONTAINER_NAME

SP_APP_ID=$(cat ../scripts/sp.json | jq -r .appId)

az keyvault create --location $LOCATION --name $PULUMI_KEYVAULT_NAME --resource-group $PULUMI_RESOURCE_GROUP
az keyvault set-policy --name $PULUMI_KEYVAULT_NAME --resource-group $PULUMI_RESOURCE_GROUP \
    --object-id `az ad sp show --id ${SP_APP_ID} | jq -r .objectId` --key-permissions backup create decrypt delete encrypt get import list purge recover restore sign unwrapKey update verify wrapKey
az keyvault key create --vault-name $PULUMI_KEYVAULT_NAME --name $PULUMI_KEYVAULT_KEY
az keyvault network-rule add -g $PULUMI_RESOURCE_GROUP --name $PULUMI_KEYVAULT_NAME --ip-address "$IP_ADDRESS/32" > /dev/null
az keyvault update -g $PULUMI_RESOURCE_GROUP --name $PULUMI_KEYVAULT_NAME --default-action Deny > /dev/null 
az keyvault delete-policy --name $PULUMI_KEYVAULT_NAME --resource-group $PULUMI_RESOURCE_GROUP --object-id `az ad signed-in-user show --query objectId --output tsv`

az logout