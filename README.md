Flux for Meteor
===============================

This is the most basic, most intuitive, and easy to use flux implementation.

You have a single main store in your dispatcher.
You can use multiple stores in your store.


The Store
=====================================
Store is an extended version of local Mongo.Collection.
Set and get, play with a document like {key: 'key', value: 'value'}

```
let store = new Store(defaults); // optionally specify defaults
// if defaults is an array, it will do inserts in the store
// if defaults is an object, it will insert documents as {key, value}
// this means that if defaults = [{key: 'xxx'}, {value: 'yyy'}], it will be equivalent if with {'xxx': 'yyy'}

store.set('key', 'value'); // value can be object, function, array, whatever
store.get('key'); // returns the value, returns undefined if it can't find it
store.get('key', defaultValue);  // returns the value, returns defaultValue it can't find it.

// if you are using store for array-like storing
store.fetch(filters, options) will return all elements from it using filters and options as you are accustomed with .find()

// by default the fetch() in Store is reactive!
// this can help you avoid subscribing to a store. 

// if you want to disable reactivity, for any reason:
store.fetch({}, {reactive: false});
```


Store Events
===============================
```
store.subscribe(callback) // will call the callback whenever the store changes.
// unsubscribing from a store
let unsubscribe = store.subscribe(callback);
unsubscribe();
// or
store.unsubscribe(callback);

// listen to store events
store.on('updated', callback) // this is exactly similar to subscribe

// http://docs.meteor.com/api/collections.html#Mongo-Cursor-observe
// only exposes 'changed', 'added', 'removed' with the same params
// when any of this event happens, the 'updated' event is also triggered

store.on('changed', (newDocument, oldDocument) => {
    // if you play with set, oldDocument.key will equal newDocument.key
})
store.on('added', (document) => {});
store.on('removed', (document) => {});

// trigger update event forcefully
store.triggerUpdate();
```

Dispatcher
======================================
The dispatcher has one store. It's own store.

```
let dispatcher = new Dispatcher(defaults); // optionally specify defaults, that will be passed to the store
dispatcher.store // access the main store of the dispatcher

// listening to a single action
dispatcher.register('ADD_TODO', ({data, store}) => {
    // do stuff with the store
    store.get('todos').insert({ ... });
})

// listening to all dispatched actions
dispatcher.register(({action, data, store}) => {
    if (action === 'ADD_TODO') { ... }
})

// dispatching actions
dispatcher.emit('ACTION_STRING', data);

// listening to events
dispatcher.store.subscribe(callback);
```


Updating Array/Object Elements in Stores
=======================================
// listening to all dispatched actions
dispatcher.register(({action, data, store}) => {
    switch (action) {
        case 'ADD_TODO':
            store.get('todos').insert(data);
        case 'UPDATE_TODO':
            const {_id, toDoData} = data;
            store.get('todos').update(_id, {$set: toDoData});
        case 'SET_SPECIAL_FILTER':
            store.update('filters', {$set: {'specialFilter': data});
    }
})

Nesting Stores
=====================================
If you store the application state in one place, that place can become huge, and every change happening in a small portion of your app,
will go through a lot of listeners. However, you can listen to changes on specific stores.

```
const dispatcher = new Dispatcher({
    'filters': new Store({
        date: null,
        whatever: null,
        moreComplexity: new Store({
            importantData: null
        })
    });
})

const filters = dispatcher.store.get('filters')
filters.get('moreComplexity').subscribe(callback)
```

Nested stores don't propagate update to the parent by default. However you can configure them to do so in the constructor:
```
const dispatcher = new Dispatcher({
    'filters': new Store({
        date: null,
        whatever: null,
        moreComplexity: new Store({
            importantData: null
        }, {propagate: true}) // this will propagate updated event to the filters store
    }, {propagate: true}); // this will propagate event to the main store.
})
// using the code above means that any change done in moreComplexity, will trigger update in the main store (dispatcher.store)
```

Registering actions that play with nested stores:
```
dispatcher.register('ACTION', ({store, data}) => {
    const localStore = store.get('filters').get('moreComplexity');
    localStore.set('something', 'somethingElse')
})
```

Use it with Blaze
=======================================
```
import {Dispatcher, Store} from 'meteor/cultofcoders:meteor-flux';

let dispatcher = new Dispacher({
    todos: new Store(),
    filters: 'all'
});

dispatcher.register('ADD_TODO', ({data, store}) => {
    let todos = store.get('todos')
    todos.insert(data);
});

Template.ToDoList.helpers({
    todos() {
        const todos = dispatcher.store.get('todos');
        
        return todos.fetch();
    }
});

Template.ToDoList.events({
    'click .js-add-todo'(e) {
        dispatcher.emit('ADD_TODO', {text: 'Understand Flux'});
    }
});
```