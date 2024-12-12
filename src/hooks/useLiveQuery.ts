import { is } from "drizzle-orm";
import { type AnySQLiteSelect } from "drizzle-orm/sqlite-core";
import { SQLiteRelationalQuery } from "drizzle-orm/sqlite-core/query-builders/query";
import { addDatabaseChangeListener } from "expo-sqlite";
import { useEffect, useState } from "react";

// https://github.com/drizzle-team/drizzle-orm/issues/2660#issuecomment-2418187625
export const useLiveTablesQuery = <
    T extends
        | Pick<AnySQLiteSelect, "_" | "then">
        | SQLiteRelationalQuery<"sync", unknown>
>(
    query: T,
    tables: string[],
    deps: unknown[] = []
) => {
    const [data, setData] = useState<Awaited<T>>(
        (is(query, SQLiteRelationalQuery) &&
        (query as unknown as { mode: string }).mode === "first"
            ? undefined
            : []) as Awaited<T>
    );
    const [error, setError] = useState<Error>();
    const [updatedAt, setUpdatedAt] = useState<Date>();

    useEffect(() => {
        let listener: ReturnType<typeof addDatabaseChangeListener> | undefined;

        const handleData = (newData: any) => {
            setData(newData);
            setUpdatedAt(new Date());
        };

        query.then(handleData).catch(setError);

        listener = addDatabaseChangeListener(({ tableName }) => {
            if (tables.includes(tableName)) {
                query.then(handleData).catch(setError);
            }
        });

        return () => {
            listener?.remove();
        };
    }, deps);

    return {
        data,
        error,
        updatedAt,
    } as const;
};
