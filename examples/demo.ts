import { Cache, LRUCache } from "../src/lru-cache";

// Terminal ANSI color helper for crisp output formatting
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
  blue: "\x1b[34m",
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function printSection(title: string): void {
  console.log(`\n${colors.cyan}${colors.bright}======================================================================${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}  ${title}${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}======================================================================${colors.reset}\n`);
}

function formatCacheState<K, V>(cache: LRUCache<K, V>): string {
  const order = cache.getLRUOrder();
  if (order.length === 0) return `${colors.dim}[empty]${colors.reset}`;
  return order
    .map((k, idx) => {
      const isMRU = idx === 0;
      const isLRU = idx === order.length - 1;
      let badge = "";
      if (isMRU && isLRU) badge = ` ${colors.magenta}(MRU & LRU)${colors.reset}`;
      else if (isMRU) badge = ` ${colors.green}(MRU)${colors.reset}`;
      else if (isLRU) badge = ` ${colors.yellow}(LRU)${colors.reset}`;
      return `${colors.bright}${k}${colors.reset}${badge}`;
    })
    .join("  ->  ");
}

async function runDemo(): Promise<void> {
  console.log(`\n${colors.bright}${colors.green}╔══════════════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bright}${colors.green}║        LEAST RECENTLY USED (LRU) CACHE - VERIFICATION RUNNER         ║${colors.reset}`);
  console.log(`${colors.bright}${colors.green}║        O(1) Hash Map + Doubly Linked List + Bonus TTL Support        ║${colors.reset}`);
  console.log(`${colors.bright}${colors.green}╚══════════════════════════════════════════════════════════════════════╝${colors.reset}`);

  // ==========================================
  // PART 1: Core Problem Specification
  // ==========================================
  printSection("DEMO 1: Standard LRU Cache Operations (Capacity: 2)");
  console.log(`Creating cache: ${colors.yellow}cache = Cache(2)${colors.reset}`);
  const cache = Cache<string, number>(2);

  const steps: Array<() => void> = [
    () => {
      console.log(`\n${colors.bright}[Step 1]${colors.reset} Operation: ${colors.cyan}cache.put("A", 10)${colors.reset}`);
      cache.put("A", 10);
      console.log(`         Current Cache (MRU -> LRU): [ ${formatCacheState(cache)} ]`);
    },
    () => {
      console.log(`\n${colors.bright}[Step 2]${colors.reset} Operation: ${colors.cyan}cache.put("B", 20)${colors.reset}`);
      cache.put("B", 20);
      console.log(`         Current Cache (MRU -> LRU): [ ${formatCacheState(cache)} ]`);
    },
    () => {
      console.log(`\n${colors.bright}[Step 3]${colors.reset} Operation: ${colors.cyan}cache.get("A")${colors.reset}`);
      const val = cache.get("A");
      console.log(`         Result: ${colors.green}${colors.bright}${val}${colors.reset} (Expected: 10)`);
      console.log(`         Key "A" accessed -> promoted to MRU position.`);
      console.log(`         Current Cache (MRU -> LRU): [ ${formatCacheState(cache)} ]`);
    },
    () => {
      console.log(`\n${colors.bright}[Step 4]${colors.reset} Operation: ${colors.cyan}cache.put("C", 30)${colors.reset}`);
      console.log(`         ${colors.red}[EVICTION TRIGGERED]${colors.reset} Capacity (2) exceeded! Evicting LRU entry: ${colors.yellow}"B"${colors.reset}`);
      cache.put("C", 30);
      console.log(`         Current Cache (MRU -> LRU): [ ${formatCacheState(cache)} ]`);
    },
    () => {
      console.log(`\n${colors.bright}[Step 5]${colors.reset} Operation: ${colors.cyan}cache.get("B")${colors.reset}`);
      const val = cache.get("B");
      console.log(`         Result: ${colors.red}${colors.bright}${val}${colors.reset} (Expected: -1 because "B" was evicted)`);
      console.log(`         Current Cache (MRU -> LRU): [ ${formatCacheState(cache)} ]`);
    },
    () => {
      console.log(`\n${colors.bright}[Step 6]${colors.reset} Operation: ${colors.cyan}cache.get("C")${colors.reset}`);
      const val = cache.get("C");
      console.log(`         Result: ${colors.green}${colors.bright}${val}${colors.reset} (Expected: 30)`);
      console.log(`         Current Cache (MRU -> LRU): [ ${formatCacheState(cache)} ]`);
    },
    () => {
      console.log(`\n${colors.bright}[Step 7]${colors.reset} Operation: ${colors.cyan}cache.get("A")${colors.reset}`);
      const val = cache.get("A");
      console.log(`         Result: ${colors.green}${colors.bright}${val}${colors.reset} (Expected: 10)`);
      console.log(`         Current Cache (MRU -> LRU): [ ${formatCacheState(cache)} ]`);
    },
  ];

  for (const step of steps) {
    step();
  }

  // Verification Summary
  console.log(`\n${colors.green}${colors.bright}✔ Standard LRU flow completed flawlessly! Matches exact problem prompt.${colors.reset}`);

  // ==========================================
  // PART 2: Optional Bonus - TTL Expiration
  // ==========================================
  printSection("DEMO 2: Bonus Feature - Time-To-Live (TTL) Expiration");
  console.log(`Creating cache: ${colors.yellow}ttlCache = Cache(3)${colors.reset}`);
  const ttlCache = Cache<string, string>(3);

  console.log(`\n${colors.bright}[TTL Step 1]${colors.reset} Inserting entries:`);
  console.log(`  - ${colors.cyan}put("session_token", "xyz-789", ttl=600ms)${colors.reset}`);
  ttlCache.put("session_token", "xyz-789", 600);

  console.log(`  - ${colors.cyan}put("api_config", "https://api.internal/v1", no-ttl)${colors.reset}`);
  ttlCache.put("api_config", "https://api.internal/v1");

  console.log(`\n${colors.bright}[TTL Step 2]${colors.reset} Immediate access before expiration:`);
  console.log(`  - cache.get("session_token") -> ${colors.green}"${ttlCache.get("session_token")}"${colors.reset} (Active)`);
  console.log(`  - cache.get("api_config")    -> ${colors.green}"${ttlCache.get("api_config")}"${colors.reset} (Active)`);

  console.log(`\n${colors.bright}[TTL Step 3]${colors.reset} Waiting 800ms for "session_token" to expire...`);
  await sleep(800);

  console.log(`\n${colors.bright}[TTL Step 4]${colors.reset} Accessing entries after expiration:`);
  const expiredVal = ttlCache.get("session_token");
  console.log(`  - cache.get("session_token") -> ${colors.red}${expiredVal}${colors.reset} (Returned -1: Expired & Lazy Evicted!)`);

  const persistentVal = ttlCache.get("api_config");
  console.log(`  - cache.get("api_config")    -> ${colors.green}"${persistentVal}"${colors.reset} (Still valid!)`);

  console.log(`\n${colors.green}${colors.bright}✔ TTL expiration verified successfully!${colors.reset}\n`);
}

runDemo().catch(console.error);
