interface Entry {
    key: string;
    value: any;
}


export class Path {

    public static from(root: any): Path {
        const entries = [ {
            key: "root",
            value: root
        } ];
        return new Path(entries);
    }


    private _entries: Entry[];

    constructor (entries: Entry[]) {
        this._entries = entries;
    }

    private get head(): Entry {
        const length = this._entries.length;
        return this._entries[length-1];
    }

    public get value(): any {
        return this.head.value;
    }

    public set value(newValue:  any) {
        this.head.value = newValue;
    }

    public get type(): string {
        return typeof this.value;
    }

    public enter(key: string, value: any): void {
        this._entries.push({
            key: key,
            value: value
        });
    }

    public exit(): void {
        if (this._entries.length === 1) {
            throw new Error("Cannot exit the root!");
        }
        this._entries.pop();
    }

    public toString(separator = "/"): string {
        return this._entries.map(e => e.key).join(separator);
    }


    public clone(): Path {
        const entries: Entry[] = [];
        for (const { key, value } of this._entries) {
            entries.push(
                {
                    key: key,
                    value: value
                }
            );
        }
        return new Path(entries);
    }

}
