import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = ({ children, className, ...props }: ButtonProps) => {
	return (
		<button
			className={`min-w-[50px] h-10 px-4 bg-blue-500 text-white rounded-full${
				className ? ` ${className}` : ''
			}`}
			{...props}
		>
			{children}
		</button>
	);
};

export default Button;
