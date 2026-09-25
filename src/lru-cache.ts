
export class Node<K, V> {
  key: K;
  value: V;
  expiresAt: number | null; 
  prev: Node<K, V> | null = null;
  next: Node<K, V> | null = null;

  constructor(key: K, value: V, expiresAt: number | null = null) {
    this.key = key;
    this.value = value;
    this.expiresAt = expiresAt;
  }

  isExpired(currentTime: number = Date.now()): boolean {
    return this.expiresAt !== null && currentTime >= this.expiresAt;
  }
}


export class LRUCache<K, V> {
  private readonly capacity: number;
  private readonly map: Map<K, Node<K, V>>;
  private readonly head: Node<K, V>; 
  private readonly tail: Node<K, V>; 

  constructor(capacity: number) {
    if (typeof capacity !== "number" || !Number.isInteger(capacity) || capacity <= 0) {
      throw new Error("Capacity must be a positive integer greater than 0.");
    }

    this.capacity = capacity;
    this.map = new Map<K, Node<K, V>>();

   
    this.head = new Node<K, V>(null as unknown as K, null as unknown as V);
    this.tail = new Node<K, V>(null as unknown as K, null as unknown as V);

    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  get(key: K): V | -1 {
    const node = this.map.get(key);
    if (!node) {
      return -1;
    }

   
    if (node.isExpired()) {
      this.removeNode(node);
      this.map.delete(key);
      return -1;
    }

   
    this.moveToHead(node);
    return node.value;
  }


  put(key: K, value: V, ttlMs?: number): void {
    const expiresAt = ttlMs !== undefined && ttlMs > 0 ? Date.now() + ttlMs : null;

    if (this.map.has(key)) {
      const existingNode = this.map.get(key)!;
      existingNode.value = value;
      existingNode.expiresAt = expiresAt;
      this.moveToHead(existingNode);
      return;
    }

   
    if (this.map.size >= this.capacity) {
      const lruNode = this.popTail();
      if (lruNode) {
        this.map.delete(lruNode.key);
      }
    }

    const newNode = new Node<K, V>(key, value, expiresAt);
    this.map.set(key, newNode);
    this.addNodeToHead(newNode);
  }


  delete(key: K): boolean {
    const node = this.map.get(key);
    if (!node) {
      return false;
    }
    this.removeNode(node);
    this.map.delete(key);
    return true;
  }


  has(key: K): boolean {
    const node = this.map.get(key);
    if (!node) {
      return false;
    }
    if (node.isExpired()) {
      this.removeNode(node);
      this.map.delete(key);
      return false;
    }
    return true;
  }


  get size(): number {
    return this.map.size;
  }

  get maxCapacity(): number {
    return this.capacity;
  }


  clear(): void {
    this.map.clear();
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  getLRUOrder(): K[] {
    const order: K[] = [];
    let current = this.head.next;
    while (current && current !== this.tail) {
      if (!current.isExpired()) {
        order.push(current.key);
      }
      current = current.next;
    }
    return order;
  }

  getDetailedState(): Array<{ key: K; value: V; expiresAt: number | null; isExpired: boolean }> {
    const state: Array<{ key: K; value: V; expiresAt: number | null; isExpired: boolean }> = [];
    const now = Date.now();
    let current = this.head.next;
    while (current && current !== this.tail) {
      state.push({
        key: current.key,
        value: current.value,
        expiresAt: current.expiresAt,
        isExpired: current.isExpired(now)
      });
      current = current.next;
    }
    return state;
  }


  cleanExpired(): number {
    const now = Date.now();
    let removedCount = 0;
    let current = this.head.next;

    while (current && current !== this.tail) {
      const next = current.next;
      if (current.isExpired(now)) {
        this.removeNode(current);
        this.map.delete(current.key);
        removedCount++;
      }
      current = next;
    }
    return removedCount;
  }


  private addNodeToHead(node: Node<K, V>): void {
    node.prev = this.head;
    node.next = this.head.next;

    if (this.head.next) {
      this.head.next.prev = node;
    }
    this.head.next = node;
  }


  private removeNode(node: Node<K, V>): void {
    const prev = node.prev;
    const next = node.next;

    if (prev) prev.next = next;
    if (next) next.prev = prev;

    node.prev = null;
    node.next = null;
  }

  private moveToHead(node: Node<K, V>): void {
    this.removeNode(node);
    this.addNodeToHead(node);
  }


  private popTail(): Node<K, V> | null {
    const lruNode = this.tail.prev;
    if (lruNode && lruNode !== this.head) {
      this.removeNode(lruNode);
      return lruNode;
    }
    return null;
  }
}


export const Cache = function <K = any, V = any>(capacity: number): LRUCache<K, V> {
  return new LRUCache<K, V>(capacity);
} as unknown as {
  new <K = any, V = any>(capacity: number): LRUCache<K, V>;
  <K = any, V = any>(capacity: number): LRUCache<K, V>;
};