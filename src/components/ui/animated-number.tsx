import { animate } from "framer-motion";
import { useEffect, useRef } from "react";
import { formatNumber } from "@/lib/format";

interface AnimatedNumberProps {
	value: number;
	suffix?: string;
	prefix?: string;
	className?: string;
}

export const AnimatedNumber = ({ value, suffix = "", prefix = "", className }: AnimatedNumberProps) => {
	const ref = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		const node = ref.current;
		if (!node) return;
		const controls = animate(0, value, {
			duration: 1.2,
			ease: "easeOut",
			onUpdate(latest) {
				node.textContent = `${prefix}${formatNumber(Math.round(latest))}${suffix}`;
			},
		});
		return () => controls.stop();
	}, [value, prefix, suffix]);

	return (
		<span ref={ref} className={className}>
			{prefix}0{suffix}
		</span>
	);
};
