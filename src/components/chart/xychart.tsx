import { toAEUnit } from '@/util/unit';
import { WithParentSizeProvidedProps, withParentSize } from '@visx/responsive';
import {
    AnimatedAxis, // any of these can be non-animated equivalents
    AnimatedGrid,
    AnimatedLineSeries,
    XYChart,
    Tooltip,
} from '@visx/xychart';
import { DateTime } from 'luxon';
import { useTheme } from 'next-themes';

type Props<T> = {
    data: T[];
    x: (d: T) => number;
    y: (d: T) => number;
    scaleType?: string;
} & WithParentSizeProvidedProps;

function Chart<T extends object>({ data, x, y, parentWidth = 0, parentHeight = 0, scaleType = 'log' }: Props<T>) {
    const { theme } = useTheme();
    const width = parentWidth;
    const height = parentHeight;

    const minDate = Math.min(...data.map(x));
    const maxDate = Math.max(...data.map(x));

    const axisColor = theme === 'dark' ? '#fff' : '#EEEFF2';
    const gridColor = theme === 'dark' ? '#2D3748' : '#EEEFF2';
    const textColor = theme === 'dark' ? '#fff' : '#000';

    return (
        <XYChart
            width={width}
            height={height}
            margin={{ top: 20, bottom: 30, left: 40, right: 20 }}
            xScale={{ type: 'time', domain: [minDate, maxDate] }}
            yScale={{ type: scaleType as 'linear' | 'log' }}
        >
            <AnimatedAxis
                orientation="bottom"
                stroke={axisColor}
                tickLabelProps={{ fill: textColor }}
                tickFormat={(d) => DateTime.fromJSDate(new Date(d)).toFormat('dd/M')}
                numTicks={6}
            />
            <AnimatedGrid columns={false} numTicks={4} lineStyle={{ stroke: gridColor }} />
            <AnimatedAxis
                orientation="left"
                stroke={axisColor}
                tickLabelProps={{ fill: textColor }}
                tickFormat={scaleType === 'linear' ? (d) => toAEUnit(d, 0) : undefined}
            />
            <AnimatedLineSeries stroke="#6466F1" dataKey="Quantity" data={data} xAccessor={x} yAccessor={y} />
            <Tooltip
                snapTooltipToDatumX
                snapTooltipToDatumY
                showVerticalCrosshair
                showSeriesGlyphs
                className="!bg-card !rounded-sm !shadow-sm border !p-0 flex flex-col"
                glyphStyle={{ fill: '#6466F1' }}
                renderTooltip={({ tooltipData }) => (
                    <div className="flex flex-col divide-y dark:text-white">
                        <div className="p-3">
                            {DateTime.fromMillis(x(tooltipData?.nearestDatum?.datum as T)).toFormat('dd/MM hh:mm')}
                        </div>
                        <div className="flex items-center gap-2 p-3">
                            <div className="h-2 w-2 rounded-full bg-[#6466F1]"></div>
                            {toAEUnit(y(tooltipData?.nearestDatum?.datum as T))}
                        </div>
                    </div>
                )}
            />
        </XYChart>
    )
}

export const ChartWithParentSize = withParentSize(Chart);
