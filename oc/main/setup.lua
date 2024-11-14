-- credit https://github.com/DylanTaylor1/GTNH-Stocking

local shell = require('shell')
local args = {...}
local branch
local repo
local scripts = {
    'main/Run.lua',
    'main/env.example.lua',
    'main/src/Scan.lua',
    'main/src/AE2.lua',
    'main/src/Utility.lua',
    'main/src/Network.lua',
    'main/src/Queue.lua',
    'main/src/Machines.lua',
    'main/src/TPS.lua',
    'main/lib/json.lua',
}

-- BRANCH
if #args >= 1 then
    branch = args[1]
else
    branch = 'main'
end

-- REPO
if #args >= 2 then
    repo = args[2]
else
    repo = 'https://raw.githubusercontent.com/nzbasic/GTNH-AE2-OC-GOG/blob/'
end

local folder = "oc"

-- INSTALL
for i=1, #scripts do
    shell.execute(string.format('wget -f %s%s/%s/%s', repo, branch, folder, scripts[i]))
end
