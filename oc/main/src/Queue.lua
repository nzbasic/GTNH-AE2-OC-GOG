-- Create a table to represent the queue
Queue = {}
Queue.__index = Queue

-- Constructor for the queue
function Queue:new()
    local instance = {
        items = {},
        first = 1,
        last = 0
    }
    setmetatable(instance, Queue)
    return instance
end

-- Enqueue operation to add an element to the end of the queue
function Queue:enqueue(item)
    self.last = self.last + 1
    self.items[self.last] = item
end

-- Dequeue operation to remove and return the first element from the queue
function Queue:dequeue()
    if self:isEmpty() then
        return nil, "Queue is empty"
    end
    local item = self.items[self.first]
    self.items[self.first] = nil  -- To allow garbage collection
    self.first = self.first + 1
    return item
end

-- Peek operation to return the first element without removing it
function Queue:peek()
    if self:isEmpty() then
        return nil, "Queue is empty"
    end
    return self.items[self.first]
end

-- Check if the queue is empty
function Queue:isEmpty()
    return self.first > self.last
end

-- Get the size of the queue
function Queue:size()
    return self.last - self.first + 1
end

function Queue:getItems()
    return self.items
end
