export declare type SQLiteOptions = {
    SQLite: any;
    databaseName: string;
    table: string;
    onError: Function;
    onReady: Function;
    onOpen: Function;
};
export interface GunOptions extends Partial<{
    file: string;
    web: any;
    s3: {
        key: any;
        secret: any;
        bucket: any;
    };
    sqlite: SQLiteOptions;
    peers: string[] | Record<string, {}>;
    radisk: boolean;
    localStorage: boolean;
    uuid(): string;
    [key: string]: any;
}> {
}
export declare const makeStoreAdapter: (Gun: any, autoInit?: boolean) => {
    init: () => void;
};
