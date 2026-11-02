import type { Meta, StoryObj } from "@storybook/react-vite";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "#/components/ui/pagination";

const meta = {
	title: "UI/Pagination",
	component: Pagination,
	render: () => (
		<Pagination>
			<PaginationContent>
				<PaginationItem>
					<PaginationPrevious href="#previous" />
				</PaginationItem>
				<PaginationItem>
					<PaginationLink href="#page-1" isActive>
						1
					</PaginationLink>
				</PaginationItem>
				<PaginationItem>
					<PaginationLink href="#page-2">2</PaginationLink>
				</PaginationItem>
				<PaginationItem>
					<PaginationEllipsis />
				</PaginationItem>
				<PaginationItem>
					<PaginationLink href="#page-8">8</PaginationLink>
				</PaginationItem>
				<PaginationItem>
					<PaginationNext href="#next" />
				</PaginationItem>
			</PaginationContent>
		</Pagination>
	),
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
