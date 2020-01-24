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


export interface Type extends Visitable {

}


export class ArrayType implements Type {

    private _contentType: Type;

    constructor(contentType: Type) {
        this._contentType = contentType;
    }

    public get contentType(): Type {
        return  this._contentType;
    }

    public accept(visitor: Visitor): void {
        visitor.visitArray(this);
    }

}


export class Union implements Type {

    private _candidateTypes: Type[];

    constructor(candidateTypes: Type[]) {
        this._candidateTypes = candidateTypes;
    }

    public get candidateTypes(): Type[] {
        return this._candidateTypes;
    }

    public accept(visitor: Visitor): void {
        visitor.visitUnion(this);
    }

}


export class ObjectType implements Type {

    private _properties: Index<Property>;

    constructor () {
        this._properties = {}
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

    // TODO: Move this outside the AST
    public with(property: Property): ObjectType {
        if (property.name in this._properties) {
            throw new Error(
                `Duplicated property name '${property.name}'`
            );
        }
        this._properties[property.name] = property;
        return this;
    }

}


export class Reference implements Type  {

    private _typeName: string;

    constructor (typeName: string) {
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

    constructor (name: string, type?: Type) {
        this._name = name;
        this._type = type || new StringType();
    }

    public get name(): string {
        return this._name;
    }

    public get type(): Type {
        return this._type;
    }

    // TODO: Move this outside the ast
    public ofType(type:  Type | string): Property {
        if (typeof type === "string") {
            this._type = new  Reference(type);
        } else {
            this._type = type;
        }
        return this;
    }

    public accept(visitor: Visitor): void {
        visitor.visitProperty(this);
    }

}


export class StringType implements Type {

    public accept(visitor: Visitor): void {
        visitor.visitString(this);
    }

}

export class Number implements Type {

    public accept(visitor: Visitor): void {
        visitor.visitNumber(this);
    }

}


export class Boolean implements Type {

    public accept(visitor: Visitor): void {
        visitor.visitBoolean(this);
    }

}
