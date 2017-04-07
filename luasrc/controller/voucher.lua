module("luci.controller.voucher", package.seeall)

local utils = require('voucher.utils')
local config = require('voucher.config')
-- /usr/lib/lua/luci/controller/voucher.lua

function readAll(file)
    local f = io.open(file, "rb")
    local content = f:read("*all")
    f:close()
    return content
end

function print_r (t, name, indent)
    local tableList = {}
    function table_r (t, name, indent, full)
        local id = not full and name
        or type(name)~="number" and tostring(name) or '['..name..']'
        local tag = indent .. id .. ' = '
        local out = {}	-- result
        if type(t) == "table" then
            if tableList[t] ~= nil then table.insert(out, tag .. '{} -- ' .. tableList[t] .. ' (self reference)')
            else
                tableList[t]= full and (full .. '.' .. id) or id
                if next(t) then -- Table not empty
                    table.insert(out, tag .. '{')
                    for key,value in pairs(t) do 
                        table.insert(out,table_r(value,key,indent .. '|  ',tableList[t]))
                    end 
                    table.insert(out,indent .. '}')
                else table.insert(out,tag .. '{}') end
            end
        else 
            local val = type(t)~="number" and type(t)~="boolean" and '"'..tostring(t)..'"' or tostring(t)
            table.insert(out, tag .. val)
        end
        return table.concat(out, '\n')
    end
    return table_r(t,name or 'Value',indent or '')
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
end

local function add_voucher(values_map)
    local key, voucher, expiretime, uploadlimit, downloadlimit, amountofmacsallowed, command

    key = values_map.key
    voucher = values_map.voucher
    expiretime = values_map.expiretime
    uploadlimit = values_map.uploadlimit
    downloadlimit = values_map.downloadlimit
    amountofmacsallowed = values_map.amountofmacsallowed


    command = '/usr/bin/voucher add_voucher '..key..' '..voucher..' '..expiretime..' '..uploadlimit..' '..downloadlimit..' '..amountofmacsallowed
    fd = io.popen(command)
    fd:close()
end

function action_voucher_admin()
    if (luci.http.formvalue('action') == 'add_voucher') then
        add_voucher(luci.http.formvalue())
    end
    luci.template.render("admin_portal/voucher",{
        vouchers=utils.from_csv_to_table(config.db),
        form=print_r(luci.http.formvalue())
    })
end



-- function action_mac_status()
--     luci.http.write(luci.http.source())
--     client_ip="$REMOTE_ADDR"
--     get_client_ip_command = 'arping -q -w 5 -I br-lan -f "$client_ip"'
--     io.popen()
--     get client mac from ip
--     client_mac='cat /proc/net/arp | egrep "^$client_ip \\>" | grep -o ..:..:..:..:..:.. | head -n 1'
--
--     voucher_valid = vale_expire_epoch > now_epoch
--     luci.template.render("voucher",{})
-- end
