import { describe, it, expect, vi } from "vitest";
import { LRUCache, Cache } from "../src/lru-cache";

describe("LRU Cache - Core Specification Requirements", () => {
  it("should execute the prompt's reference example accurately", () => {


    const cache = Cache<string, number>(2);

    cache.put("A", 10);
    cache.put("B", 20);
    expect(cache.get("A")).toBe(10); // A becomes MRU; order: A (MRU), B (LRU)

    cache.put("C", 30); // B is evicted
    expect(cache.get("B")).toBe(-1); // Evicted!
    expect(cache.get("C")).toBe(30);
    expect(cache.get("A")).toBe(10);
  });

  it("should validate capacity must be a positive integer", () => {
    expect(() => new LRUCache(0)).toThrow(/positive integer/i);
    expect(() => new LRUCache(-5)).toThrow(/positive integer/i);
    expect(() => new LRUCache(1.5)).toThrow(/positive integer/i);
    expect(() => Cache(NaN as any)).toThrow(/positive integer/i);
  });

  it("should return -1 for keys that have never been added", () => {
    const cache = new LRUCache<string, number>(3);
    expect(cache.get("non-existent")).toBe(-1);
  });

  it("should update an existing key's value without increasing cache size or evicting", () => {
    const cache = new LRUCache<string, number>(2);
    cache.put("A", 10);
    cache.put("B", 20);
    expect(cache.size).toBe(2);

   
    cache.put("A", 15);
    expect(cache.size).toBe(2);
    expect(cache.get("A")).toBe(15);

   
    cache.put("C", 30);
    expect(cache.get("A")).toBe(15);
    expect(cache.get("B")).toBe(-1);
    expect(cache.get("C")).toBe(30);
  });

  it("should correctly handle capacity of 1", () => {
    const cache = new LRUCache<string, number>(1);
    cache.put("first", 100);
    expect(cache.get("first")).toBe(100);

    cache.put("second", 200);
    expect(cache.get("first")).toBe(-1);
    expect(cache.get("second")).toBe(200);
  });

  it("should track LRU order accurately", () => {
    const cache = new LRUCache<string, number>(3);
    cache.put("x", 1);
    cache.put("y", 2);
    cache.put("z", 3);

    expect(cache.getLRUOrder()).toEqual(["z", "y", "x"]);

   
    cache.get("x");
    expect(cache.getLRUOrder()).toEqual(["x", "z", "y"]);


    cache.put("w", 4);
    expect(cache.getLRUOrder()).toEqual(["w", "x", "z"]);
    expect(cache.get("y")).toBe(-1);
  });

  it("should support delete, has, and clear operations", () => {
    const cache = new LRUCache<string, string>(2);
    cache.put("k1", "v1");
    cache.put("k2", "v2");

    expect(cache.has("k1")).toBe(true);
    expect(cache.delete("k1")).toBe(true);
    expect(cache.delete("k1")).toBe(false);
    expect(cache.get("k1")).toBe(-1);
    expect(cache.size).toBe(1);

    cache.clear();
    expect(cache.size).toBe(0);
    expect(cache.get("k2")).toBe(-1);
  });
});

describe("LRU Cache - Bonus TTL / Expiration Support", () => {
  it("should expire items after TTL elapsed", async () => {
    vi.useFakeTimers();
    const cache = new LRUCache<string, string>(3);

  
    cache.put("tempKey", "temporaryValue", 1000);
    cache.put("permanentKey", "permanentValue");

  
    expect(cache.get("tempKey")).toBe("temporaryValue");
    expect(cache.get("permanentKey")).toBe("permanentValue");


    vi.advanceTimersByTime(1001);

  
    expect(cache.get("tempKey")).toBe(-1);
    expect(cache.has("tempKey")).toBe(false);


    expect(cache.get("permanentKey")).toBe("permanentValue");

    vi.useRealTimers();
  });

  it("should actively clean expired items with cleanExpired()", () => {
    vi.useFakeTimers();
    const cache = new LRUCache<string, number>(4);

    cache.put("a", 1, 500);
    cache.put("b", 2, 1500);
    cache.put("c", 3); 

    vi.advanceTimersByTime(600);

   
    const pruned = cache.cleanExpired();
    expect(pruned).toBe(1);
    expect(cache.size).toBe(2);
    expect(cache.get("a")).toBe(-1);
    expect(cache.get("b")).toBe(2);
    expect(cache.get("c")).toBe(3);

    vi.useRealTimers();
  });
});
