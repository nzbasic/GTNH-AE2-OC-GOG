import React from "react";
import { scaleLinear, scaleBand } from "@visx/scale";
import { Bar } from "@visx/shape";
import { AxisBottom, AxisLeft, AxisRight } from "@visx/axis";
import { Group } from "@visx/group";
import { WithParentSizeProvidedProps, withParentSize } from "@visx/responsive";
import { DateTime } from "luxon";
import { useTheme } from "next-themes";

type Props = {
    data: Array<{
        item: string;
        start: number;
        end: number;
        active_count: number;
        pending_count: number;
    }>;
} & WithParentSizeProvidedProps;

const colorActiveFull = "#5BD687";
const colorActive = "#DCFCE7";
const colorPendingFull = "#F97315";
const colorPending = "#FFEDD5";

const ScheduleChart = ({ parentWidth, parentHeight, data }: Props) => {
    const { theme } = useTheme();

    const colorActiveFull = theme == 'dark' ? '#22C55D' : '#5BD687';
    const colorPendingFull = theme === 'dark' ? '#F97315' : '#F97315';
    const colorActive = theme === 'dark' ? '#14532D' : '#DCFCE7'
    const colorPending = theme === 'dark' ? '#7C2D12' : '#FFEDD5'

    const width = parentWidth || 0;
    const height = parentHeight || 0;

    const margin = { top: 0, right: 0, bottom: 40, left: 0 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Scales
    const xScale = scaleLinear({
        domain: [
            Math.min(...data.map((d) => d.start)),
            Math.max(...data.map((d) => d.end)),
        ],
        range: [0, innerWidth],
    });

    const yScale = scaleBand({
        domain: [...new Set(data.map((d) => d.item))],
        range: [0, innerHeight],
        padding: 0.1,
    });

    const axisColor = theme == 'dark' ? 'white' : 'black';

    // Rendering bars
    return (
        <svg width={width} height={height} className="">
            <Group left={margin.left} top={margin.top}>
                {data.map((d) => (
                    <React.Fragment key={`${d.item}-${d.start}`}>
                        {/* Pending bar */}
                        <Bar
                            x={xScale(d.start)}
                            y={(yScale(d.item) ?? 0) + yScale.bandwidth() / 2/3}
                            width={xScale(d.end) - xScale(d.start)}
                            height={yScale.bandwidth() / 1.5}
                            // fill={colorPendingFull}
                            opacity={theme == 'light' ? 0.5 : 0.9}
                            fill={colorPending}
                            stroke={colorPendingFull}
                        />
                        {/* Active bar (overlapping) */}
                        {d.active_count > 0 && (
                            <Bar
                                x={xScale(d.start)}
                                y={yScale(d.item)}
                                width={xScale(d.end) - xScale(d.start)}
                                height={yScale.bandwidth()}
                                fill={colorActive}
                                rx={2}
                                stroke={colorActiveFull}
                                opacity={1}
                            />
                        )}
                    </React.Fragment>
                ))}
                <AxisBottom
                    top={innerHeight}
                    scale={xScale}
                    tickFormat={(d) => DateTime.fromMillis(d.valueOf()).toFormat("HH:mm")}
                    tickLabelProps={{ fill: axisColor }}
                    tickLineProps={{ stroke: axisColor }}
                    stroke={axisColor}
                />
                <AxisRight scale={yScale} hideAxisLine hideTicks tickLabelProps={{ fill: axisColor }} tickLength={0} />
            </Group>
        </svg>
    );
};

export const ScheduleWithParentSize = withParentSize(ScheduleChart);
