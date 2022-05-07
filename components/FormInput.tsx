import React from 'react';

export const FormInput = ({
	label,
	children
}: {
	label?: string;
	children: React.ReactNode;
}) => {
	return (
		<div className="flex flex-col gap-y-2 font-medium">
			{label && <span>{label}</span>}
			{children}
		</div>
	);
};

export default FormInput;
