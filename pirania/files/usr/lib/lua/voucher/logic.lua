#!/bin/lua

local dba = require('voucher.db')
local config = require('voucher.config')

logic = {}

local function shell(command)
    local handle = io.popen(command)
    local result = handle:read("*a")
    handle:close()
    return result
end

local function isMac(string)
    local string = string:match("%w+:%w+:%w+:%w+:%w+:%w")
    if string then
       return true
    else
       return false
    end
end


local function dateNow()
    local output = shell('date +%s000')
    local parsed = string.gsub(output, "%s+", "")
    local dateNow = tonumber(parsed)
    return dateNow
end



local function use_voucher(db, voucher, mac)
    macs = voucher[7]

    if (string.find(macs, mac) == nil) then
        if (macs == '') then
            voucher[7] = mac
        else
            voucher[7] = macs .. '+' .. mac
        end
    end
end

local function get_valid_rawvoucher(db, rawvouchers)
    local voucher, expiretime, uploadlimit, downloadlimit

    for _, rawvoucher in ipairs( rawvouchers ) do
        if (logic.valid_voucher(db, rawvoucher)) then
            return rawvoucher
        end
    end

    return
end

local function get_limit_from_rawvoucher(db, rawvoucher)
    local voucher, expiretime, uploadlimit, downloadlimit

    if (rawvoucher ~= nil) then
        voucher = dba.describe_values (db, rawvoucher)

        if tonumber(voucher.expiretime) ~= nil then
            expiretime = tostring( tonumber( voucher.expiretime ) - dateNow())
            uploadlimit = voucher.uploadlimit ~= '0' and voucher.uploadlimit or config.uploadlimit
            downloadlimit = voucher.downloadlimit ~= '0' and voucher.downloadlimit or config.downloadlimit
            currentmacs = table.getn(utils.string_split(voucher.usedmacs, '+'))
            valid = currentmacs < tonumber(voucher.amountofmacsallowed) and '1' or '0'
            return expiretime, uploadlimit, downloadlimit, valid
        end
    end

    return '0', '0', '0', '0'
end

function logic.valid_voucher(db, row)
    local expireDate = tonumber(dba.describe_values(db, row).expiretime) or 0
    if (expireDate ~= nil) then
        return expireDate > dateNow()
    end
end

function logic.auth_voucher(db, mac, voucherid)
    local rawvouchers = dba.get_vouchers_by_voucher(db, voucherid)
    if (rawvouchers ~= nil) then
        local voucher = get_valid_rawvoucher(db, rawvouchers)
        local expiretime, uploadlimit, downloadlimit, valid = get_limit_from_rawvoucher(db, voucher)
        if(voucher ~= nil and valid == '1') then
            use_voucher(db, voucher, mac)
        end

        return expiretime, uploadlimit, downloadlimit, valid
    end

    return '0', '0', '0', '0'
end

function logic.add_voucher(db, key, voucher, epoc, upload, download, amountofmacsallowed)
    local rawvoucher = dba.add_voucher(db, key, voucher, epoc, upload, download, amountofmacsallowed)

    return get_limit_from_rawvoucher(db, rawvoucher)
end

function logic.valid_macs(db)
    local rawvouchers, rawvoucher, macs, currentmacs
    macs = {}
    rawvouchers = dba.get_all_vouchers(db)

    for _, rawvoucher in ipairs( rawvouchers ) do
        if logic.valid_voucher(db, rawvoucher) then
            local voucher = dba.describe_values(db, rawvoucher)
            currentmacs = utils.string_split(voucher.usedmacs, '+')
            for _, mac in ipairs( currentmacs ) do
                if (_ <=  tonumber(voucher.amountofmacsallowed) and isMac(mac)) then
                    table.insert(macs, mac)
                end
            end
        end
    end

    return macs
end

function logic.status(db, mac)
    local rawvouchers, rawvoucher
    rawvouchers = dba.get_vouchers_by_mac(db, mac)

    for _, rawvoucher in ipairs( rawvouchers ) do
        if logic.valid_voucher(db, rawvoucher) then
            return get_limit_from_rawvoucher(db, rawvoucher)
        end
    end

    return '0', '0', '0', '0'
end

return logic
