# Voucher interface for Captive Portal

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

