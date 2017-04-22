#!/bin/lua

local dba = require('voucher.db')
local config = require('voucher.config')

logic = {}

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
            expiretime = tostring( tonumber( voucher.expiretime ) - os.time())
            uploadlimit = voucher.uploadlimit ~= '0' and voucher.uploadlimit or config.uploadlimit
            downloadlimit = voucher.downloadlimit ~= '0' and voucher.downloadlimit or config.downloadlimit

            return expiretime, uploadlimit, downloadlimit
        end
    end

    return '0', '0', '0'
end

function logic.valid_voucher(db, row)
    return tonumber(dba.describe_values(db, row).expiretime or 0) > os.time()
end

function logic.auth_voucher(db, mac, voucherid)
    local rawvouchers = dba.get_vouchers_by_voucher(db, voucherid)
    if (rawvouchers ~= nil) then
        local voucher = get_valid_rawvoucher(db, rawvouchers)

        if(voucher ~= nil) then
            use_voucher(db, voucher, mac)
        end

        local ret_val = { get_limit_from_rawvoucher(db, voucher) }
        return get_limit_from_rawvoucher(db, voucher)
    end

    return '0', '0', '0'
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
            currentmacs = utils.string_split(dba.describe_values(db, rawvoucher).usedmacs, '+')
            for _, mac in ipairs( currentmacs ) do
                table.insert(macs, mac)
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

    return '0', '0', '0'
end

return logic
