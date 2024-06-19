import React, { useCallback, useMemo } from "react";
import { Group } from "@visx/group";
import { curveBasis } from "@visx/curve";
import { Line, LinePath } from "@visx/shape";
import { Threshold } from "@visx/threshold";
import { scaleTime, scaleLinear } from "@visx/scale";
import { AxisLeft, AxisBottom } from "@visx/axis";
import { GridRows, GridColumns } from "@visx/grid";
import { WithParentSizeProvidedProps, withParentSize } from '@visx/responsive';
import { Stats } from "@/types/supabase";
import { toPowerUnit } from "@/util/unit";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { TooltipWithBounds, withTooltip } from "@visx/tooltip";
import { localPoint } from '@visx/event';
import { bisector } from '@visx/vendor/d3-array';
import { DateTime } from "luxon";

export const background = "transparent";

const defaultMargin = { top: 30, right: 30, bottom: 40, left: 65 };

const pathYCache: Record<string, number> = {};

export default function getPathYFromX(x: any, path: any, name: any, error: any) {
    const key = `${name}-${x}`;

    if (key in pathYCache) {
        return pathYCache[key];
    }

    error = error || 0.01;

    const maxIterations = 100;

    let lengthStart = 0;
    let lengthEnd = path.getTotalLength();
    let point = path.getPointAtLength((lengthEnd + lengthStart) / 2);
    let iterations = 0;

    while (x < point.x - error || x > point.x + error) {
        const midpoint = (lengthStart + lengthEnd) / 2;

        point = path.getPointAtLength(midpoint);

        if (x < point.x) {
            lengthEnd = midpoint;
        } else {
            lengthStart = midpoint;
        }

        iterations += 1;
        if (maxIterations < iterations) {
            break;
        }
    }

    pathYCache[key] = point.y

    return pathYCache[key]
}

export type ThresholdProps = {
    data: Stats[];
    margin?: { top: number; right: number; bottom: number; left: number };
} & WithParentSizeProvidedProps

// accessors
const date = (d: Stats) => new Date(d.created_at).valueOf();
const euIn = (d: Stats) => Number(d.euIn);
const euOut = (d: Stats) => Number(d.euOut);

type TooltipData = Stats

const ThresholdWithTooltip = withTooltip<ThresholdProps, TooltipData>(({
    data,
    parentWidth,
    parentHeight,
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipTop = 0,
    tooltipLeft = 0,
    margin = defaultMargin,
}) => {
    const lineRef = React.useRef<SVGPathElement>(null);
    const width = parentWidth || 0;
    const height = parentHeight || 0;

    const { theme } = useTheme()

    if (width < 10 || height < 10) return null;

    // scales
    const timeScale = useMemo(() => scaleTime<number>({
        domain: [
            Math.min(...data.map(date)),
            Math.max(...data.map(date)),
        ],
    }), [data]);

    const euScale = useMemo(() => scaleLinear<number>({
        domain: [
            Math.min(...data.map((d) => Math.min(euIn(d), euOut(d)))),
            Math.max(...data.map((d) => Math.max(euIn(d), euOut(d)))),
        ],
        nice: true,
    }), [data]);

    const { xMax, yMax } = useMemo(() => {
        // bounds
        const xMax = width - margin.left - margin.right;
        const yMax = height - margin.top - margin.bottom;

        timeScale.range([0, xMax]);
        euScale.range([yMax, 0]);

        return { xMax, yMax }
    }, [width, height, theme, timeScale, euScale]);

    const handleTooltip = useCallback((event: React.TouchEvent<SVGGElement> | React.MouseEvent<SVGGElement>) => {
        const { x } = localPoint(event) || { x: 0 };
        const x0 = timeScale.invert(x - margin.left);
        const bisectDate = bisector<Stats, Date>((d) => new Date(d.created_at).valueOf()).left;
        const index = bisectDate(data, x0, 1);
        const d0 = data[index - 1];
        const d1 = data[index];
        let d = d0;
        if (d1 && date(d1)) {
            d = x0.valueOf() - date(d0).valueOf() > date(d1).valueOf() - x0.valueOf() ? d1 : d0;
        }

        const line = lineRef.current;
        if (!line) return;

        const y = getPathYFromX(x - margin.left, line, 'threshold', 1);

        showTooltip({
            tooltipData: d,
            tooltipLeft: x,
            tooltipTop: y + margin.top,
        });
    }, [showTooltip, euScale, timeScale, data]);

    return (
        <div className="relative">
            <svg
                width={width}
                height={height}
            >
                <rect
                    x={0}
                    y={0}
                    width={width}
                    height={height}
                    fill={background}
                    rx={14}
                />
                <Group
                    left={margin.left}
                    top={margin.top}
                >
                    <MemoThreshold
                        ref={lineRef}
                        data={data}
                        xMax={xMax}
                        yMax={yMax}
                        width={width}
                        height={height}
                        timeScale={timeScale}
                        euScale={euScale}
                        theme={theme}
                    />

                    <rect
                        width={xMax}
                        height={yMax}
                        onTouchStart={handleTooltip}
                        onTouchMove={handleTooltip}
                        onMouseMove={handleTooltip}
                        onMouseLeave={() => hideTooltip()}
                        fill="transparent"
                    />
                </Group>

                {tooltipData && (
                    <g>
                        <Line
                            from={{ x: tooltipLeft, y: margin.top }}
                            to={{ x: tooltipLeft, y: yMax + margin.top }}
                            stroke="red"
                            strokeWidth={2}
                            pointerEvents="none"
                            strokeDasharray="5,2"
                        />
                        <circle
                            cx={tooltipLeft}
                            cy={(tooltipTop ?? 0) + 1}
                            r={4}
                            fill="black"
                            fillOpacity={0.1}
                            stroke="black"
                            strokeOpacity={0.1}
                            strokeWidth={2}
                            pointerEvents="none"
                        />
                        <circle
                            cx={tooltipLeft}
                            cy={tooltipTop}
                            r={4}
                            fill="red"
                            stroke="white"
                            strokeWidth={2}
                            pointerEvents="none"
                        />
                    </g>
                )}
            </svg>

            {tooltipData && (
                <div>
                    <TooltipWithBounds
                        key={Math.random()}
                        top={(tooltipTop ?? 0) - 12}
                        left={(tooltipLeft ?? 0) + 12}
                        className="!bg-card border !rounded-sm !shadow-sm !p-0 min-w-32"
                    >
                        <div className="flex flex-col divide-y">
                            <p className="p-3 dark:text-white">{DateTime.fromMillis(date(tooltipData)).toFormat('dd/MM hh:mm')}</p>
                            <div className="flex flex-col gap-2 p-3">
                                <p className="text-red-500">-{toPowerUnit(euOut(tooltipData))} EU/t</p>
                                <p className="text-green-500">+{toPowerUnit(euIn(tooltipData))} EU/t</p>
                                <p className="dark:text-white">{toPowerUnit(tooltipData.euDiff)} EU/t</p>
                            </div>
                        </div>
                    </TooltipWithBounds>
                </div>
            )}
        </div>
    );
});

type InnerProps = {
    euScale: ReturnType<typeof scaleLinear<number>>;
    timeScale: ReturnType<typeof scaleTime<number>>;
    xMax: number;
    yMax: number;
    width: number;
    height: number;
    data: Stats[];
    theme: string | undefined;
}

const MemoThreshold = React.memo(React.forwardRef<SVGPathElement, InnerProps>((props, ref) => {
    const { euScale, xMax, yMax, timeScale, width, height, data, theme } = props;

    const gridStroke = cn({ 'white': theme === 'dark', '#d1d5db': theme === 'light' })
    const gridOpacity = cn({ 0.25: theme === 'dark', 1: theme === 'light' })
    const textFill = cn({ 'white': theme === 'dark', 'black': theme === 'light' })
    const inStroke = cn({ '#22C55D': theme === 'dark', '#87EFAC': theme === 'light' })
    const outStroke = '#EF4444'

    return (
        <>
            <GridRows
                scale={euScale}
                width={xMax}
                height={yMax}
                stroke={gridStroke}
                strokeOpacity={gridOpacity}
            />
            <GridColumns
                scale={timeScale}
                width={xMax}
                height={yMax}
                stroke={gridStroke}
                strokeOpacity={gridOpacity}
            />
            <line
                x1={xMax}
                x2={xMax}
                y1={0}
                y2={yMax}
                stroke={gridStroke}
                strokeOpacity={gridOpacity}
            />
            <AxisBottom
                top={yMax}
                scale={timeScale}
                numTicks={width > 520 ? 10 : 5}
                stroke={gridStroke}
                tickStroke={gridStroke}
                tickLabelProps={{ fill: textFill }}
            />
            <AxisLeft
                scale={euScale}
                tickFormat={t => toPowerUnit(t.valueOf())}
                stroke={gridStroke}
                tickStroke={gridStroke}
                tickLabelProps={{ fill: textFill }}
            />

            <Threshold<Stats>
                id={`${Math.random()}`}
                data={data}
                x={(d) => timeScale(date(d)) ?? 0}
                y0={(d) => euScale(euIn(d)) ?? 0}
                y1={(d) => euScale(euOut(d)) ?? 0}
                clipAboveTo={0}
                clipBelowTo={yMax}
                curve={curveBasis}
                belowAreaProps={{
                    fill: outStroke,
                    fillOpacity: 0.5,
                }}
                aboveAreaProps={{
                    fill: inStroke,
                    fillOpacity: 0.2,
                }}
            />
            <LinePath
                data={data}
                curve={curveBasis}
                x={(d) => timeScale(date(d)) ?? 0}
                y={(d) => euScale(euIn(d)) ?? 0}
                stroke={inStroke}
                strokeWidth={2}
                strokeOpacity={1}
            />
            <LinePath
                data={data}
                curve={curveBasis}
                x={(d) => timeScale(date(d)) ?? 0}
                y={(d) => euScale(euOut(d)) ?? 0}
                stroke={outStroke}
                strokeWidth={1.5}
                innerRef={ref}
            />
        </>
    )
}));

export const ThresholdWithParentSize = withParentSize(ThresholdWithTooltip);
