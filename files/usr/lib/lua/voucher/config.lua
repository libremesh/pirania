local uci = require("uci")
local portal_config ='voucher'

ucicursor = uci.cursor()

config = {
    db = ucicursor:get(portal_config, 'base_config', 'db_path'),
    uploadlimit = ucicursor:get(portal_config, 'base_config', 'uploadlimit'),
    downloadlimit = ucicursor:get(portal_config, 'base_config', 'downloadlimit')
}

return config
