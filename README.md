# Custom LRU Cache Implementation

## Overview
A custom TypeScript implementation of a Least Recently Used (LRU) Cache using a Hash Map paired with a Doubly Linked List to achieve guaranteed average $O(1)$ time complexity for both `get` and `put` operations.

## Data Structures Used
1. **Hash Map (`Map<K, Node<K, V>>`)**: Provides $O(1)$ direct reference lookup to linked list nodes by key.
2. **Doubly Linked List (`Node<K, V>`)**: Maintains recency ordering. Allows $O(1)$ insertion at the head (Most Recently Used) and deletion from the tail (Least Recently Used) once node references are retrieved from the Hash Map.

## Complexities
- **Time Complexity**: 
  - `get(key)`: $O(1)$ average.
  - `put(key, value)`: $O(1)$ average.
- **Space Complexity**: $O(N)$ where $N$ is the designated capacity of the cache.

## How to Run

### Install Dependencies
```bash
npm install