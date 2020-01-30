/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */


import * as ast from "./ast";


export class ErrorCode {
    public static readonly TYPE_ERROR = "TYPE ERROR";
    public static readonly MISSING_PROPERTY = "MISSING PROPERTY";
    public static readonly IGNORED_PROPERTY = "IGNORED PROPERTY";
    public static readonly NO_MATCHING_TYPE = "NO MATCHING TYPE";
    public static readonly VALIDATION_ERROR = "VALIDATION_ERROR";
}

class Level {
    public static readonly ERROR =  "Error";
    public static readonly WARNING = "Warning";
}


interface Visitor {

    visitMissingProperty(issue: MissingProperty): void;

    visitIgnoredProperty(issue: IgnoredProperty): void;

    visitTypeError(issue: TypeError): void;

    visitNoMatchingType(issue: NoMatchingType): void;

    visitValidationError<T>(issue: ValidationError<T>): void;

    visitReport(report: Report): void;

}


abstract class Issue {

    private _level: string;
    private _code: string;
    private _location: string;

    constructor(level: string, code: string, location: string) {
        this._level = level;
        this._code = code;
        this._location = location;
    }

    public get level(): string {
        return this._level;
    }

    public get code(): string {
        return  this._code;
    }

    public get location(): string {
        return this._location;
    }

    public abstract get description(): string;

    public get advice(): string {
        return "";
    }

    public abstract accept(visitor: Visitor): void;

}


class MissingProperty extends Issue {

    private _property: ast.Property;

    public constructor(location: string,
                       property:  ast.Property) {
        super(Level.ERROR,
              ErrorCode.MISSING_PROPERTY,
              location);
        this._property = property;
    }

    public get description(): string {
        return `Missing property '${this._property.name}' `
            + `of type '${this._property.type.name}'.`;
    }

    public accept(visitor: Visitor): void {
        visitor.visitMissingProperty(this);
    }

}


class IgnoredProperty extends Issue {

    private _key: string;
    private _value: any;

    constructor(location: string,
                key: string,
                value: any)  {
        super(Level.WARNING,
              ErrorCode.IGNORED_PROPERTY,
              location);
        this._key = key;
        this._value = value;
    }

    public get description(): string {
        return `Ignored property '${this._key}'`
            + ` (with value '${this._value}').`;
    }

    public accept(visitor: Visitor): void {
        visitor.visitIgnoredProperty(this);
    }


}



class ValidationError<T> extends Issue {

    private _violatedConstraints: ast.Constraint<T>[];
    private _found: T;

    constructor (location: string,
                 violatedConstraints: ast.Constraint<T>[],
                 found: T) {
        super(Level.ERROR,
              ErrorCode.VALIDATION_ERROR,
              location);
        this._violatedConstraints = violatedConstraints;
        this._found = found;
    }

    public get description(): string {
        return `Value '${this._found}' violates some constraints`;
    }


    public accept(visitor: Visitor): void {
        visitor.visitValidationError(this);
    }

}


class TypeError extends Issue {

    private _expected: string;
    private _found: any;

    public constructor(location: string,
                       expected: string,
                       found: any) {
        super(Level.ERROR,
              ErrorCode.TYPE_ERROR,
              location);
        this._expected = expected;
        this._found = found;
    }

    public get description(): string {
        const actual = typeof this._found;
        return `Expecting a value of type '${this._expected}' `
            + `but found '${this._found}' of type '${actual}'.`;
    }

    public accept(visitor: Visitor): void {
        visitor.visitTypeError(this);
    }

}


class NoMatchingType extends Issue {

    private _reports: ast.Index<Report>;

    constructor(location: string,
                reports: ast.Index<Report>) {
        super(Level.ERROR,
              ErrorCode.NO_MATCHING_TYPE,
              location);
        this._reports = reports;
    }

    public get reports(): ast.Index<Report> {
        return this._reports;
    }

    public get description(): string {
        const candidates =
            Object.keys(this._reports).join(", ");
        return `None of the possible type matches (${candidates})`;
    }

    public accept(visitor: Visitor): void {
        visitor.visitNoMatchingType(this);
    }

}


class Formatter implements Visitor {

    private _result: string;
    private _indexes: number[];

    public constructor() {
        this._result = "";
        this._indexes = [];
    }

    public get result(): string {
        return this._result;
    }

    private write(text: string): void {
        this._result += text;
    }

    private get index(): number {
        return this._indexes[this._indexes.length-1] + 1;
    }

    private align(text: string): void {
        const spaces = " ".repeat(5);
        this.indent(spaces + text);
    }

    private indent(text: string): void {
        const level = this._indexes.length - 1;
        const indentation = " ".repeat(level * 6);
        this.write(indentation + text);
    }

    private numbered(text: string): void {
        this.indent(String(this.index).padStart(3)
                   + ". " + text);
    }

    public visitMissingProperty(issue: MissingProperty): void {
        this.defaultFormat(issue);
    }

    public visitIgnoredProperty(issue: IgnoredProperty): void {
        this.defaultFormat(issue);
    }

    public visitTypeError(issue: TypeError): void {
        this.defaultFormat(issue);
    }

    public visitNoMatchingType(issue: NoMatchingType): void {
        this.numbered(issue.level + ": '" + issue.code
                      + "' at " + issue.location + "\n");
        this.align(issue.description + "\n");
        for (const [key, report] of Object.entries(issue.reports)) {
            this.align(` - Assuming value is of type '${key}':\n`);
            report.accept(this);
        }
    }

    public visitValidationError<T>(issue: ValidationError<T>): void {
        this.defaultFormat(issue);
    }

    public visitReport(report: Report): void {
        for (const [index, issue] of report.issues.entries()) {
            this._indexes.push(index);
            issue.accept(this);
            this._indexes.pop();
        }
    }

    protected defaultFormat(issue: Issue): void  {
        this.numbered(issue.level + ": '" + issue.code
                      + "' at " + issue.location + "\n");
        this.align(issue.description + "\n");
        this.align(issue.advice + "\n");
    }

}


export class Report {

    private _issues: Issue[];


    constructor () {
        this._issues = [];
    }


    public get issues(): Issue[] {
        return this._issues;
    }

    public accept(visitor: Visitor): void {
        visitor.visitReport(this);
    }


    public missingProperty(location: string, property: ast.Property): void {
        this._issues.push(
            new MissingProperty(location, property)
        );
    }


    public ignoredProperty(location: string, key: string, value: any): void {
        this._issues.push(
            new IgnoredProperty(location, key, value)
        );
    }

    public validationError<T>(location: string,
                              violatedConstraints: ast.Constraint<T>[],
                              found: T) {
        this._issues.push(
            new ValidationError<T>(location,
                                   violatedConstraints,
                                   found)
        );
    }


    public typeError(location: string, expected: string, found: any): void {
        this._issues.push(
            new TypeError(location, expected, found)
        );
    }


    public noMatchingType(location: string, reports: ast.Index<Report>): void {
        this._issues.push(
            new NoMatchingType(location, reports)
        );
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


    public toString(): string {
        const formatter = new Formatter();
        this.accept(formatter);
        return formatter.result;
    }

}
