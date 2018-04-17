export interface Node<T> {
	value: T;
	left: Node<T> | null;
	right: Node<T> | null;
}
