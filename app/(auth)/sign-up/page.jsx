import { SignUp } from "@/components/SignUp";

export default function Page() {
	return (
		<div className="h-lvh">
			<div className="flex items-center flex-col justify-center w-full h-full md:py-10">
				<div className="md:w-[400px]">
					<SignUp />
				</div>
			</div>
		</div>
	);
}
