import { useEffect, useState } from 'react';

export type RadioOptionType = {
	id: string;
	label: string;
};

export const RadioGroup = (props: {
	category: string;
	options: Array<RadioOptionType>;
	onSelect: (opt: RadioOptionType) => void;
}) => {
	const [selected, setSelected] = useState(
		props.options.length > 0 ? props.options[0] : null
	);

	useEffect(() => {
		if (!selected) return;
		props.onSelect(selected);
	}, [selected]);

	return (
		<div className="flex gap-x-4 mb-4">
			{props.options.map((opt) => (
				<div key={opt.id} className="flex gap-x-2 items-center">
					<input
						type="radio"
						id={opt.id}
						name={props.category}
						value={opt.id}
						onChange={() => setSelected(opt)}
						checked={selected?.id === opt.id}
					/>
					<label htmlFor={opt.id}>{opt.label}</label>
				</div>
			))}
		</div>
	);
};

export default RadioGroup;
