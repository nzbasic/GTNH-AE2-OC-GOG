require("src.Network")
require("src.Utility")
require("src.FetchAndEncodeAE2Contents")
local c = require("computer")

function gatherItems()
	sendToServer(getItemsInNetwork(), "items")
end

function gatherStats() 
	sendToServer(getNetworkStats(), "stats")
end

i = 0
while true do 
    if (i - 5) % 10 == 0 then
        gatherStats()
        print(c.freeMemory())
    end

    if i % 30 == 0 then
        gatherItems()
    end

    if i >= 60 then
        i = 0
    end

    os.sleep(1)
    i = i + 1
end