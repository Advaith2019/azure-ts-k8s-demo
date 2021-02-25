#!/bin/bash
#=======================================================================
# Title       : config-setup.sh
# Description : This script will configure azure environment 
#               so pulumi can authenticate itself to azure.
# Usage       : ../scripts/config-setup.sh [dev|test|stage|current|prod|blue]
# Example     : ../scripts/config-setup.sh test
#=======================================================================

ENV=$1

if [[ $ENV != "" && ($ENV == "dev" || $ENV == "test") ]]; then
    echo "Configuring azure..."
else
    echo "Usage: $0 [dev|test]"
    exit 2
fi

source ../scripts/vars.sh $1

pulumi config set azure:location $LOCATION
pulumi config set azure:environment $AZURE_ENV
pulumi config set azure:clientId $SP_APP_ID
pulumi config set azure:clientSecret $SP_PWD --secret
pulumi config set azure:tenantId $TENANT_ID
pulumi config set azure:subscriptionId $SUBSCRIPTION_ID