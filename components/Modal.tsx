import React from 'react';
import { Dialog } from '@headlessui/react';
import Button from './Button';

export type ModalProps = {
	isOpen: boolean;
	onClose: () => void;
	title?: string;
	description?: string;
	children?: React.ReactNode;
	ok?: string;
	onOkPressed?: () => void;
	disabled?: boolean;
};

export const Modal = (props: ModalProps) => {
	return (
		<Dialog open={props.isOpen} onClose={props.onClose}>
			<div className="fixed inset-0 bg-black bg-opacity-25" />
			<div className="fixed inset-0 flex items-center justify-center">
				<Dialog.Panel className="w-full sm:w-1/2 max-w-[600px] flex flex-col py-8 px-8 bg-white rounded-3xl">
					<Dialog.Title as="h3" className="mb-2">
						{props.title}
					</Dialog.Title>
					{props.description && (
						<Dialog.Description className="text-sm text-slate-500">
							{props.description}
						</Dialog.Description>
					)}
					{props.children}
					{props.ok && (
						<Button
							className="mt-4"
							onClick={props.onOkPressed}
							disabled={props.disabled}
						>
							{props.ok}
						</Button>
					)}
				</Dialog.Panel>
			</div>
		</Dialog>
	);
};

export default Modal;
