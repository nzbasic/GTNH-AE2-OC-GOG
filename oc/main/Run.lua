require("src.Network")
require("src.Utility")
require("src.AE2")
require("src.Scan")
require("src.Queue")
require("src.Machines")
require("src.TPS")

function sendStats()
	sendToServer({ network = getNetworkStats(), lsc = getLSC(), tps = getTPS() }, "stats")
    -- sendToServer(getAuthNames(), "auth")
    -- sendToServer({ machines = machines, names = machineNames }, "machines")
   	sendToServer(getItemsInNetwork(), "items")
end

local event = require("event")

event.timer(15, sendStats, math.huge)

while true do
    e = event.pull();
    if e == "interrupted" then break; end;
end;
