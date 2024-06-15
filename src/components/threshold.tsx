import React from "react";
import { Group } from "@visx/group";
import { curveBasis } from "@visx/curve";
import { LinePath } from "@visx/shape";
import { Threshold } from "@visx/threshold";
import { scaleTime, scaleLinear, scaleOrdinal } from "@visx/scale";
import { AxisLeft, AxisBottom } from "@visx/axis";
import { GridRows, GridColumns } from "@visx/grid";
import { WithParentSizeProvidedProps, withParentSize } from '@visx/responsive';
import { Stats } from "@/types/supabase";
import { toPowerUnit } from "@/util/unit";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export const background = "transparent";

const defaultMargin = { top: 30, right: 30, bottom: 40, left: 65 };

export type ThresholdProps = {
    data: Stats[];
    margin?: { top: number; right: number; bottom: number; left: number };
} & WithParentSizeProvidedProps

export default function Theshold({
    data,
    parentWidth = 0,
    parentHeight = 0,
    margin = defaultMargin,
}: ThresholdProps) {
    const { theme } = useTheme()

    const width = parentWidth;
    const height = parentHeight;

    if (width < 10) return null;

    // bounds
    const xMax = width - margin.left - margin.right;
    const yMax = height - margin.top - margin.bottom;

    // accessors
    const date = (d: Stats) => new Date(d.created_at).valueOf();
    const euIn = (d: Stats) => Number(d.euIn);
    const euOut = (d: Stats) => Number(d.euOut);

    // scales
    const timeScale = scaleTime<number>({
        domain: [
            Math.min(...data.map(date)),
            Math.max(...data.map(date)),
        ],
    });

    const euScale = scaleLinear<number>({
        domain: [
            Math.min(...data.map((d) => Math.min(euIn(d), euOut(d)))),
            Math.max(...data.map((d) => Math.max(euIn(d), euOut(d)))),
        ],
        nice: true,
    });

    timeScale.range([0, xMax]);
    euScale.range([yMax, 0]);

    const gridStroke = cn({ 'white': theme === 'dark', '#d1d5db': theme === 'light' })
    const gridOpacity = cn({ 0.25: theme === 'dark', 1: theme === 'light' })
    const textFill = cn({ 'white': theme === 'dark', 'black': theme === 'light' })
    const inStroke = cn({ '#22C55D': theme === 'dark', '#87EFAC': theme === 'light' })
    const outStroke = '#EF4444'

    return (
        <div className="relative">
            <svg width={width} height={height}>
                <rect
                    x={0}
                    y={0}
                    width={width}
                    height={height}
                    fill={background}
                    rx={14}
                />
                <Group left={margin.left} top={margin.top}>
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
                        // strokeDasharray="3,4"
                    />
                    <LinePath
                        data={data}
                        curve={curveBasis}
                        x={(d) => timeScale(date(d)) ?? 0}
                        y={(d) => euScale(euOut(d)) ?? 0}
                        stroke={outStroke}
                        strokeWidth={1.5}
                    />
                </Group>
            </svg>
        </div>
    );
}

export const ThresholdWithParentSize = withParentSize(Theshold);
