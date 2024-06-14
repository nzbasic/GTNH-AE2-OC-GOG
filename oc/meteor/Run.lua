local robot = require("robot")
local env = require("env")

require("src.Storage")
require("src.BM")
require("src.Utility")
require("src.Meteors")

local slots = env.slots

local nextCatalyst, slot = nil, 0
while true do
    robot.select(slots.catalyst)
    local count = robot.count()

    if count == 0 then
        print("I am not holding a catalyst, searching... last slot " .. slot)
        nextCatalyst, slot = getNextCatalyst(slot)
        print("Got a catalyst from slot " .. slot)
    else
        print("I am already holding a catalyst, previous slot has been set to " .. slot)
        nextCatalyst = getCatalystInfo()
        slot = 1
    end

    if nextCatalyst == nil then
        print("Didn't find a catalyst")
    else
        local cost = getMeteorCost(nextCatalyst.focusName, nextCatalyst.focusMeta)
        local lp, maxNetLp, maxLp = checkLP()
        print("Next up: " .. nextCatalyst.focusName .. " from slot " .. slot)
        print("Cost = " .. cost .. "LP. We have " .. lp .. "LP")
        -- todo check maxLp

        while lp < cost do
            print(lp .. "/" .. cost .. "Waiting 10 seconds for LP...")
            os.sleep(10)
            lp = checkLP()
        end

        summonMeteor()
        print("Summoning meteor!")
    end

    print("Sleeping for " .. env.timeBetween .. " seconds")
    os.sleep(env.timeBetween)
end
