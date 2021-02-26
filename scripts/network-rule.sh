#!/bin/bash
#=======================================================================
# Title       : network-rule.sh
# Description : This script will add/remove network rule(s) to be 
#               able to access pulumi stacks.
# Author      : Karunakaran Veerasamy
# Usage       : ../../scripts/network-rule.sh [add|remove] [dev|test|stage|current|prod]
# Example     : ../../scripts/network-rule.sh add dev
#=======================================================================

OPERATION=$1
ENV=$2
EXECUTION_UNIT=$3
IP_ADDRESS_FILE=../scripts/ip-address.txt

if [[ ($OPERATION != "" && ($OPERATION == "add" || $OPERATION == "remove")) && ($ENV != "" && ($ENV == "dev" || $ENV == "test" )) ]]; then
    echo "${OPERATION^} network rule(s)..."
else
    echo "Usage: $0 [add|remove] [dev|test]"
    exit 2
fi

source ../scripts/vars.sh $ENV
        
if [[ $OPERATION == 'add' ]]; then
    PUBLIC_IP=$(wget -qO- http://checkip.amazonaws.com)
    echo "Whitelisting Public IP $PUBLIC_IP" 
    IP_ADDRESS=$PUBLIC_IP
        
    if [[ $EXECUTION_UNIT != 'CircleCI' ]]; then
        touch $IP_ADDRESS_FILE
        echo "$IP_ADDRESS" > $IP_ADDRESS_FILE
    else
        echo "export IP_ADDRESS=$PUBLIC_IP" >> $BASH_ENV
    fi
else
    if [[ $EXECUTION_UNIT != 'CircleCI' ]]; then
        IP_ADDRESS=`cat $IP_ADDRESS_FILE`
        rm $IP_ADDRESS_FILE
    fi
    echo "Removing whitelisted Public IP $IP_ADDRESS" 
fi

az storage account network-rule $OPERATION -g $PULUMI_RESOURCE_GROUP --account-name $STORAGE_ACCOUNT_NAME --ip-address $IP_ADDRESS > /dev/null
az keyvault network-rule $OPERATION -g $PULUMI_RESOURCE_GROUP --name $PULUMI_KEYVAULT_NAME --ip-address "$IP_ADDRESS/32" > /dev/null
