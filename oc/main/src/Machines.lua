local component = require("component")

machineNames = {}
machines = {}
for i = 1, 10 do
    machines[i] = {}
end
local currentIndex = 1

function recordMachines()
    local stats = {}
	local time = os.time()
    for address, componentType in component.list() do
       	local proxy = component.proxy(address)

       	if proxy.getStoredEUString ~= nil then
            -- its a gt_machine
            local x, y, z = proxy.getCoordinates()
          	stats[address] = {
            	hasWork = proxy.hasWork(),
                active = proxy.isMachineActive(),
                x = x,
                y = y,
                z = z,
                time = time,
            }

            machineNames[address] = proxy.getName()
       end
    end

     -- Store the stats in the circular buffer
    machines[currentIndex] = stats

    -- Update the current index to the next position, wrapping around if necessary
    currentIndex = currentIndex % 10 + 1
end

function extractNumber(data)
    -- Find the number in the string using a pattern
    local number = data:match("%d[%d,]*")
    -- Remove commas from the number
    local cleanedNumber = number:gsub(",", "")
    return cleanedNumber
end

function getLSC()
    for address, componentType in component.list() do
       local proxy = component.proxy(address)
       if proxy.getSensorInformation ~= nil then
            if proxy.getName() == "multimachine.supercapacitor" then
                local sensor = proxy.getSensorInformation()

                return {
                    eu = extractNumber(sensor[2]),
                    euIn = extractNumber(sensor[10]),
                    euOut = extractNumber(sensor[11]),
                }
            end
       end
    end

    return
end

function printComponents()
    local names = {}
    for address, componentType in component.list() do
       	local proxy = component.proxy(address)
        if proxy.getName ~= nil then
        	names[proxy.getName()] = address
        end
    end
    print(dump(names))
end
