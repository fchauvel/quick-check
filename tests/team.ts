/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */



abstract class Partner {

    public abstract get name(): string;

}


export class Person extends Partner {

    private _firstname: string;
    private _lastname: string;

    constructor (firstname: string, lastname: string) {
        super();
        this._firstname = firstname;
        this._lastname = lastname;
    }

    public get name(): string {
        return this._lastname
            + ", " + this._firstname;
    }

}


export class Team extends Partner {

    private _name: string;
    private _members: Partner[];

    constructor (name: string, members: Partner[]) {
        super();
        this._name = name;
        this._members = members;
    }

    public get name(): string {
        return this._name;
    }

    public get members(): Partner[] {
        return this._members;
    }

}


export function sampleTeam(): any {
    return {
        name: "Sample Team",
        members: [
            {
                firstname: "John",
                lastname: "Doe"
            },
            {
                firstname: "James",
                lastname:  "Bond"
            }
        ]
    }
}
