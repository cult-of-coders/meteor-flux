import EventEmitter from 'event-emitter';
import Store from './Store.js';

/**
 *
 */
export default class Dispatcher {
    constructor(defaults = {}) {
        this.ee = new EventEmitter();
        this.store = new Store(defaults);
    }

    /**
     * @param action
     * @param data
     */
    emit(action, data) {
        this.ee.emit(action, {
            data: data,
            store: this.store
        });

        this.ee.emit('*', {
            action,
            data,
            store: this.store
        })
    }

    /**
     * @param action
     * @param fn
     */
    register(action, fn) {
        if (_.isFunction(action)) {
            fn = action;
            this.ee.on('*', fn);
        } else {
            this.ee.on(action, fn);
        }
    }
}