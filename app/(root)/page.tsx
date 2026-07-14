import { ModeToggle } from "@/components/ui/mode-toggle";
import { Show, UserButton } from '@clerk/nextjs'

export default async function Home() {
	return (
		<div>
			<h1>Hello World</h1>
			<ModeToggle />
			<Show when="signed-in">
				<UserButton />
			</Show>
		</div>
  	);
}
