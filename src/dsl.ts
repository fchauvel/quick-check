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


interface Builder<T> {
    build(): T;
}


abstract class TypeBuilder<T extends ast.Type> implements Builder<T> {

    public converter: ast.Converter;

    constructor() {
        this.converter = (data: any) => { return data };
    }

    public abstract build(): T;

}


type TypeRef<T extends ast.Type> = string | TypeBuilder<T>;



class ReferenceBuilder extends TypeBuilder<ast.Reference> {

    private _target: string;

    constructor(target: string) {
        super();
        this._target = target;
    }

    public build(): ast.Reference {
        return new ast.Reference(this._target);
    }

}


export function anObject(): ObjectBuilder {
    return new ObjectBuilder();
}



class ObjectBuilder extends TypeBuilder<ast.ObjectType> {

    private _properties: PropertyBuilder[];

    constructor() {
        super()
        this._properties = [];
    }

    public with(property: PropertyBuilder): ObjectBuilder {
        this._properties.push(property);
        return this;
    }

    public build(): ast.ObjectType {
        const properties: ast.Property[] = [];
        for (const eachProperty of this._properties) {
            properties.push(eachProperty.build())
        }
        return new ast.ObjectType(properties, this.converter);
    }

}


export function aProperty(name: string): PropertyBuilder {
    return new PropertyBuilder(name);
}


class PropertyBuilder implements Builder<ast.Property> {

    private _name: string;
    private _type: TypeBuilder<any>;
    private _isOptional: boolean;

    constructor(name: string) {
        this._name = name;
        this._type = new StringBuilder();
        this._isOptional = false;
    }

    public optional(): PropertyBuilder {
        this._isOptional = true;
        return this;
    }

    public mandatory(): PropertyBuilder {
        this._isOptional = false;
        return this;
    }

    public ofType(type: TypeRef<any>): PropertyBuilder {
        if (typeof type === "string") {
            this._type = new ReferenceBuilder(type);
        } else {
            this._type = type;
        }
        return this;
    }

    public build(): ast.Property {
        return new ast.Property(
            this._name,
            this._isOptional,
            this._type.build());
    }
}


export function anArrayOf<T extends ast.Type>
    (entryType: TypeRef<T>): ArrayBuilder {
    if (typeof entryType === "string") {
        return new ArrayBuilder(new ReferenceBuilder(entryType as string));
    }
    return new ArrayBuilder(entryType as TypeBuilder<T>);
}



class ArrayBuilder extends TypeBuilder<ast.ArrayType> {

    private _contentType: TypeBuilder<any>;

    constructor(contentType: TypeBuilder<any>) {
        super();
        this._contentType = contentType;
    }

    public build(): ast.ArrayType {
        return new ast.ArrayType(
            this._contentType.build(),
            this.converter);
    }

}


export function eitherOf(...candidates: TypeRef<any>[]): UnionBuilder {
    const builders: TypeBuilder<any>[] = [];

    for (const anyCandidate of candidates) {
        if (typeof anyCandidate === "string") {
            builders.push(new ReferenceBuilder(anyCandidate as string));
        } else {
            builders.push(anyCandidate);
        }
    }
    return new UnionBuilder(builders);
}


class UnionBuilder extends TypeBuilder<ast.Union> {

    private _candidateBuilders: TypeBuilder<any>[];

    constructor(candidateBuilders: TypeBuilder<any>[]) {
        super();
        this._candidateBuilders = candidateBuilders;
    }

    public build(): ast.Union {
        const candidatesTypes: ast.Type[] = [];
        for (const eachBuilder of this._candidateBuilders) {
            candidatesTypes.push(eachBuilder.build());
        }
        return new ast.Union(candidatesTypes);
    }
}


export function aString(): StringBuilder {
    return new StringBuilder();
}

class StringBuilder extends TypeBuilder<ast.StringType> {

    private _pattern: RegExp;

    constructor () {
        super();
        this._pattern = /.*/s;
    }

    public thatMatches(pattern: RegExp): StringBuilder {
        this._pattern = pattern;
        return this;
    }


    public build(): ast.StringType {
        return new ast.StringType(this._pattern, this.converter);
    }

}

export function aNumber(): NumberBuilder {
    return new NumberBuilder();
}

class NumberBuilder extends TypeBuilder<ast.Number> {

    public build(): ast.Number {
        return new ast.Number(this.converter);
    }

}

export function aBoolean(): BooleanBuilder {
    return new BooleanBuilder();
}

class BooleanBuilder extends TypeBuilder<ast.Boolean> {

    public build(): ast.Boolean {
        return new ast.Boolean(this.converter);
    }

}


export class TypeDeclaration {

    private _name: string;
    private _builder: TypeBuilder<any>;
    private _type: { isBuilt: boolean, result: ast.Type};
    private _converter: ast.Converter

    constructor(name: string) {
        this._name = name;
        this._builder = new StringBuilder();
        this._type = {
            isBuilt:  false,
            result: aString().build()
        };
        this._converter = (o) => o;
    }

    public isNamed(name: string) {
        return this._name === name;
    }

    public get type(): ast.Type {
        if (!this._type.isBuilt) {
            this._type.result = this._builder.build();
            this._type.isBuilt = true;
        }
        return this._type.result;
    }

    public as(type: TypeBuilder<any>): TypeDeclaration {
        this._builder = type;
        return this;
    }

    public apply(converter: ast.Converter) {
        this._builder.converter = converter;
    }

    public convert(data: any): any {
        return this._converter(data);
    }

}
