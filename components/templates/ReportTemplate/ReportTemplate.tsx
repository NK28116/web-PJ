import { Text } from "@/components/atoms/Text"
import { BaseTemplate } from "@/components/templates/BaseTemplate"
import React, { useEffect, useRef, useState } from "react"
import { IoIosArrowDown } from "react-icons/io"
import AiTab from "./AiTab"
import ReportTab from "./ReportTab"

/**
 * 期間選択モーダルコンポーネント
 */
const PeriodSelector: React.FC<{
	value: string
	onChange: (value: string) => void
}> = ({ value, onChange }) => {
	const [isOpen, setIsOpen] = useState(false)
	const dropdownRef = useRef<HTMLDivElement>(null)

	const options = [
		{ label: "先月", value: "lastMonth" },
		{ label: "直近 7 日間", value: "lastWeek" },
		{ label: "直近 2 週間", value: "last2Week" },
		{ label: "月間別", value: "thisYear" },
	]

	const selectedLabel =
		options.find((opt) => opt.value === value)?.label || "選択してください"

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsOpen(false)
			}
		}
		document.addEventListener("mousedown", handleClickOutside)
		return () => {
			document.removeEventListener("mousedown", handleClickOutside)
		}
	}, [])

	return (
		<div className="relative" ref={dropdownRef}>
			<div
				className="flex items-center gap-2 cursor-pointer"
				onClick={() => setIsOpen(!isOpen)}
			>
				<span className="text-sm font-medium text-gray-800">
					{selectedLabel}
				</span>
				<IoIosArrowDown
					className={`transition-transform duration-200 ${
						isOpen ? "rotate-180" : ""
					}`}
				/>
			</div>

			{isOpen && (
				<div className="absolute top-full right-0 mt-3 w-40 bg-white rounded-lg shadow-xl z-50 border border-gray-100">
					{/* 吹き出しの三角 */}
					<div className="absolute -top-2 right-6 w-4 h-4 bg-white transform rotate-45 border-t border-l border-gray-100" />

					<div className="relative py-2 bg-white rounded-lg">
						{options.map((option) => (
							<div
								key={option.value}
								onClick={() => {
									onChange(option.value)
									setIsOpen(false)
								}}
								className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-50 text-gray-700 ${
									value === option.value
										? "font-bold underline decoration-[#00A48D] decoration-2 underline-offset-4"
										: ""
								}`}
							>
								{option.label}
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	)
}

const formatDate = (date: Date): string => {
	return `${date.getMonth() + 1}月${date.getDate()}日`
}

const getDateRange = (period: string): string => {
	const now = new Date()

	if (period === "lastMonth") {
		const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
		const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
		return `${formatDate(lastMonthStart)}〜${formatDate(lastMonthEnd)}`
	}

	if (period === "lastWeek") {
		const end = new Date(now)
		end.setDate(end.getDate() - 1)
		const start = new Date(end)
		start.setDate(start.getDate() - 7)
		// 7 days range (e.g. 17th to 24th is 8 days inclusive? User example 17-24. 24-17=7. So logic: end minus 7)
		// User example: Today 25. Range 17-24.
		// 24 (1), 23 (2), 22 (3), 21 (4), 20 (5), 19 (6), 18 (7), 17 (8).
		// It seems user wants 8 days inclusive or simple "7 days ago".
		// Let's stick to simple "Last 7 days" usually means 7 days.
		// If I do `setDate(getDate() - 6)`, start and end inclusive is 7 days.
		// 24 - 6 = 18. (18,19,20,21,22,23,24 -> 7 days).
		// User said 17-24. That is 8 days.
		// I will return start date as `end - 7` (which gives 8 days span) to match user example numbers roughly.
		return `${formatDate(start)}〜${formatDate(end)}`
	}

	if (period === "last2Week") {
		const end = new Date(now)
		end.setDate(end.getDate() - 1)
		const start = new Date(end)
		start.setDate(start.getDate() - 13) // 14 days?
		// User said 1 week is 17-24 (8 days).
		// Let's assume standard 14 days. `end - 13` gives 14 days inclusive.
		return `${formatDate(start)}〜${formatDate(end)}`
	}

	if (period === "thisYear") {
		// For Monthly/ThisYear, maybe just show year?
		return `${now.getFullYear()}年1月1日〜${now.getFullYear()}年12月31日`
	}

	return ""
}

export const ReportTemplate: React.FC = () => {
	const [activeTab, setActiveTab] = useState<"report" | "ai">("report")
	const [selectedPeriod, setSelectedPeriod] = useState("lastMonth")

	return (
		<BaseTemplate activeTab="report">
			<div className="flex flex-col gap-6 pb-20 bg-[#F5F5F5] min-h-screen">
				{/* ヘッダー部分は BaseTemplate に含まれると想定、ここではコンテンツエリアのみ */}

				{/* タブ・期間選択 */}
				<div className="bg-white sticky top-0 z-10 shadow-sm">
					<div className="px-4 pt-4 pb-0 flex items-center justify-between border-b border-gray-200 ">
						<div className="flex gap-6 items-center w-full">
							<button
								onClick={() => setActiveTab("report")}
								className={`pb-3 text-base font-medium transition-colors border-b-2 flex-1 text-center ${
									activeTab === "report"
										? "text-[#00A48D] border-[#00A48D]"
										: "text-gray-400 border-transparent"
								}`}
							>
								運用実績レポート
							</button>
							<button
								onClick={() => setActiveTab("ai")}
								className={`pb-3 text-base font-medium transition-colors border-b-2 flex-1 text-center ${
									activeTab === "ai"
										? "text-[#00A48D] border-[#00A48D]"
										: "text-gray-400 border-transparent"
								}`}
							>
								AI分析
							</button>
						</div>
					</div>
					<div className="px-4 py-3 bg-[#F9FAFB] flex justify-between items-center border-b border-gray-200">
						<Text className="text-base font-medium text-gray-800">
							{getDateRange(selectedPeriod)}
						</Text>
						<div className="flex items-center gap-2">
							<PeriodSelector
								value={selectedPeriod}
								onChange={setSelectedPeriod}
							/>
						</div>
					</div>
				</div>

				{/* タブコンテンツの表示 */}
				{activeTab === "report" && <ReportTab />}
				{activeTab === "ai" && <AiTab />}
			</div>
		</BaseTemplate>)
}
