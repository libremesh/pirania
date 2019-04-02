# Voucher interface for Captive Portal

ALPHA Software, don't use in production.

![PITBULL](https://j.gifs.com/X6vnX8.gif)

This tool allows an administrator to manage a voucher system to get through the gateway.

It could be used in a community that wants to share an Internet connection and for that the user's pay a fraction each, but needs the payment from everyone. So the vouchers allows to control the payments via the control of the access to Internet.

## Features

This are the currently implemented features:
  * Runs directly from the OpenWRT/LEDE router: no need for extra hardware
  * Integrates it's administration with LuCI
  * Has a command-line interface

We have planned:
  * Support for collaborative administration between multiple captive portals on the same network (multiple gateways)
  * batch creation of vouchers
  * accountability
  * activity log

All planned features are accesible at: https://github.com/libremesh/voucher/issues

## Prerequisites

This software assumes that will be running on a OpenWRT/LEDE distribution (because uses uci for config), and requires a captive portal with whom to talk to.

For now it is compatible just with Nodogsplash, but adding compatibility with others is on our roadmap.

## Install

Not clear yet, but would be something like:
  * add the libremesh software feed to opkg
  * opkg install <captive portal>
  * opkg install voucher

# How it works

It uses iptables rules to filter inbound connections outside the mesh network.

## General overview of file hierarchy and function

```
files/
     /etc/config/voucher is the UCI config
     /etc/voucher/db.csv (default path) contains the database of vouchers
     /usr/lib/lua/voucher/ contains lua libraries used by /usr/bin/voucher
     /usr/bin/voucher is a CLI to manage the db (has functions add_voucher, auth_voucher, get_valid_macs, etc)
     /usr/bin/captive-portal sets up iptables rules to capture traffic
     /etc/init.d/pitbull-uhttpd starts a uhttpd on port 2055 that replies any request with a redirect towards a preset URL

     /usr/libexec/rpcd/lime-voucher ubus pitbull API (this is used by the web frontend)
     /usr/share/rpcd/acl.d/voucher.json ACL for the ubus pitbull API

luasrc/ contains the luci-app to manage vouchers
```

# TODO

## Basic

  * Migrate interface from LuCi to LiMe-App
    * Migrate API to ubus
  * Add config sharing through mesh
  * Schedule a regular update of the rules

## Secondary

  * Remove unnecesary compatibility with nodogsplash
  * Add a config file so allowed/restricted ip ranges can be parametrized (ips reachable by abundant connections vs through scarse/costly ones)
  * Tune the rule apply script so it doesn't have to renew all rules each time, but just do the small change related to what happend (like add a new mac, remove a mac)


