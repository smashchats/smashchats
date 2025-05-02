class Db {
    _fn = () => {};
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
    leftJoin() {
        this._fn();
        return this;
    }
    limit() {
        this._fn();
        return this;
    }
    groupBy() {
        this._fn();
        return this;
    }
    orderBy() {
        this._fn();
        return this;
    }
    offset() {
        this._fn();
        return this;
    }
    execute() {
        this._fn();
    }
    then() {
        this._fn();
        return this;
    }
    catch() {
        this._fn();
    }
}

export const drizzle_db = new Db();
