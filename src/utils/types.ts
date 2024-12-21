export type PartialWithId<T extends { id: string }> = Partial<T> & Pick<T, 'id'>;
