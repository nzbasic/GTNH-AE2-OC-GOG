-- credit https://github.com/DylanTaylor1/GTNH-Stocking

local shell = require('shell')
local args = {...}
local branch
local repo
local scripts = {
    'Run.lua',
    'env.example.lua',
    'src/Scan.lua',
    'src/FetchAndEncodeAE2Contents.lua',
    'src/Utility.lua',
    'src/Network.lua',
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

-- INSTALL
for i=1, #scripts do
    shell.execute(string.format('wget -f %s%s/%s', repo, branch, scripts[i]))
end
