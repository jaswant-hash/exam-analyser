/**
 * Recommendation Service
 * Generates personalized learning recommendations based on weak topics
 * Includes predefined resource dataset with explanations
 */

/**
 * Predefined resource dataset
 * Maps topics to learning resources with explanations
 */
const RESOURCE_DATABASE = {
  'CPU Scheduling': {
    resources: [
      {
        type: 'pdf',
        title: 'OS Fundamentals - Unit 2: CPU Scheduling',
        url: 'https://example.com/os-unit2.pdf',
        duration: '2-3 hours',
        difficulty: 'Medium',
      },
      {
        type: 'video',
        title: 'Round Robin Scheduling Explained',
        url: 'https://youtube.com/watch?v=example',
        duration: '45 minutes',
        difficulty: 'Medium',
      },
      {
        type: 'practice',
        title: 'Scheduling Algorithm Problems - Set A',
        url: 'https://example.com/practice/scheduling',
        problems: 15,
        difficulty: 'Medium',
      },
      {
        type: 'article',
        title: 'Understanding Time Quantum in Round Robin',
        url: 'https://example.com/articles/time-quantum',
        readTime: '15 minutes',
        difficulty: 'Easy',
      },
    ],
    reason: 'You missed time quantum and round robin scheduling concepts',
    priority: 'High',
  },

  Paging: {
    resources: [
      {
        type: 'pdf',
        title: 'Memory Management - Virtual Paging',
        url: 'https://example.com/paging-guide.pdf',
        duration: '1.5-2 hours',
        difficulty: 'Hard',
      },
      {
        type: 'video',
        title: 'Page Faults and Page Replacement Algorithms',
        url: 'https://youtube.com/watch?v=example',
        duration: '1 hour',
        difficulty: 'Hard',
      },
      {
        type: 'interactive',
        title: 'Virtual Address to Physical Address Translation',
        url: 'https://example.com/interactive/paging',
        difficulty: 'Hard',
      },
      {
        type: 'practice',
        title: 'Page Replacement Problem Set',
        url: 'https://example.com/practice/paging',
        problems: 20,
        difficulty: 'Hard',
      },
    ],
    reason: 'Page fault handling and frame allocation are critical gaps',
    priority: 'High',
  },

  Deadlock: {
    resources: [
      {
        type: 'pdf',
        title: 'Deadlock Detection and Prevention Strategies',
        url: 'https://example.com/deadlock-guide.pdf',
        duration: '2 hours',
        difficulty: 'Hard',
      },
      {
        type: 'video',
        title: 'Banker\'s Algorithm Deep Dive',
        url: 'https://youtube.com/watch?v=example',
        duration: '1.5 hours',
        difficulty: 'Hard',
      },
      {
        type: 'practice',
        title: 'Deadlock Prevention Exercises',
        url: 'https://example.com/practice/deadlock',
        problems: 25,
        difficulty: 'Hard',
      },
      {
        type: 'article',
        title: 'Understanding Circular Wait Condition',
        url: 'https://example.com/articles/circular-wait',
        readTime: '20 minutes',
        difficulty: 'Medium',
      },
    ],
    reason: 'Mutual exclusion and hold-and-wait concepts need reinforcement',
    priority: 'Medium',
  },

  'Memory Management': {
    resources: [
      {
        type: 'pdf',
        title: 'Memory Allocation and Fragmentation',
        url: 'https://example.com/memory-alloc.pdf',
        duration: '1.5 hours',
        difficulty: 'Medium',
      },
      {
        type: 'video',
        title: 'Swapping and Virtual Memory Concepts',
        url: 'https://youtube.com/watch?v=example',
        duration: '50 minutes',
        difficulty: 'Medium',
      },
      {
        type: 'practice',
        title: 'Memory Allocation Strategy Problems',
        url: 'https://example.com/practice/memory',
        problems: 18,
        difficulty: 'Medium',
      },
    ],
    reason: 'Fragmentation handling strategies need review',
    priority: 'Medium',
  },

  'File System': {
    resources: [
      {
        type: 'pdf',
        title: 'File System Organization and Inode Structure',
        url: 'https://example.com/filesystem.pdf',
        duration: '2 hours',
        difficulty: 'Medium',
      },
      {
        type: 'video',
        title: 'Understanding Inode and Directory Structure',
        url: 'https://youtube.com/watch?v=example',
        duration: '45 minutes',
        difficulty: 'Medium',
      },
      {
        type: 'practice',
        title: 'File Allocation and Management Problems',
        url: 'https://example.com/practice/filesystem',
        problems: 15,
        difficulty: 'Medium',
      },
    ],
    reason: 'Inode and directory concepts need clarification',
    priority: 'Low',
  },

  'Process Management': {
    resources: [
      {
        type: 'pdf',
        title: 'Process States and Context Switching',
        url: 'https://example.com/process-mgmt.pdf',
        duration: '1.5 hours',
        difficulty: 'Easy',
      },
      {
        type: 'video',
        title: 'Process Control Block (PCB) Explained',
        url: 'https://youtube.com/watch?v=example',
        duration: '30 minutes',
        difficulty: 'Easy',
      },
      {
        type: 'practice',
        title: 'Process Lifecycle Exercises',
        url: 'https://example.com/practice/process',
        problems: 12,
        difficulty: 'Easy',
      },
    ],
    reason: 'Process states and transitions need reinforcement',
    priority: 'Low',
  },

  'I/O Management': {
    resources: [
      { type: 'pdf', title: 'Input/Output Management and Techniques', url: 'https://example.com/io-mgmt.pdf', duration: '1 hour', difficulty: 'Medium' },
      { type: 'video', title: 'Interrupts, DMA, and Buffering Techniques', url: 'https://youtube.com/watch?v=io-mgmt', duration: '40 minutes', difficulty: 'Medium' },
      { type: 'practice', title: 'I/O Programming Problems', url: 'https://example.com/practice/io', problems: 10, difficulty: 'Medium' },
    ],
    reason: 'Interrupt handling and polling mechanisms need review',
    priority: 'Low',
  },

  // ── DBMS ──────────────────────────────────────────────────────────
  'SQL & Queries': {
    resources: [
      { type: 'video', title: 'SQL Joins and Subqueries Masterclass', url: 'https://www.youtube.com/results?search_query=sql+joins+subqueries', duration: '1.5 hours', difficulty: 'Medium' },
      { type: 'practice', title: 'LeetCode SQL Practice Problems', url: 'https://leetcode.com/problemset/database/', problems: 30, difficulty: 'Medium' },
      { type: 'article', title: 'SQL GROUP BY, HAVING and Aggregate Functions', url: 'https://www.w3schools.com/sql/sql_groupby.asp', readTime: '20 minutes', difficulty: 'Easy' },
      { type: 'pdf', title: 'Complete SQL Reference Guide', url: 'https://example.com/sql-guide.pdf', duration: '2 hours', difficulty: 'Medium' },
    ],
    reason: 'SQL query writing and JOIN operations need more practice',
    priority: 'High',
  },
  Normalization: {
    resources: [
      { type: 'video', title: 'Database Normalization (1NF, 2NF, 3NF, BCNF)', url: 'https://www.youtube.com/results?search_query=database+normalization+1nf+2nf+3nf', duration: '1 hour', difficulty: 'Medium' },
      { type: 'article', title: 'Functional Dependencies and Normalization Guide', url: 'https://www.geeksforgeeks.org/introduction-of-database-normalization/', readTime: '30 minutes', difficulty: 'Medium' },
      { type: 'practice', title: 'Normalization Worksheet Problems', url: 'https://example.com/practice/normalization', problems: 20, difficulty: 'Hard' },
    ],
    reason: 'Functional dependencies and normal forms need reinforcement',
    priority: 'High',
  },
  'ER Model': {
    resources: [
      { type: 'video', title: 'Entity Relationship Diagram (ERD) Tutorial', url: 'https://www.youtube.com/results?search_query=er+diagram+dbms+tutorial', duration: '45 minutes', difficulty: 'Easy' },
      { type: 'article', title: 'ER Model: Entities, Attributes, and Relationships', url: 'https://www.geeksforgeeks.org/introduction-of-er-model/', readTime: '20 minutes', difficulty: 'Easy' },
      { type: 'practice', title: 'Draw ER Diagrams — Practice Set', url: 'https://example.com/practice/er-model', problems: 12, difficulty: 'Medium' },
    ],
    reason: 'ER diagram modeling and cardinality concepts need review',
    priority: 'Medium',
  },
  Transactions: {
    resources: [
      { type: 'video', title: 'ACID Properties and Transaction Management', url: 'https://www.youtube.com/results?search_query=acid+properties+dbms+transactions', duration: '1 hour', difficulty: 'Medium' },
      { type: 'article', title: 'Concurrency Control and Two-Phase Locking', url: 'https://www.geeksforgeeks.org/concurrency-control-in-dbms/', readTime: '25 minutes', difficulty: 'Hard' },
      { type: 'practice', title: 'Transaction Serialization Problems', url: 'https://example.com/practice/transactions', problems: 15, difficulty: 'Hard' },
    ],
    reason: 'ACID properties and concurrency control need deeper understanding',
    priority: 'High',
  },
  Indexing: {
    resources: [
      { type: 'video', title: 'Database Indexing Explained — B-Tree & Hash', url: 'https://www.youtube.com/results?search_query=database+indexing+b+tree+hash', duration: '50 minutes', difficulty: 'Hard' },
      { type: 'article', title: 'Types of Indexes in DBMS', url: 'https://www.geeksforgeeks.org/indexing-in-databases-set-1/', readTime: '20 minutes', difficulty: 'Medium' },
    ],
    reason: 'Index structures and query optimization need attention',
    priority: 'Medium',
  },

  // ── COMPUTER NETWORKS ─────────────────────────────────────────────
  'OSI Model': {
    resources: [
      { type: 'video', title: 'OSI Model — All 7 Layers Explained', url: 'https://www.youtube.com/results?search_query=osi+model+7+layers+explained', duration: '45 minutes', difficulty: 'Easy' },
      { type: 'article', title: 'OSI vs TCP/IP Model Comparison', url: 'https://www.geeksforgeeks.org/tcp-ip-model/', readTime: '20 minutes', difficulty: 'Easy' },
      { type: 'practice', title: 'OSI Layer Quiz and Problems', url: 'https://example.com/practice/osi', problems: 20, difficulty: 'Easy' },
    ],
    reason: 'OSI layer functions and protocols need revision',
    priority: 'Medium',
  },
  'TCP/IP': {
    resources: [
      { type: 'video', title: 'TCP 3-Way Handshake and Flow Control', url: 'https://www.youtube.com/results?search_query=tcp+three+way+handshake+flow+control', duration: '1 hour', difficulty: 'Medium' },
      { type: 'article', title: 'TCP vs UDP: When to Use Which', url: 'https://www.geeksforgeeks.org/differences-between-tcp-and-udp/', readTime: '15 minutes', difficulty: 'Easy' },
      { type: 'practice', title: 'TCP/IP Networking Problems', url: 'https://example.com/practice/tcpip', problems: 18, difficulty: 'Medium' },
    ],
    reason: 'TCP handshake and congestion control mechanisms need review',
    priority: 'High',
  },
  Routing: {
    resources: [
      { type: 'video', title: 'Routing Algorithms — Dijkstra, Bellman-Ford', url: 'https://www.youtube.com/results?search_query=routing+algorithms+dijkstra+bellman+ford', duration: '1.5 hours', difficulty: 'Hard' },
      { type: 'article', title: 'Subnetting and CIDR Notation Guide', url: 'https://www.geeksforgeeks.org/introduction-to-subnetting/', readTime: '25 minutes', difficulty: 'Medium' },
      { type: 'practice', title: 'Subnetting Practice Problems', url: 'https://subnettingpractice.com/', problems: 25, difficulty: 'Hard' },
    ],
    reason: 'Routing table computation and subnetting need practice',
    priority: 'High',
  },
  'Network Security': {
    resources: [
      { type: 'video', title: 'SSL/TLS Explained — Symmetric & Asymmetric Encryption', url: 'https://www.youtube.com/results?search_query=ssl+tls+encryption+explained', duration: '1 hour', difficulty: 'Medium' },
      { type: 'article', title: 'Common Network Attacks and Defenses', url: 'https://www.geeksforgeeks.org/types-of-network-attacks/', readTime: '20 minutes', difficulty: 'Medium' },
    ],
    reason: 'Encryption protocols and security concepts need attention',
    priority: 'Medium',
  },

  // ── OOP ───────────────────────────────────────────────────────────
  'Classes & Objects': {
    resources: [
      { type: 'video', title: 'Classes and Objects in OOP — Complete Guide', url: 'https://www.youtube.com/results?search_query=classes+objects+oop+tutorial', duration: '1 hour', difficulty: 'Easy' },
      { type: 'practice', title: 'OOP Design Problems — HackerRank', url: 'https://www.hackerrank.com/domains/java', problems: 20, difficulty: 'Easy' },
      { type: 'article', title: 'Constructors and Object Initialization', url: 'https://www.geeksforgeeks.org/constructors-c/', readTime: '15 minutes', difficulty: 'Easy' },
    ],
    reason: 'Class design and object interaction concepts need review',
    priority: 'Medium',
  },
  Inheritance: {
    resources: [
      { type: 'video', title: 'Inheritance Types with Code Examples', url: 'https://www.youtube.com/results?search_query=inheritance+types+oop+examples', duration: '1 hour', difficulty: 'Medium' },
      { type: 'article', title: 'Method Overriding vs Overloading', url: 'https://www.geeksforgeeks.org/difference-between-method-overloading-and-method-overriding-in-java/', readTime: '20 minutes', difficulty: 'Medium' },
      { type: 'practice', title: 'Inheritance Design Problems', url: 'https://example.com/practice/inheritance', problems: 15, difficulty: 'Medium' },
    ],
    reason: 'Inheritance hierarchy and method overriding need reinforcement',
    priority: 'High',
  },
  Polymorphism: {
    resources: [
      { type: 'video', title: 'Runtime vs Compile-time Polymorphism', url: 'https://www.youtube.com/results?search_query=polymorphism+runtime+compile+oop', duration: '45 minutes', difficulty: 'Medium' },
      { type: 'article', title: 'Virtual Functions and Dynamic Dispatch', url: 'https://www.geeksforgeeks.org/virtual-functions-and-runtime-polymorphism-in-c-set-1-introduction/', readTime: '20 minutes', difficulty: 'Hard' },
    ],
    reason: 'Dynamic dispatch and virtual function concepts need attention',
    priority: 'High',
  },
  Encapsulation: {
    resources: [
      { type: 'video', title: 'Encapsulation and Data Hiding in OOP', url: 'https://www.youtube.com/results?search_query=encapsulation+data+hiding+oop', duration: '30 minutes', difficulty: 'Easy' },
      { type: 'article', title: 'Access Modifiers Explained', url: 'https://www.geeksforgeeks.org/access-modifiers-in-java/', readTime: '15 minutes', difficulty: 'Easy' },
    ],
    reason: 'Access control and encapsulation concepts need review',
    priority: 'Low',
  },
  'Design Patterns': {
    resources: [
      { type: 'video', title: 'Gang of Four Design Patterns Explained', url: 'https://www.youtube.com/results?search_query=design+patterns+gang+of+four', duration: '2 hours', difficulty: 'Hard' },
      { type: 'article', title: 'SOLID Principles with Examples', url: 'https://www.geeksforgeeks.org/solid-principle-in-programming-understand-with-real-life-examples/', readTime: '30 minutes', difficulty: 'Medium' },
      { type: 'practice', title: 'Design Pattern Implementation Exercises', url: 'https://refactoring.guru/design-patterns', problems: 10, difficulty: 'Hard' },
    ],
    reason: 'Design patterns and SOLID principles need deeper understanding',
    priority: 'Medium',
  },

  // ── DSA ───────────────────────────────────────────────────────────
  'Arrays & Strings': {
    resources: [
      { type: 'video', title: 'Array Problems — Two Pointer & Sliding Window', url: 'https://www.youtube.com/results?search_query=array+two+pointer+sliding+window', duration: '1.5 hours', difficulty: 'Medium' },
      { type: 'practice', title: 'LeetCode Array Problems (Easy to Hard)', url: 'https://leetcode.com/tag/array/', problems: 50, difficulty: 'Medium' },
      { type: 'article', title: 'Kadane\'s Algorithm and Prefix Sum Techniques', url: 'https://www.geeksforgeeks.org/largest-sum-contiguous-subarray/', readTime: '20 minutes', difficulty: 'Medium' },
    ],
    reason: 'Array manipulation techniques and pattern recognition need practice',
    priority: 'High',
  },
  'Linked Lists': {
    resources: [
      { type: 'video', title: 'Linked List Operations and Pointer Manipulation', url: 'https://www.youtube.com/results?search_query=linked+list+operations+pointers', duration: '1 hour', difficulty: 'Medium' },
      { type: 'practice', title: 'LeetCode Linked List Problems', url: 'https://leetcode.com/tag/linked-list/', problems: 25, difficulty: 'Medium' },
      { type: 'article', title: 'Floyd\'s Cycle Detection Algorithm', url: 'https://www.geeksforgeeks.org/detect-loop-in-a-linked-list/', readTime: '15 minutes', difficulty: 'Medium' },
    ],
    reason: 'Linked list pointer manipulation and cycle detection need attention',
    priority: 'High',
  },
  Trees: {
    resources: [
      { type: 'video', title: 'Binary Trees — All Traversals and BST Operations', url: 'https://www.youtube.com/results?search_query=binary+tree+traversal+bst', duration: '2 hours', difficulty: 'Medium' },
      { type: 'practice', title: 'LeetCode Tree Problems', url: 'https://leetcode.com/tag/tree/', problems: 40, difficulty: 'Medium' },
      { type: 'article', title: 'AVL Trees and Tree Balancing', url: 'https://www.geeksforgeeks.org/avl-tree-set-1-insertion/', readTime: '25 minutes', difficulty: 'Hard' },
    ],
    reason: 'Tree traversal and BST operations need reinforcement',
    priority: 'High',
  },
  Graphs: {
    resources: [
      { type: 'video', title: 'Graph Algorithms — BFS, DFS, Dijkstra', url: 'https://www.youtube.com/results?search_query=graph+algorithms+bfs+dfs+dijkstra', duration: '2.5 hours', difficulty: 'Hard' },
      { type: 'practice', title: 'LeetCode Graph Problems', url: 'https://leetcode.com/tag/graph/', problems: 35, difficulty: 'Hard' },
      { type: 'article', title: 'Minimum Spanning Tree — Kruskal and Prim', url: 'https://www.geeksforgeeks.org/kruskals-minimum-spanning-tree-algorithm-greedy-algo-2/', readTime: '25 minutes', difficulty: 'Hard' },
    ],
    reason: 'Graph traversal and shortest path algorithms need extensive practice',
    priority: 'High',
  },
  'Sorting Algorithms': {
    resources: [
      { type: 'video', title: 'All Sorting Algorithms Visualized and Explained', url: 'https://www.youtube.com/results?search_query=sorting+algorithms+visualized+explained', duration: '1.5 hours', difficulty: 'Medium' },
      { type: 'practice', title: 'Sorting Algorithm Implementation Practice', url: 'https://example.com/practice/sorting', problems: 20, difficulty: 'Medium' },
      { type: 'article', title: 'Quick Sort vs Merge Sort — When to Use', url: 'https://www.geeksforgeeks.org/quick-sort-vs-merge-sort/', readTime: '15 minutes', difficulty: 'Medium' },
    ],
    reason: 'Sorting algorithm complexity and implementation need review',
    priority: 'Medium',
  },
  'Dynamic Programming': {
    resources: [
      { type: 'video', title: 'Dynamic Programming Patterns — Complete Guide', url: 'https://www.youtube.com/results?search_query=dynamic+programming+patterns+complete', duration: '3 hours', difficulty: 'Hard' },
      { type: 'practice', title: 'LeetCode DP Problems (Top 50)', url: 'https://leetcode.com/tag/dynamic-programming/', problems: 50, difficulty: 'Hard' },
      { type: 'article', title: 'Memoization vs Tabulation Explained', url: 'https://www.geeksforgeeks.org/tabulation-vs-memoization/', readTime: '20 minutes', difficulty: 'Medium' },
    ],
    reason: 'DP state transitions and problem identification need more practice',
    priority: 'High',
  },
};

/**
 * Generate personalized recommendations based on weak topics
 * @param {Array} weakTopics - Array of weak topics from analysis
 * @returns {Array} Personalized recommendations with explanations
 */
export const generateRecommendations = (weakTopics) => {
  try {
    if (!Array.isArray(weakTopics) || weakTopics.length === 0) {
      return [];
    }

    const recommendations = weakTopics
      .map((weak) => {
        const topicData = RESOURCE_DATABASE[weak.topic];

        if (!topicData) {
          return {
            topic: weak.topic,
            status: 'no_resources',
            message: `Resources for ${weak.topic} are being updated`,
          };
        }

        return {
          topic: weak.topic,
          weaknessLevel: weak.weaknessLevel,
          priority: topicData.priority,
          explanation: topicData.reason,
          resources: topicData.resources,
          recommendedSequence: orderResourcesByDifficulty(
            topicData.resources
          ),
          estimatedTime: calculateEstimatedTime(topicData.resources),
        };
      })
      .filter((rec) => rec.status !== 'no_resources');

    // Sort by priority
    return recommendations.sort((a, b) => {
      const priorityOrder = { High: 0, Medium: 1, Low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  } catch (error) {
    throw new Error(`Recommendation generation failed: ${error.message}`);
  }
};

/**
 * Order resources by difficulty (easy to hard)
 * @param {Array} resources - Resource array
 * @returns {Array} Ordered resources
 */
const orderResourcesByDifficulty = (resources) => {
  const difficultyOrder = { Easy: 0, Medium: 1, Hard: 2 };

  return [...resources].sort(
    (a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
  );
};

/**
 * Calculate total estimated time for resources
 * @param {Array} resources - Resource array
 * @returns {string} Estimated time string
 */
const calculateEstimatedTime = (resources) => {
  try {
    let totalMinutes = 0;

    resources.forEach((resource) => {
      const duration = resource.duration || '';

      // Parse video duration (e.g., "45 minutes")
      if (resource.type === 'video') {
        const match = duration.match(/(\d+)\s*(?:hour|hr|h)?:?(\d*)\s*(?:minute|min|m)?s?/i);
        if (match) {
          const hours = parseInt(match[1]) || 0;
          const minutes = parseInt(match[2]) || 0;
          totalMinutes += hours * 60 + minutes;
        }
      }

      // Parse PDF duration (e.g., "2-3 hours")
      if (resource.type === 'pdf') {
        const match = duration.match(/(\d+)(?:-(\d+))?\s*(?:hour|hr|h)/i);
        if (match) {
          const startHours = parseInt(match[1]) || 0;
          const endHours = parseInt(match[2]) || startHours;
          const avgHours = (startHours + endHours) / 2;
          totalMinutes += avgHours * 60;
        }
      }

      // Practice sets: assume 5 minutes per problem
      if (resource.type === 'practice' && resource.problems) {
        totalMinutes += resource.problems * 5;
      }

      // Article: parse readTime (e.g., "15 minutes")
      if (resource.type === 'article' && resource.readTime) {
        const match = resource.readTime.match(/(\d+)\s*(?:minute|min)/i);
        if (match) {
          totalMinutes += parseInt(match[1]) || 0;
        }
      }
    });

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours} hours`;
    } else {
      return `${minutes} minutes`;
    }
  } catch (error) {
    return 'Time to be determined';
  }
};

/**
 * Get a single recommendation with full details
 * @param {string} topic - Topic name
 * @returns {Object} Detailed recommendation
 */
export const getTopicRecommendation = (topic) => {
  try {
    const topicData = RESOURCE_DATABASE[topic];

    if (!topicData) {
      throw new Error(`No recommendations available for ${topic}`);
    }

    return {
      topic,
      priority: topicData.priority,
      explanation: topicData.reason,
      resources: topicData.resources,
      learningPath: generateLearningPath(topicData.resources),
    };
  } catch (error) {
    throw new Error(`Topic recommendation retrieval failed: ${error.message}`);
  }
};

/**
 * Generate a structured learning path
 * @param {Array} resources - Resource array
 * @returns {Array} Structured learning path
 */
const generateLearningPath = (resources) => {
  const ordered = orderResourcesByDifficulty(resources);

  return ordered.map((resource, index) => ({
    step: index + 1,
    resource: resource.title,
    type: resource.type,
    duration: resource.duration || resource.readTime || 'Variable',
    difficulty: resource.difficulty,
    url: resource.url,
  }));
};

/**
 * Get all available topics with recommendations
 * @returns {Array} All available topics
 */
export const getAllAvailableTopics = () => {
  return Object.keys(RESOURCE_DATABASE).map((topic) => ({
    topic,
    priority: RESOURCE_DATABASE[topic].priority,
    resourceCount: RESOURCE_DATABASE[topic].resources.length,
  }));
};

/**
 * Generate a study schedule based on recommendations
 * @param {Array} recommendations - Recommendations array
 * @param {number} daysAvailable - Number of days available for study
 * @returns {Array} Daily study schedule
 */
export const generateStudySchedule = (recommendations, daysAvailable = 7) => {
  try {
    if (!Array.isArray(recommendations) || daysAvailable < 1) {
      throw new Error('Invalid recommendations or days available');
    }

    const schedule = [];
    let resourceIndex = 0;
    const allResources = [];

    // Flatten all resources from recommendations
    recommendations.forEach((rec) => {
      rec.resources.forEach((resource) => {
        allResources.push({
          ...resource,
          topic: rec.topic,
          priority: rec.priority,
        });
      });
    });

    // Distribute resources across days
    const resourcesPerDay = Math.max(
      1,
      Math.ceil(allResources.length / daysAvailable)
    );

    for (let day = 1; day <= daysAvailable; day++) {
      const dayResources = allResources.slice(
        (day - 1) * resourcesPerDay,
        day * resourcesPerDay
      );

      if (dayResources.length > 0) {
        schedule.push({
          day,
          theme: dayResources[0].topic,
          resources: dayResources,
          estimatedTime: calculateEstimatedTime(dayResources),
        });
      }
    }

    return schedule;
  } catch (error) {
    throw new Error(`Study schedule generation failed: ${error.message}`);
  }
};

export default {
  generateRecommendations,
  getTopicRecommendation,
  getAllAvailableTopics,
  generateStudySchedule,
};
