local component = require('component')
local sides = require('sides')
local robot = require("robot")
local inv = component.inventory_controller

require("src.Utility")
local env = require("env")
local slots = env.slots

function baseToChest()
    robot.turnAround()
    robot.up()
    robot.forward()
end

function chestToBase()
    robot.turnAround()
    robot.forward()
    robot.down()
end

function getCatalystInfo()
    local catalyst = inv.getStackInInternalSlot(slots.catalyst)

    if catalyst ~= nil then
        return {
            focusName = catalyst.name,
            focusMeta = catalyst.damage,
            slot = i,
            manual = catalyst.label:find("^Manual") ~= nil
        }
   	end

    return nil
end

function getNextCatalyst(previousIndex)
    baseToChest()
    local catalysts = {}

    for i = 1, inv.getInventorySize(sides.down) do
        local item = inv.getStackInSlot(sides.down, i)
        if item ~= nil then
            local catalyst = {
                focusName = item.name,
                focusMeta = item.damage,
                slot = i,
                manual = item.label:find("^Manual") ~= nil
            }

            if catalyst.manual then
                retrieveCatalyst(i)
                chestToBase()
                return catalyst, i
            end

            catalysts[i] = catalyst
        end
    end

    -- Rotate through the catalysts
    local nextIndex
    if #catalysts > 0 then
        if previousIndex == nil or previousIndex >= #catalysts then
            nextIndex = 1
        else
            nextIndex = previousIndex + 1
        end
    else
        nextIndex = nil
    end

    retrieveCatalyst(nextIndex)
    chestToBase()
    return catalysts[nextIndex], nextIndex
end

function retrieveCatalyst(slot)
    robot.select(slots.catalyst)
    local count = robot.count()

    if (count ~= 0) then
        print("I am already carrying a catalyst, putting it back")
        local catalyst = inv.getStackInInternalSlot(slots.catalyst)
        for i = 1, inv.getInventorySize(sides.down) do
            local item = inv.getStackInSlot(sides.down, i)

            if item == nil then
            	inv.dropIntoSlot(sides.down, i)
                break
            else
                if item.label == catalyst.label and item.damage == catalyst.damage and item.name == catalyst.name then
                   	local size = item.size
            		local maxSize = item.maxSize

                    if size < maxSize then
                        inv.dropIntoSlot(sides.down, i)
                        break;
                    end
                end
            end
        end
    end

    inv.suckFromSlot(sides.down, slot, 1)
    return true
end
