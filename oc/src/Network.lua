-- credit: https://github.com/Niels1006/OC-AE2-integration

component = require("component")
json = require("lib.json")
utility = require("src.Utility")
internet = component.internet

local env = require("env")

function sendToServer(table_, route)
    local uri = env.serverUrl .. "/api/" .. route
 	local headers = {["Content-Type"] = "application/json", ["X-Secret"] = env.secret }
    local req = internet.request(uri, json.encode(table_), headers, "POST")

    req.finishConnect()
end
