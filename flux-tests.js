// Import Tinytest from the tinytest Meteor package.

import {Dispatcher, Store} from 'meteor/cultofcoders:meteor-flux';

describe('Testing Store', function () {
    it('Should store and retrieve data', function () {
        let store = new Store();
        store.set('filter', 'all');

        assert.equal('all', store.get('filter'));
    });

    it('Should store default data', function () {
        let store = new Store({filter: 'all'});

        assert.equal('all', store.get('filter'));
    });

    it('Should get a default value', function () {
        let store = new Store({filter: 'all'});

        assert.equal('testOk', store.get('nonExisting', 'testOk'));
    });

    it('Should findOne, update, remove', function () {
        let store = new Store({operations: 'all'});

        store.update('operations', {$set: {value: 'none'}});
        assert.equal('none', store.get('operations'));

        store.remove('operations');
        assert.equal(undefined, store.get('operations'));
    });

    it('Should observe changes', function () {
        let store = new Store({filter: 'all'});

        let inEvent = false;
        store.on('changed', (newDoc, oldDoc) => {
            inEvent = true;
            assert.equal(newDoc.key, oldDoc.key);
            assert.equal('all', oldDoc.value);
            assert.equal('none', newDoc.value);
        });

        let inSubscribe = false;
        store.subscribe(() => {
             inSubscribe = true;
        });

        store.set('filter', 'none');
        assert.equal(true, inEvent);
        assert.equal(true, inSubscribe);
    })
});

describe('Testing Dispatcher', function () {
    it('It should dispatch proper data when listening to an action.', function () {
        let dispatcher = new Dispatcher();
        dispatcher.register('ADD_SOMETHING', function ({data, store}) {
            assert.equal('works!', data);
            store.set('works', true);
        });

        dispatcher.emit('ADD_SOMETHING', 'works!');
        assert.equal(true, dispatcher.store.get('works'));
    });

    it('It should dispatch proper data when listening to all actions.', function () {
        let dispatcher = new Dispatcher();
        dispatcher.register(function ({action, data, store}) {
            if (action === 'ADD_SOMETHING') {
                assert.equal('works!', data);
            }
        });

        dispatcher.emit('ADD_SOMETHING', 'works!');
    });

    it('It should update the store correctly', function () {
        let dispatcher = new Dispatcher();
        dispatcher.register(function ({action, data, store}) {
            if (action === 'ADD_SOMETHING') {
                store.set('testOk', true);
            }
        });

        dispatcher.emit('ADD_SOMETHING', 'works!');

        assert.equal(true, dispatcher.store.get('testOk'));
    });

    it('It should store default values', function () {
        let dispatcher = new Dispatcher({someKey: 'ok'});
        assert.equal('ok', dispatcher.store.get('someKey'));
    });
});