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
import { Report } from "./issues";
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


    private ensureTypeIs<K>(
        expectedType: string,
        defaultValue: K): void {
        if (this._path.type !== expectedType) {
            this._report.typeError(this._path.toString(),
                                   expectedType,
                                   this._path.value);
            this._path.value = defaultValue;
        }
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
        const value = this._path.value;
        const violatedConstraints = definition.approve(value);
        if (violatedConstraints.length > 0)  {
            this._report.validationError(this._path.toString(),
                                         violatedConstraints,
                                         value);
        } else {
            this._path.value = definition.convert(value);
        }
    }


    public visitNumber(definition: ast.Number): void {
        this.ensureTypeIs("number", 0);
        const value = this._path.value;
        const violatedConstraints = definition.approve(value);
        if (violatedConstraints.length > 0) {
            this._report.validationError(this._path.toString(),
                                         violatedConstraints,
                                         value);
        } else {
            this._path.value = definition.convert(value);
        }
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
        const reports: ast.Index<Report> = {};
        for (const anyType of definition.candidateTypes) {
            try {
                this._path.value = this.fork(anyType);
                return;

            } catch (issues) {
                reports[anyType.name] = issues;
                continue;

            }
        }
        this._report.noMatchingType(
            this._path.toString(),
            reports);
    }

    public visitObject(definition: ast.ObjectType): void {
        this.ensureTypeIs("object", []);
        this.abortIfAnyIssue();
        const result: {[key: string]: any} = {};
        for (const eachProperty of definition.properties) {
            const key = eachProperty.name;
            const data = this._path.value[key];
            if (data) {
                this._path.enter(key, data);
                eachProperty.accept(this);
                result[key] = this._path.value;
                this._path.exit();
            } else {
                result[key] = eachProperty.defaultValue;
                if (eachProperty.isMandatory) {
                    this._report.missingProperty(
                        this._path.toString(),
                        eachProperty);
                }
            }
        }
        for (const eachKey in this._path.value) {
            if (!definition.hasProperty(eachKey)) {
                this._report.ignoredProperty(
                    this._path.toString(),
                    eachKey,
                    this._path.value[eachKey]
                );
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
            throw new Error("Duplicate type name '{name}'!");
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
