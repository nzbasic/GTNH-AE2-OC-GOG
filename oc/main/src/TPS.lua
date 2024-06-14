local component = require("component")
local tps_card = component.tps_card

function getTPS()
	local mspt = tps_card.getOverallTickTime()
    local tps = tps_card.convertTickTimeIntoTps(mspt)

    print("MSPT: " .. mspt, "TPS: " .. tps)

    return { mspt = mspt, tps = tps }
end
