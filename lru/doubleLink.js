class Node {
    constructor(key, val) {
        this.key = key;
        this.val = val;
        this.next = null;
        this.prev = null;
    }
    destory() {
        delete this;
    }
}

class DoubleLink {
    constructor() {
        this.head = new Node(-1, 0);
        this.tail = new Node(-2, 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
        this.size = 0;
    }
    addLast(node) {
        node.next = this.tail;
        node.prev = this.tail.prev;
        this.tail.prev.next = node;
        this.tail.prev = node;
        this.size++;
    }
    remove(node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
        this.size--;
        node.destory();
    }
    removeFirst() {
        if (this.head.next == this.tail) {
            return null;
        }
        const first = this.head.next;
        if (first) {
            this.remove(first);
        }
        return first;
    }
    getsize() {
        return this.size;
    }
}