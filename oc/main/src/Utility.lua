function dump(o, depth)
    if depth == nil then depth = 0 end

    if depth > 10 then return "..." end

    if type(o) == 'table' then
        local s = '{ '
        for k, v in pairs(o) do
            if type(k) ~= 'number' then k = '"' .. k .. '"' end
            s = s .. '[' .. k .. '] = ' .. dump(v, depth + 1) .. ',\n'
        end
        return s .. '} '
    else
        return tostring(o)
    end
end
