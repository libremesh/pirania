#!/bin/lua

local dba = require('voucher.db')
local config = require('voucher.config')

logic = {}

local function get_limit_from_rawvoucher(db, rawvoucher)
    local voucher, expiretime, uploadlimit, downloadlimit

    if (rawvoucher ~= nil) then
        voucher = dba.describe_values (db, rawvoucher)
        expiretime = tostring( tonumber( voucher.expiretime ) - os.time())
        uploadlimit = voucher.uploadlimit ~= '0' and voucher.uploadlimit or config.uploadlimit
        downloadlimit = voucher.downloadlimit ~= '0' and voucher.downloadlimit or config.downloadlimit

        return expiretime, uploadlimit, downloadlimit
    end

    return '0', '0', '0'
end

function logic.valid_voucher(db, row)
    return tonumber(dba.describe_values(db, row).expiretime or 0) > os.time()
end

function logic.auth_voucher(db, mac, voucherid)
    local rawvoucher = dba.get_vouchers_by_voucher(db, voucherid)

    return get_limit_from_rawvoucher(db, rawvoucher)
end

function logic.add_voucher(db, key, voucher, epoc, upload, download, amountofmacsallowed)
    local rawvoucher = dba.add_voucher(db, key, voucher, epoc, upload, download, amountofmacsallowed)

    return get_limit_from_rawvoucher(db, rawvoucher)
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
