-- Tasty foreign key indexes so the inserts delete can cascade in a timely fashion.
CREATE INDEX IF NOT EXISTS idx_items_insert_id ON items (insert_id);

CREATE INDEX IF NOT EXISTS idx_stats_insert_id ON stats (insert_id);

CREATE
OR REPLACE FUNCTION downsample_inserts (
  downsample_interval_seconds INTEGER,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE
) RETURNS void AS $$
BEGIN
    with
    RankedTable as (
      select
        id,
        row_number() over (
          partition by
            cast(
              extract(
                epoch
                from
                  created_at
              ) / downsample_interval_seconds as int
            )
          order by
            created_at
        ) as rn
      from
        inserts
      where
        created_at >= start_time
        and created_at < end_time
  )
DELETE from inserts
USING RankedTable
where RankedTable.id = inserts.id AND RankedTable.rn >= 2;
END;
$$ LANGUAGE plpgsql;

-- Yes this is code duplication, no I don't like it, however merging these functions required nasty dynamic SQL I like even less.
CREATE
OR REPLACE FUNCTION downsample_item_crafting_status (
  downsample_interval_seconds INTEGER,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE
) RETURNS void AS $$
BEGIN
    with
    RankedTable as (
      select
        id,
        row_number() over (
          partition by
            cast(
              extract(
                epoch
                from
                  created_at
              ) / downsample_interval_seconds as int
            )
          order by
            created_at
        ) as rn
      from
        item_crafting_status
      where
        created_at >= start_time
        and created_at < end_time
  )
DELETE from item_crafting_status
USING RankedTable
where RankedTable.id = item_crafting_status.id AND RankedTable.rn >= 2;
END;
$$ LANGUAGE plpgsql;

-- Note that cron.schedule will replace existing jobs of the same name, so you can easily re-run this code to change retention settings
-- Arguments are: interval (in seconds, e.g. 900 = one record per 15 minutes), start time, end time

-- Call for records older than one day (15 minutes interval)
SELECT
  cron.schedule (
    'downsample-inserts-before-today',
    '0 * * * *',
    'SELECT downsample_inserts(900, ''1970-01-01 00:00:00+00'', NOW() - INTERVAL ''1 day'');'
  );

-- Call for records between one day ago and one hour ago (1 minute interval)
SELECT
  cron.schedule (
    'downsample-inserts-day-to-hour',
    '0 * * * *',
    'SELECT downsample_inserts(60, NOW() - INTERVAL ''1 day'', NOW() - INTERVAL ''1 hour'');'
  );

-- Call for records older than one day (15 minutes interval)
SELECT
  cron.schedule (
    'downsample-item-crafting-status-before-today',
    '0 * * * *',
    'SELECT downsample_item_crafting_status(900, ''1970-01-01 00:00:00+00'', NOW() - INTERVAL ''1 day'');'
  );


-- Call for records between one day ago and one hour ago (1 minute interval)
SELECT
  cron.schedule (
    'downsample-item-crafting-status-day-to-hour',
    '0 * * * *',
    'SELECT downsample_item_crafting_status(60, NOW() - INTERVAL ''1 day'', NOW() - INTERVAL ''1 hour'');'
  );

