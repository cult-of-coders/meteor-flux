import EventEmitter from 'event-emitter';
import { Mongo } from 'meteor/mongo';

/**
 * The store class which holds data,
 */
export default class Store extends Mongo.Collection {
    constructor(defaults, options = {}) {
        super(null);
        this._prepareDefaults(defaults);

        this._storeOptions = options;
        this._mainCursor = this.find();
        this._ee = new EventEmitter();
        this._initializeEvents();
        this.parent = null;
    }

    /**
     * @param callback
     */
    subscribe(callback) {
        this.on('updated', callback);

        return () => {
            this.unsubscribe(callback);
        }
    }

    /**
     * @param callback
     */
    unsubscribe(callback) {
        this.off('updated', callback);
    }

    /**
     * @param event
     * @param callback
     */
    on(event, callback) {
        this._ee.on(event, callback);
    }

    /**
     * @param event
     * @param callback
     */
    off(event, callback) {
        this._ee.off(event, callback);
    }

    /**
     * @param key
     * @param defaultValue
     * @returns {*}
     */
    get(key, defaultValue) {
        let doc = _.first(this.find({key: key}).fetch());

        if (!doc && defaultValue !== undefined) {
            return defaultValue;
        }

        return doc ? doc.value : undefined;
    }

    /**
     * @param key
     * @param value
     */
    set(key, value) {
        if (value instanceof Store) {
            value.parent = this;
        }

        this.upsert({key: key}, {$set: {value: value}});
    }

    /**
     * Reactively fetching data.
     *
     * @param filters
     * @param options
     */
    fetch(filters, options = {}) {
        this.find(filters, options).fetch()
    }

    /**
     * @param criteria
     * @param others
     * @returns {*}
     */
    update(criteria, ...others) {
        return this._operationStringReplacement('update', criteria, ...others);
    }

    /**
     * @param criteria
     * @param others
     * @returns {*}
     */
    remove(criteria, ...others) {
        return this._operationStringReplacement('remove', criteria, ...others);
    }

    /**
     * Forcing the update
     */
    forceUpdate() {
        this._ee.emit('updated');
    }

    /**
     * @param method
     * @param criteria
     * @param others
     * @returns {*}
     * @private
     */
    _operationStringReplacement(method, criteria, ...others) {
        if (_.isString(criteria)) {
            let newCriteria = {key: criteria};
            return super[method](newCriteria, ...others);
        }

        return super[method](criteria, ...others);
    }
    /**
     * @private
     */
    _initializeEvents() {
        const ee = this._ee;
        const store = this;
        this._mainCursor.observe({
            added(...args) {
                ee.emit('updated', store);
                ee.emit('added', ...args);
            },
            changed(...args) {
                ee.emit('updated', store);
                ee.emit('changed', ...args);
            },
            removed(...args) {
                ee.emit('updated', store);
                ee.emit('removed', ...args);
            }
        });

        ee.on('updated', () => {
            if (this._storeOptions.propagate === true && this.parent) {
                this.parent._ee.emit('updated', this.parent);
            }
        })
    }

    /**
     * @param defaults
     * @private
     */
    _prepareDefaults(defaults) {
        if (_.isObject(defaults)) {
            _.each(defaults, (value, key) => {
                this.set(key, value);
            })
        } else if (_.isArray(defaults)) {
            _.each(defaults, (value) => this.insert(value))
        }
    }
}
