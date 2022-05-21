class LRUCache {
    constructor(capacity) {
        // 容量
        this.cap = capacity;
        // map
        this.map = new Map();
        // 数据保存
        this.catch = new DoubleLink();
    }
    // 最近使用的
    makeRecently(key) {
        const node = this.map.get(key);
        //先将其从链表中删除
        this.catch.remove(node);
        // 在将其添加到链表的尾部， 链表中越靠后的越优先级大
        this.catch.addLast(node);
    }
    get(key) {
        if (!this.map.has(key)) {
            return -1;
        }
        this.makeRecently(key);
        return this.map.get(key).val;
    }
    deletekey(key) {
        const node = this.map.get(key);
        // 链表中的数据
        this.catch.remove(node);
        // 映射关系删除
        this.map.delete(key);
    }
    addRecently(key, val) {
        const node = new Node(key, val);
        this.catch.addLast(node);
        this.map.set(key, node);
    }
    put(key, val) {
        // 考虑三种情况， 一是 已存在的key 处理， 二是 超出容量的处理  三是 不存在的处理
        if (this.map.has(key)) {
            // 删除就有的映射关系即链表中的数据
            this.deletekey(key);
            this.addRecently(key, val)
            return;
        }
        if (this.cap === this.catch.size) {
            const deleteNode = this.catch.removeFirst();
            deleteNode && this.map.delete(deleteNode.key);
        }
        this.addRecently(key, val)
    }
}