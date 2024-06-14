local robot = require("robot")
local component = require("component")
local sides = require("sides")
local inv = component.inventory_controller
local env = require("env")
local slots = env.slots

require("src.Network")

function summonMeteor()
    -- press button
    robot.turnRight()
    robot.select(slots.empty)
  	robot.use(sides.south)
	robot.turnLeft()

    -- go above altar
	robot.up()
    robot.forward()

    -- drop catalyst
    robot.select(slots.catalyst)
    robot.dropDown(1)

    -- go back
    robot.back()
    robot.down()
end

function checkLP()
    local orb = inv.getStackInInternalSlot(slots.orb)
    local netLp = orb.networkEssence
    local maxNetLp = orb.maxNetworkEssence
    local maxLp = orb.maxEssence

    return netLp, maxNetLp, maxLp
end
