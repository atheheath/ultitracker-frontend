#!/bin/bash
LETSENCRYPTFOLDER=$1

if [[ "${LETSENCRYPTFOLDER}" == "" ]]
then
    echo "Pass letsencrypt folder path as first argument"
fi 

VPCRESULT=$(aws ec2 create-vpc --cidr-block 10.0.0.0/16)

VPCID=$(echo ${VPCRESULT} | jq -r '.Vpc.VpcId')

aws ec2 modify-vpc-attribute \
    --vpc-id ${VPCID} \
    --enable-dns-hostnames

IGRESULT=$(aws ec2 create-internet-gateway)
IGID=$(echo ${IGRESULT} | jq -r '.InternetGateway.InternetGatewayId')

aws ec2 attach-internet-gateway \
    --internet-gateway-id ${IGID} \
    --vpc-id ${VPCID}

ROUTETABLERESULT=$(aws ec2 create-route-table --vpc-id "${VPCID}")
ROUTETABLEID=$(echo ${ROUTETABLERESULT} | jq -r '.RouteTable.RouteTableId')

CREATEROUTERESULT=$(aws ec2 create-route \
    --route-table-id ${ROUTETABLEID} \
    --destination-cidr-block 0.0.0.0/0 \
    --gateway-id ${IGID})

SGRESULT=$(aws ec2 create-security-group \
    --vpc-id ${VPCID} \
    --group-name "ultitracker-frontend-eb-instances" \
    --description "Security group for ultitracker-frontend eb instances")

SGID=$(echo ${SGRESULT} | jq -r '.GroupId')

SUBNETRESULT1=$(aws ec2 create-subnet \
    --cidr-block 10.0.1.0/24 \
    --vpc-id "${VPCID}" \
    --availability-zone us-east-1e)

SUBNETRESULT2=$(aws ec2 create-subnet \
    --cidr-block 10.0.2.0/24 \
    --vpc-id "${VPCID}" \
    --availability-zone us-east-1f)

SUBNETID1=$(echo ${SUBNETRESULT1} | jq -r '.Subnet.SubnetId')
SUBNETID2=$(echo ${SUBNETRESULT2} | jq -r '.Subnet.SubnetId')

ASSOCIATERTRESULT1=$(aws ec2 associate-route-table \
    --route-table-id ${ROUTETABLEID} \
    --subnet-id ${SUBNETID1})

ASSOCIATERTRESULT2=$(aws ec2 associate-route-table \
    --route-table-id ${ROUTETABLEID} \
    --subnet-id ${SUBNETID2})

PUBLICIPSUBNETRESULT1=$(aws ec2 modify-subnet-attribute \
    --subnet-id ${SUBNETID1} \
    --map-public-ip-on-launch)

PUBLICIPSUBNETRESULT2=$(aws ec2 modify-subnet-attribute \
    --subnet-id ${SUBNETID2} \
    --map-public-ip-on-launch)


# upload ssl cert to iam
SSLCERTRESULT=$(aws iam upload-server-certificate \
    --server-certificate-name ultitracker.com \
    --certificate-body file://${LETSENCRYPTFOLDER}/live/ultitracker.com/fullchain.pem \
    --private-key file://${LETSENCRYPTFOLDER}/live/ultitracker.com/privkey.pem)

SSLCERTARN=$(echo ${SSLCERTRESULT} | jq -r '.ServerCertificateMetadata.Arn')
