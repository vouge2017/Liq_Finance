"use client"

import React from 'react'
import { Icons } from '@/shared/components/Icons'

interface CategoryData {
    name: string
    amount: number
    percentage: number
    color: string
}

interface CategoryPieChartProps {
    data: CategoryData[]
    size?: number
    showLegend?: boolean
    legendPosition?: 'right' | 'bottom'
}

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({
    data,
    size = 200,
    showLegend = true,
    legendPosition = 'right'
}) => {
    const total = data.reduce((sum, d) => sum + d.amount, 0)
    const centerX = size / 2
    const centerY = size / 2
    const radius = (size - 20) / 2
    const innerRadius = radius * 0.6

    let currentAngle = -90

    const slices = data.map((d) => {
        const sliceAngle = (d.amount / total) * 360
        const startAngle = currentAngle
        const endAngle = currentAngle + sliceAngle
        currentAngle = endAngle

        const startRad = (startAngle * Math.PI) / 180
        const endRad = (endAngle * Math.PI) / 180

        const x1 = centerX + radius * Math.cos(startRad)
        const y1 = centerY + radius * Math.sin(startRad)
        const x2 = centerX + radius * Math.cos(endRad)
        const y2 = centerY + radius * Math.sin(endRad)

        const ix1 = centerX + innerRadius * Math.cos(startRad)
        const iy1 = centerY + innerRadius * Math.sin(startRad)
        const ix2 = centerX + innerRadius * Math.cos(endRad)
        const iy2 = centerY + innerRadius * Math.sin(endRad)

        const largeArcFlag = sliceAngle > 180 ? 1 : 0

        const pathData = [
            `M ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            `L ${ix2} ${iy2}`,
            `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${ix1} ${iy1}`,
            'Z',
        ].join(' ')

        return {
            ...d,
            pathData,
            midAngle: (startAngle + sliceAngle / 2) * Math.PI / 180
        }
    })

    if (data.length === 0) {
        return (
            <div className="w-full rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center" style={{ height: size }}>
                <div className="text-center">
                    <Icons.PieChart size={32} className="text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">No categories</p>
                </div>
            </div>
        )
    }

    if (legendPosition === 'right') {
        return (
            <div className="flex gap-6">
                <svg width={size} height={size} className="flex-shrink-0">
                    {slices.map((slice, i) => (
                        <path
                            key={i}
                            d={slice.pathData}
                            fill={slice.color}
                            className="transition-all hover:opacity-80 cursor-pointer"
                        />
                    ))}
                    <circle cx={centerX} cy={centerY} r={innerRadius} fill="#f9fafb dark:#101622" />
                    <text
                        x={centerX}
                        y={centerY - 8}
                        textAnchor="middle"
                        className="text-lg font-black fill-gray-900 dark:fill-white"
                    >
                        {total >= 10000 ? `${(total / 1000).toFixed(0)}k` : total.toLocaleString()}
                    </text>
                    <text
                        x={centerX}
                        y={centerY + 12}
                        textAnchor="middle"
                        className="text-[10px] fill-gray-500 font-medium"
                    >
                        ETB
                    </text>
                </svg>

                <div className="flex-1 space-y-2">
                    {data.map((d, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-gray-600 dark:text-gray-300 truncate">{d.name}</span>
                                    <span className="text-xs font-medium text-gray-400">{d.percentage}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-gray-100 dark:bg-white/10 rounded-full mt-1">
                                    <div
                                        className="h-full rounded-full transition-all"
                                        style={{ width: `${d.percentage}%`, backgroundColor: d.color }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <svg width={size} height={size} className="mx-auto">
                {slices.map((slice, i) => (
                    <path
                        key={i}
                        d={slice.pathData}
                        fill={slice.color}
                        className="transition-all hover:opacity-80 cursor-pointer"
                    />
                ))}
                <circle cx={centerX} cy={centerY} r={innerRadius} fill="#f9fafb dark:#101622" />
                <text
                    x={centerX}
                    y={centerY - 8}
                    textAnchor="middle"
                    className="text-lg font-black fill-gray-900 dark:fill-white"
                >
                    {total >= 10000 ? `${(total / 1000).toFixed(0)}k` : total.toLocaleString()}
                </text>
                <text
                    x={centerX}
                    y={centerY + 12}
                    textAnchor="middle"
                    className="text-[10px] fill-gray-500 font-medium"
                >
                    ETB
                </text>
            </svg>

            <div className="grid grid-cols-2 gap-3">
                {data.map((d, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300 truncate">{d.name}</span>
                        <span className="text-xs font-bold text-gray-400 ml-auto">{d.percentage}%</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
