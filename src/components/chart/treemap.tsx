import React from "react";
import { Group } from "@visx/group";
import {
    Treemap,
    hierarchy,
    treemapBinary,
} from "@visx/hierarchy";
import { Text } from '@visx/text';
import { useTooltip, Tooltip, TooltipWithBounds } from '@visx/tooltip';
import { scaleLinear } from "@visx/scale";
import { WithParentSizeProvidedProps, withParentSize } from "@visx/responsive";
import { cn } from "@/lib/utils";
import { DateTime, Duration } from "luxon";

const colorActiveFull = "#22C55D";
const colorActive = "#DCFCE7";
const colorPendingFull = "#F97315";
const colorPending = "#FFEDD5";
const background = "#114b5f";

const defaultMargin = { top: 1, left: 1, right: 1, bottom: 1 };

export type TreemapProps = {
    data: Record<string, { active_time: number, pending_time: number }>;
    margin?: { top: number; right: number; bottom: number; left: number };
} & WithParentSizeProvidedProps;

export default function TreemapChart({
    data,
    parentWidth,
    parentHeight,
    margin = defaultMargin,
}: TreemapProps) {
    const width = parentWidth || 0;
    const height = parentHeight || 0;

    const { tooltipData, tooltipTop, tooltipLeft, showTooltip, hideTooltip } = useTooltip<{ name: string; value: number }>();

    return width < 10 ? null : (
        <div className="relative">
            <MemoSvg width={width} height={height} margin={margin} data={data} showTooltip={showTooltip} hideTooltip={hideTooltip} />
            {tooltipData && (
                <TooltipWithBounds top={tooltipTop} left={tooltipLeft} className="bg-card border rounded-sm shadow-sm p-2">
                    <div>
                        <p>{tooltipData.name}</p>
                        <p>{Duration.fromObject({ seconds: tooltipData.value }).toFormat("h'h' mm'm' ss's'")}</p>
                    </div>
                </TooltipWithBounds>
            )}
        </div>
    );
}

const MemoSvg = React.memo(function TreeMapMemo({
    width,
    height,
    margin = defaultMargin,
    data,
    showTooltip,
    hideTooltip
}: TreemapProps & { width: number; height: number; showTooltip: any; hideTooltip: any }) {
    const root = React.useMemo(() => {
        const transformedData = {
            name: 'root',
            value: 0,
            children: [
                { name: 'active_time', value: 0, children: [...Object.entries(data).map(([key, value]) => ({ name: key, value: value.active_time }))] },
                { name: 'pending_time', value: 0, children: [...Object.entries(data).map(([key, value]) => ({ name: key, value: value.pending_time }))] }
            ]
        }

        return hierarchy(transformedData)
            .sum((d) => d.children?.length > 0 ? d.children.reduce((acc, curr) => acc + curr.value, 0) : d.value)
            .sort((a, b) => (a.value || 0) - (b.value || 0));
    }, [data]);

    const colorScalePending = React.useMemo(() => scaleLinear<string>({
        domain: [0, Math.max(...Object.values(data).map(({ pending_time }) => pending_time))],
        range: [colorPending, colorPendingFull],
    }), [data]);

    const colorScaleActive = React.useMemo(() => scaleLinear<string>({
        domain: [0, Math.max(...Object.values(data).map(({ active_time }) => active_time))],
        range: [colorActive, colorActiveFull],
    }), [data]);

    const xMax = width - margin.left - margin.right;
    const yMax = height - margin.top - margin.bottom;

    return (
        <svg width={width} height={height}>
            <Treemap
                top={margin.top}
                root={root}
                size={[xMax, yMax]}
                tile={treemapBinary}
                round
            >
                {(treemap) => (
                    <Group>
                        {treemap
                            .descendants()
                            .map((node, i) => {
                                const nodeWidth = node.x1 - node.x0;
                                const nodeHeight = node.y1 - node.y0;
                                return (
                                    <Group
                                        key={`node-${i}`}
                                        top={node.y0 + margin.top}
                                        left={node.x0 + margin.left}
                                        className={cn({ 'hover:brightness-110': node.depth > 1 })}
                                        onMouseEnter={() => {
                                            if (node.depth == 1) return;
                                            showTooltip({
                                                tooltipLeft: node.x0 + margin.left + nodeWidth / 2,
                                                tooltipTop: node.y0 + margin.top + nodeHeight / 2,
                                                tooltipData: {
                                                    name: node.data.name,
                                                    value: node.value,
                                                },
                                            });
                                        }}
                                        onMouseLeave={() => {
                                            hideTooltip();
                                        }}
                                    >
                                        {node.depth === 1 && (
                                            <rect
                                                width={nodeWidth}
                                                height={nodeHeight}
                                                stroke="black"
                                                strokeWidth={2}
                                                fill="transparent"
                                            />
                                        )}
                                        {node.depth > 1 && (
                                            <>
                                                <rect
                                                    width={nodeWidth}
                                                    height={nodeHeight}
                                                    stroke={background}
                                                    fill={
                                                        node.parent?.data.name === "active_time"
                                                            ? colorScaleActive(node.value as number)
                                                            : colorScalePending(node.value as number)
                                                    }
                                                />
                                                {nodeWidth > 30 && (
                                                    <>
                                                        <Text
                                                            x={nodeWidth/2}
                                                            y={nodeHeight / 2}
                                                            width={nodeWidth - 8}
                                                            scaleToFit={true}
                                                            verticalAnchor="middle"
                                                            textAnchor="middle"
                                                        >
                                                            {node.data.name}
                                                        </Text>
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </Group>
                                );
                            })}
                    </Group>
                )}
            </Treemap>
        </svg>
    )
})

export const TreemapWithParentSize = withParentSize(TreemapChart);
