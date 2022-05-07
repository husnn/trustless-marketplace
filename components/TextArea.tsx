import { TextareaHTMLAttributes } from 'react';

export const TextArea = (
	props: {
		state: [React.ComponentState, React.SetStateAction<any>];
	} & TextareaHTMLAttributes<HTMLTextAreaElement>
) => {
	return (
		<textarea
			className="min-h-[100px] max-h-[200px] py-4 px-6 bg-slate-100 focus:bg-slate-200 text-base font-normal text-black rounded-lg transition-colors duration-200 outline-none"
			value={props.state[0]}
			onChange={(e) => props.state[1](e.target.value)}
			{...props}
		/>
	);
};

export default TextArea;
