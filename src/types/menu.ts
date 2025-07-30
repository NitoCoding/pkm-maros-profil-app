export interface IMenu {
	label: string;
	href?: string;
	show: boolean;
	children?: IMenu[];
}
