/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */


import { Path } from "./path";
import { Report, ErrorCode } from "./issues";
import * as ast from "./ast";
import * as dsl from "./dsl";


class Parser<T> implements ast.Visitor {

    private _grammar: Grammar;
    private _path: Path;
    private _report: Report;

    constructor (grammar: Grammar, path: Path) {
        this._grammar = grammar;
        this._path = path;
        this._report = new Report();
    }

    private get result(): any {
        return this._path.value;
    }


    private abortIfAnyIssue(): void {
        if (this.anyIssue) {
            throw this._report;
        }
    }


    private get anyIssue(): boolean {
        return this._report.length > 0;
    }


    private fork(expectedType: ast.Type): any {
        return new Parser(this._grammar, this._path.clone())
            .as(expectedType);
    }


    private reportWrongType(expectedType:  string): void {
        this._report.error(
            ErrorCode.TYPE_ERROR,
            this._path.toString(),
            `Expecting a value of type '${expectedType}', but found '${this._path.value}' (of type  '${this._path.type}').`
        );
    }

    private reportMissingProperty(key: string, instead?: any): void {
        this._report.warn(
            ErrorCode.MISSING_PROPERTY,
            this._path.toString(),
            `Expecting a property '${key}' (using default '${instead}'`
        );
    }


    private ensureTypeIs<K>(
        expectedType: string,
        defaultValue: K): void {
        if (this._path.type !== expectedType) {
            this.reportWrongType(expectedType);
            this._path.value = defaultValue;
        }
    }


    private reportIgnoredProperty(key: string): void {
        this._report.warn(
            ErrorCode.IGNORED_PROPERTY,
            this._path.toString(),
            `Ignoring property '{key}' (with value '${this._path.value[key]}')`);
    }

    private reportNoMatchingType(): void {
        this._report.error(
            ErrorCode.NO_MATCHING_TYPE,
            this._path.toString(),
            "The given value does not match any of the possible types"
        );
    }


    private reportInvalidStringPattern(pattern: RegExp) {
        this._report.error(
            ErrorCode.INVALID_STRING_PATTERN,
            this._path.toString(),
            `Expected a string that matches '${pattern}', but found '${this._path.value}'.`);
    }

    public as(type: string  | ast.Type): any {
        let expectedType: ast.Type;
        if (typeof type === "string") {
            expectedType = this._grammar.findTypeByName(type);
        } else {
            expectedType = type;
        }
        expectedType.accept(this);
        this.abortIfAnyIssue();
        return this.result;
    }

    public visitString(definition: ast.StringType): void {
        this.ensureTypeIs("string", "expecting string!");
        if (definition.approve(this._path.value)) {
            this._path.value = definition.convert(this._path.value);
        } else {
            this.reportInvalidStringPattern(definition.pattern);
        }
    }


    public visitNumber(definition: ast.Number): void {
        this.ensureTypeIs("number", 0);
        this._path.value = definition.convert(this._path.value);
    }


    public visitBoolean(definition: ast.Boolean): void {
        this.ensureTypeIs("boolean", false);
        this._path.value = definition.convert(this._path.value);
    }


    public visitArray(definition: ast.ArrayType): void {
        this.ensureTypeIs("object", []);
        this.abortIfAnyIssue();
        const results: any[] = [];
        for (const [index, entry] of this._path.value.entries()) {
            this._path.enter("#" + index, entry);
            definition.contentType.accept(this);
            results.push(this._path.value);
            this._path.exit();
        }
        this._path.value = definition.convert(results);
    }


    public visitUnion(definition: ast.Union): void {
        for (const anyType of definition.candidateTypes) {
            try {
                this._path.value = this.fork(anyType);
                return;

            } catch (issues) {
                continue;

            }
        }
        this.reportNoMatchingType();
    }

    public visitObject(definition: ast.ObjectType): void {
        this.ensureTypeIs("object", []);
        this.abortIfAnyIssue();
        const result: {[key:string]: any} = {};
        for (const eachProperty of definition.properties) {
            const key = eachProperty.name;
            let data = this._path.value[key];
            if (data) {
                this._path.enter(key, data);
                eachProperty.accept(this);
                result[key] = this._path.value;
                this._path.exit();
            } else {
                result[key] = eachProperty.defaultValue;
                if (eachProperty.isMandatory) {
                    this.reportMissingProperty(key, result[key]);
                }
            }
        }
        for (const eachKey in this._path.value) {
            if (!definition.hasProperty(eachKey)) {
                this.reportIgnoredProperty(eachKey);
            }
        }
        this._path.value = definition.convert(result);
    }


    public visitProperty(definition: ast.Property): void {
        definition.type.accept(this);
    }


    public visitReference(reference: ast.Reference): void {
        const actualType
            = this._grammar.findTypeByName(reference.targetName);
        actualType.accept(this);
    }

}


export class Grammar {

    private _declarations: {[name: string]: dsl.TypeDeclaration};

    constructor () {
        this._declarations = {};
        this._declarations["string"] =
            new dsl.TypeDeclaration("string")
            .as(dsl.aString());
        this._declarations["number"] =
            new dsl.TypeDeclaration("number")
            .as(dsl.aNumber());
        this._declarations["boolean"] =
            new dsl.TypeDeclaration("boolean")
            .as(dsl.aBoolean());

    }

    public findTypeByName(name: string): ast.Type {
        if (!(name in this._declarations)) {
            throw new Error(`Unknown type '${name}'!`);
        }
        const declaration = this._declarations[name];
        return declaration.type;
    }

    public define(name: string): dsl.TypeDeclaration {
        if (name in this._declarations) {
            throw new Error(`Duplicate type name '{name}'!`);
        }
        this._declarations[name] = new dsl.TypeDeclaration(name);
        return this._declarations[name];
    }

    public on(name: string): dsl.TypeDeclaration {
        if (name in this._declarations) {
            return this._declarations[name];
        }
        throw new Error(`Unknown type named '${name}'`);
    }


    public read(json: any): any {
        return new Parser(this, Path.from(json));
    }
}
