import React, { InputHTMLAttributes } from 'react';

export const TextInput = (
	props: {
		state: [React.ComponentState, React.SetStateAction<any>];
	} & InputHTMLAttributes<HTMLInputElement>
) => {
	return (
		<input
			type="text"
			className="h-[50px] min-w-[20px] px-6 bg-slate-100 focus:bg-slate-200 text-base font-normal text-black rounded-lg transition-colors duration-200 outline-none"
			value={props.state[0]}
			onChange={(e) => props.state[1](e.target.value)}
			{...props}
		/>
	);
};

export default TextInput;
