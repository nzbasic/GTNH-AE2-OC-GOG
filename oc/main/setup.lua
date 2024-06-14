-- credit https://github.com/DylanTaylor1/GTNH-Stocking

local shell = require('shell')
local args = {...}
local branch
local repo
local scripts = {
    'Run.lua',
    'env.example.lua',
    'src/Scan.lua',
    'src/AE2.lua',
    'src/Utility.lua',
    'src/Network.lua',
    'src/Queue.lua',
    'src/Machines.lua',
    'src/TPS.lua',
    'lib/json.lua',
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
    repo = 'https://raw.githubusercontent.com/nzbasic/GTNH-AE2-OC-GOG/'
end

local folder = "oc"

-- INSTALL
for i=1, #scripts do
    shell.execute(string.format('wget -f %s%s/%s/%s', repo, branch, folder, scripts[i]))
end
