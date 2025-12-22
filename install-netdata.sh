#!/bin/bash
set -e

echo "Installing Netdata..."

curl -s https://my-netdata.io/kickstart.sh | bash -s -- --non-interactive

systemctl enable netdata
systemctl start netdata

echo "Netdata is running on port 19999"
