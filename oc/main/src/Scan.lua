local component = require('component')
local sides = require('sides')
local buffer = component.inventory_controller

require("src.Utility")

function getFilter()
  	local filter = {}
    for i=1,243 do
        local item = buffer.getStackInSlot(sides.up, i)
        if item ~= nil then
            filter[i] = item.label
        else
            break
        end
    end
    return filter
end

function getAuthNames()
	local names = {}
    for i=1,27 do
        local item = buffer.getStackInSlot(sides.south, i)
        if item ~= nil then
            names[i] = item.label
        else
            break
        end
    end
    return names
end
