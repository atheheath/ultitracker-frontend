#!/bin/bash
ROOTDIR=$1
OUTFILE=$2

if [[ "${ROOTDIR}" == "" ]]
then
    echo "Please pass root directory as first argument"
    exit 1
fi

if [[ "${OUTFILE}" == "" ]]
then
    echo "Please pass outfile as second argument"
    exit 1
fi

rm ${OUTFILE}
zip -r ${OUTFILE} ${ROOTDIR} -x "**/node_modules/*" "node_modules/*" "**/.git/*" ".git/*" "**/config/*" "config/*"
