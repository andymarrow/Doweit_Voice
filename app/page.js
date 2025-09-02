// ./app/page.js
import Header from "./_components/Header";
import Hero from "./_components/Hero";

export default function Home() {
	return (
		<div className="text-black">
			{/* Header */}
			<Header />
			{/* Hero Section */}
			<Hero />
		</div>
	);
}
