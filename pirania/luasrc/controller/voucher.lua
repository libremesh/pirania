module("luci.controller.voucher", package.seeall)

local utils = require('voucher.utils')
local config = require('voucher.config')
local http = require('luci.http')

local debugtools = require('voucher.debugtools')

-- /usr/lib/lua/luci/controller/voucher.lua

function readAll(file)
    local f = io.open(file, "rb")
    local content = f:read("*all")
    f:close()
    return content
end

function index()
    local page, root

    -- Making portal as default
    root = node()
    root.target = alias("portal")
    root.index  = true

    -- Main window with auth enabled
    status = entry({"portal"}, firstchild(), _("Captive Portal"), 9.5)
    status.dependent = false
    status.sysauth = "root"
    status.sysauth_authenticator = "htmlauth"

    -- Rest of entries
    entry({"portal","voucher"}, call("action_voucher_admin"), _("Voucher Admin"), 80).dependent=false

    root = node()
    root.target = alias("pportal")
    root.index  = true
    local auth = entry({"pportal","auth"}, call("action_voucher_auth"))
    auth.dependent = false
end

local function add_voucher(values_map)
    local key, voucher, expiretime, uploadlimit, downloadlimit, amountofmacsallowed, command

    key = values_map.key
    voucher = values_map.voucher
    expiretime = values_map.expiretime
    uploadlimit = values_map.uploadlimit
    downloadlimit = values_map.downloadlimit
    amountofmacsallowed = values_map.amountofmacsallowed


    -- TODO change this to a function call in lua
    command = '/usr/bin/voucher add_voucher '..key..' '..voucher..' '..expiretime..' '..uploadlimit..' '..downloadlimit..' '..amountofmacsallowed
    fd = io.popen(command)
    fd:close()
end

local function get_mac_from_ip(ip)
    local command = 'ping -i 0.2 -w 0.2 -c 1 '..ip..' >/dev/null; cat /proc/net/arp | grep '..ip..' | grep br-lan | awk \'{print $4}\' | head -c -1'
    fd = io.popen(command, 'r')
    local output = fd:read('*all')
    fd:close()
    return output
end

local function auth_voucher(values_map, ip)
    local voucher, mac, command

    voucher = values_map.voucher
    mac = get_mac_from_ip( ip )


    command = '/usr/bin/voucher auth_voucher '..mac..' '..voucher
    fd = io.popen(command, 'r')
    local output = fd:read('*all')
    fd:close()

    command2 = '/usr/bin/captive-portal'
    fd2 = io.popen(command2, 'r')
    local output2 = fd2:read('*all')
    fd2:close()

    return output
end

local function check_voucher(ip)
    local mac, command

    mac = get_mac_from_ip( ip )

    command = '/usr/bin/voucher status '..mac
    fd = io.popen(command, 'r')
    local output = fd:read('*all')
    fd:close()

    return output
end

function action_voucher_admin()
    if (luci.http.formvalue('action') == 'add_voucher') then
        add_voucher(luci.http.formvalue())
    end
    luci.template.render("admin_portal/voucher",{
        vouchers=utils.from_csv_to_table(config.db),
        form=debugtools.print_r(luci.http.formvalue())
    })
end

function action_voucher_auth()
    result = ''
    local ip = string.sub(http.getenv('REMOTE_ADDR'), 8)
    if (luci.http.formvalue('action') == 'auth_voucher') then
        result = auth_voucher(luci.http.formvalue(), ip)
    else
        result = check_voucher(ip)
    end
    local authorized = string.find(result, '0') ~= 1

    luci.template.render("portal/auth_voucher",{
        authorized=authorized,
        result=result,
    })
end
