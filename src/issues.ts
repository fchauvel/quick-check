/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */

export class ErrorCode {
    public static readonly TYPE_ERROR = "TYPE ERROR";
    public static readonly MISSING_PROPERTY = "MISSING PROPERTY";
    public static readonly IGNORED_PROPERTY = "IGNORED PROPERTY";
    public static readonly NO_MATCHING_TYPE = "NO MATCHING TYPE";
}



interface Issue {
    level: string;
    code: string;
    location: string;
    description: string;
    advice?: string;
}



export class Report {

    private _issues: Issue[];


    constructor () {
        this._issues = [];
    }


    public append(other: Report): void {
        this._issues = this._issues.concat(other._issues);
    }


    public get length(): number {
        return this._issues.length;
    }


    public withCode(code: string): Issue[] {
        return this._issues.filter(i => i.code === code);
    }

    public error(code: string, location: string, description: string, advice?: string) {
        this._issues.push({
            level: "ERROR",
            code: code,
            location: location,
            description: description,
            advice: advice
        });
    }


    public warn(code: string, location: string, description: string, advice?: string) {
        this._issues.push({
            level: "WARNING",
            code: code,
            location: location,
            description: description,
            advice: advice
        });
    }

}
