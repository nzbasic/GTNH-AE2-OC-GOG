local meteors = {
  ["gt.blockmachines-10951"] = 100000000,
  ["gt.metaitem.01-32464"] = 1000000,
  ["tile.machines2-1"] = 1000000001,
  ["gt.blockmachines-1186"] = 80000000,
  ["gt.blockmachines-214"] = 2000000,
  ["end_stone-0"] = 500000,
  ["gt.metaitem.02-30500"] = 420000,
  ["gt.blockmachines-1182"] = 3250000,
  ["gt.metaitem.01-32672"] = 1000000,
  ["gt.metaitem.03-32094"] = 50000000,
  ["gt.metaitem.01-24347"] = 500000,
  ["gt.metaitem.01-32692"] = 500000,
  ["gt.metaitem.01-32680"] = 300000,
  ["nether_star-0"] = 750000,
  ["EMT_GTBLOCK_CASEING-8"] = 90000000,
  ["ItemSanitySoap-0"] = 800000,
  ["gt.blockmachines-10990"] = 44000000,
  ["gt.metaitem.03-32091"] = 25000000,
  ["gt.metaitem.01-32690"] = 300000,
  ["cheeseItem-0"] = 650000,
  ["fish-3"] = 6666666,
  ["gt.blockmachines-463"] = 6000000,
  ["gt.metaitem.01-32682"] = 2000000,
  ["gt.blockmachines-482"] = 1200000,
  ["gt.metaitem.01-32670"] = 600000,
  ["gt.blockmachines-465"] = 2500000,
  ["melon_block-0"] = 123456,
  ["gt.blockmachines-406"] = 10000000,
  ["soul_sand-0"] = 5000000,
  ["gt.metaitem.01-32674"] = 1500000,
  ["tnt-0"] = 775000,
  ["gt.blockmachines-345"] = 12500000,
  ["gt.metaitem.01-32462"] = 500000,
  ["gt.metaitem.01-32463"] = 750000,
  ["item.itemBasicAsteroids-0"] = 1000000,
  ["item.HeavyDutyPlateTier4-0"] = 7500000,
  ["item.HeavyDutyPlateTier5-0"] = 10000000,
  ["item.HeavyDutyPlateTier6-0"] = 15000000,
  ["item.HeavyDutyPlateTier7-0"] = 30000000,
  ["item.HeavyDutyPlateTier8-0"] = 50000000,
  ["gt.blockmachines-12526"] = 125000000,
}

function getMeteorCost(focusName, focusMeta)
    local cleanedFocusName = focusName:match(":(.+)")
    local key = cleanedFocusName .. "-" .. focusMeta

    local cost = meteors[key]
    local crystalCost = 100000

    if cost ~= nil then
        return cost + crystalCost
    else
        return -1
    end
end
