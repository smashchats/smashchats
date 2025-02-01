export const useLiveQuery = jest.fn(() => ({
    data: [{ notes: "note one 🐱" }, { notes: "note two 🐶" }],
}));

let self: any;
self = jest.fn(() => self);

class Db { 
    _fn = jest.fn()
    select() {
        this._fn();
        return this;
    }
    from() {
        this._fn();
        return this;
    }
    where() {
        this._fn();
        return this;
    }
}

export const drizzle = jest.fn(() => new Db());
