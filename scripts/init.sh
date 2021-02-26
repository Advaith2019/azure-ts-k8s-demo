#!/bin/bash
#=========================================================================
# Title       : init.sh
# Description : This script will set up backend for pulumi state/checkpoint 
#               files that enables user to interact with multipe stacks 
# Author      : Karunakaran Veerasamy
# Usage       : ../../scripts/init.sh [dev|test]
# Example     : ../../scripts/init.sh dev
#==========================================================================

ENV=$1
EXECUTION_UNIT=$2

if [[ $ENV != "" && ($ENV == "dev" || $ENV == "test") ]]; then
    echo "Initializing pulumi backend..."
else
    echo "Usage: $0 [dev|test]"
    exit 2
fi

source ../scripts/vars.sh $ENV

# Service Principal
if [[ $EXECUTION_UNIT == "CircleCI" ]]; then
    SP_USERNAME=${AZURE_SP}
    SP_PWD=${AZURE_SP_PASSWORD}
    SP_APP_ID=${AZURE_SP_APP_ID}
else 
    SP_USERNAME=$(cat ../scripts/sp.json | jq -r .name)
    SP_PWD=$(cat ../scripts/sp.json | jq -r .password)
    SP_APP_ID=$(cat ../scripts/sp.json | jq -r .appId)
fi

# Login to Azure using a Service Principal
az login --service-principal -u $SP_USERNAME -p $SP_PWD --tenant $TENANT_ID 

# Set subscription
az account set --subscription $SUBSCRIPTION_ID

# Set environment variables to be able to do pulumi login using -cloud-url
KEYS=$(az storage account keys list --account-name $STORAGE_ACCOUNT_NAME --resource-group $PULUMI_RESOURCE_GROUP --output json)

if [[ $EXECUTION_UNIT != "CircleCI" ]]; then
    export AZURE_STORAGE_ACCOUNT=$STORAGE_ACCOUNT_NAME 
    export AZURE_STORAGE_KEY=$(echo $KEYS | jq -r .[0].value)
    export AZURE_KEYVAULT_AUTH_VIA_CLI=true
    export AZURE_SP_PWD=$SP_PWD
else 
    echo "export AZURE_STORAGE_ACCOUNT=$STORAGE_ACCOUNT_NAME" >> $BASH_ENV
    echo "export AZURE_STORAGE_KEY=$(echo $KEYS | jq -r .[0].value)" >> $BASH_ENV
    echo "export AZURE_KEYVAULT_AUTH_VIA_CLI=true" >> $BASH_ENV
    echo "export AZURE_SP_PWD=$SP_PWD" >> $BASH_ENV
fi

SECRETS_PROVIDER_URL=azurekeyvault://$PULUMI_KEYVAULT_NAME.vault.azure.net/keys/${PULUMI_KEYVAULT_KEY}

if [[ $EXECUTION_UNIT != "CircleCI" ]]; then
    #  Pulumi login using storage container
    pulumi login --cloud-url azblob://$STORAGE_ACCOUNT_CONTAINER_NAME
fi