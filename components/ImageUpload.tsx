import Image from 'next/image';
import React, { forwardRef, useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

export const ImageUpload = forwardRef(
	(props, ref: React.ForwardedRef<HTMLInputElement>) => {
		const [imageSrc, setImageSrc] = useState<string>();

		const onDrop = useCallback((files: File[]) => {
			if (files.length < 1) return;
			setImageSrc(URL.createObjectURL(files[0]));
		}, []);

		const { getRootProps, getInputProps, isDragActive } = useDropzone({
			onDrop,
			maxFiles: 1,
			accept: {
				'image/png': [],
				'image/jpeg': []
			}
		});

		return (
			<div
				className="w-full h-[130px] relative my-4 flex flex-col justify-center items-center text-center p-4 border-2 border-slate border-dashed cursor-pointer rounded-xl"
				{...getRootProps()}
			>
				{imageSrc ? (
					<Image
						className="rounded-xl"
						src={imageSrc}
						layout="fill"
						objectFit="cover"
						alt=""
					/>
				) : (
					<div>
						<Image alt="Upload" src="/ic-upload.png" width={32} height={32} />
						<p>
							{isDragActive
								? 'You can drop it here'
								: 'Select image or drag it here'}
						</p>
					</div>
				)}
				<input {...getInputProps()} ref={ref} />
			</div>
		);
	}
);

ImageUpload.displayName = 'ImageUpload';

export default ImageUpload;
