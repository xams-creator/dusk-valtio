const tick = Promise.resolve();
const queue: Function[] = [];
let queued = false;

function isFunction(fn) {
    return typeof fn === 'function';
}

export default function scheduler(fn: any) {
    if (!isFunction(fn)) {
        return;
    }
    queue.push(fn);
    if (!queued) {
        queued = true;
        tick.then(flush);
    }
}

function flush() {
    for (let i = 0; i < queue.length; i++) {
        queue[i]();
    }
    queue.length = 0;
    queued = false;
}
