/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */

export type Index<T> = {[key: string]: T};


export interface Visitor {

    visitString(expectation: StringType): void;

    visitNumber(definition: Number): void;

    visitBoolean(definition: Boolean): void;

    visitArray(expectation: ArrayType): void;

    visitUnion(definition: Union): void;

    visitObject(expectation: ObjectType): void;

    visitProperty(expected: Property): void;

    visitReference(expected: Reference): void;

}


interface Visitable {

    accept(visitor: Visitor): void;

}


export class Constraint<T> {

    private _description: string;
    private _verification: (v: T) => boolean;

    public constructor(description: string,
                       verification: (x: T) => boolean) {
        this._description = description;
        this._verification = verification;
    }

    public get description(): string  {
        return this._description;
    }

    public isSatisfiedBy(value: T): boolean {
        return this._verification(value);
    }

    public isViolatedBy(value: T): boolean {
        return !this.isSatisfiedBy(value);
    }


}

export type Converter = (data: any) => any;


export abstract class Type implements Visitable {

    private _converter: Converter;

    constructor(converter?: Converter) {
        this._converter = converter || ((data: any): any => { return data; });
    }

    public abstract accept(visitor: Visitor): void;

    public abstract get name(): string;

    public convert(data: any):  any {
        return this._converter(data);
    }

}


export class ArrayType extends Type {

    private _contentType: Type;

    constructor(contentType: Type, converter?: Converter) {
        super(converter);
        this._contentType = contentType;
    }

    public get name(): string {
        return "array(" + this._contentType.name  + ")";
    }

    public get contentType(): Type {
        return  this._contentType;
    }

    public accept(visitor: Visitor): void {
        visitor.visitArray(this);
    }

}


export class Union extends Type {

    private _candidateTypes: Type[];

    constructor(candidateTypes: Type[], converter?: Converter) {
        super(converter);
        this._candidateTypes = candidateTypes;
    }

    public get name(): string {
        return "eitherOf("
            + this._candidateTypes.map(t => t.name).join(", ")
            + ")";
    }

    public get candidateTypes(): Type[] {
        return this._candidateTypes;
    }

    public accept(visitor: Visitor): void {
        visitor.visitUnion(this);
    }

}


export class ObjectType extends Type {

    private _properties: Index<Property>;

    constructor (properties: Property[], converter?: Converter) {
        super(converter);
        this._properties = {};
        for  (const eachProperty of properties) {
            this._properties[eachProperty.name] = eachProperty;
        }
    }

    public get name(): string {
        return "object( ... )";
    }

    public get properties(): Property[] {
        const properties: Property[] = [];
        for (const eachKey in this._properties) {
            properties.push(this._properties[eachKey]);
        }
        return properties;
    }

    public hasProperty(name: string): boolean {
        return name in this._properties;
    }

    public accept(visitor: Visitor): void {
        visitor.visitObject(this);
    }

}


export class Reference extends Type  {

    private _typeName: string;

    constructor (typeName: string) {
        super(undefined);
        this._typeName = typeName;
    }

    public get name(): string {
        return this.targetName;
    }

    get targetName (): string {
        return this._typeName;
    }

    public accept(visitor: Visitor): void {
        visitor.visitReference(this);
    }

}



export class Property implements Visitable {

    private _name: string;
    private _type: Type;
    private _isOptional: boolean;
    private _defaultValue: any;

    constructor (name: string,
                 isOptional: boolean,
                 defaultValue: any,
                 type: Type) {
        this._name = name;
        this._type = type;
        this._isOptional = isOptional;
        this._defaultValue = defaultValue;
    }

    public get isMandatory(): boolean {
        return !this._isOptional;
    }

    public get defaultValue(): any {
        return this._defaultValue;
    }

    public get name(): string {
        return this._name;
    }

    public get type(): Type {
        return this._type;
    }

    public accept(visitor: Visitor): void {
        visitor.visitProperty(this);
    }

}


export class StringType extends Type {

    private _constraints: Constraint<string>[];


    constructor(constraints: Constraint<string>[], converter?: Converter) {
        super(converter);
        this._constraints = constraints;
    }

    public get name(): string {
        return "string";
    }

    public get pattern(): RegExp {
        return /bonjour/g;
    }

    public approve(value: string): Constraint<string>[] {
        return this._constraints.filter(c => c.isViolatedBy(value));
    }

    public accept(visitor: Visitor): void {
        visitor.visitString(this);
    }

}

export class Number extends Type {

    private _constraints: Constraint<number>[];

    constructor(constraints: Constraint<number>[], converter?: Converter) {
        super(converter);
        this._constraints = constraints;
    }

    public approve(value: number): Constraint<number>[] {
        return this._constraints.filter(c => c.isViolatedBy(value));
    }

    public get name(): string {
        return "number";
    }

    public accept(visitor: Visitor): void {
        visitor.visitNumber(this);
    }

}


export class Boolean extends Type {

    constructor(converter?: Converter) {
        super(converter);
    }

    public get name(): string {
        return "boolean";
    }

    public accept(visitor: Visitor): void {
        visitor.visitBoolean(this);
    }

}
