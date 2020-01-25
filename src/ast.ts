/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */

type Index<T> = {[key:string]: T};


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


export type Converter = (data: any) => any;


export abstract class Type implements Visitable {

    private _converter: Converter;

    constructor(converter?: Converter) {
        this._converter = converter || ((data: any): any => { return data });
    }

    public abstract accept(visitor: Visitor): void;

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
        this._properties = {}
        for  (const eachProperty of properties) {
            this._properties[eachProperty.name] = eachProperty;
        }
    }

    get properties(): Property[] {
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

    constructor (name: string, isOptional: boolean, type: Type) {
        this._name = name;
        this._type = type;
        this._isOptional = isOptional;
    }

    public get isMandatory(): boolean {
        return !this._isOptional;
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

    private _pattern: RegExp;

    constructor(pattern: RegExp, converter?: Converter) {
        super(converter);
        this._pattern = pattern;
    }

    public get pattern(): RegExp {
        return this._pattern;
    }

    public approve(text: string): boolean {
        const approval = this._pattern.test(text);
        return approval;
    }

    public accept(visitor: Visitor): void {
        visitor.visitString(this);
    }

}

export class Number extends Type {

    constructor(converter?: Converter) {
        super(converter);
    }

    public accept(visitor: Visitor): void {
        visitor.visitNumber(this);
    }

}


export class Boolean extends Type {

    constructor(converter?: Converter) {
        super(converter);
    }

    public accept(visitor: Visitor): void {
        visitor.visitBoolean(this);
    }

}
