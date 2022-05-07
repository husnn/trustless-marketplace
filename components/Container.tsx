import React from 'react';

export const Container = ({ children }: { children: React.ReactNode }) => {
	return (
		<div className="w-11/12 sm:w-3/4 md:w-1/2 xl:w-1/3 -mt-[10px] md:-mt-[30px] mx-auto p-10 bg-white rounded-3xl shadow-md">
			{children}
		</div>
	);
};

export default Container;
