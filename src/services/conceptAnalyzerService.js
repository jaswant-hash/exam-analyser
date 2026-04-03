/**
 * Concept Analyzer Service
 * Identifies concept-level weaknesses by comparing expected vs actual keywords
 * Core logic for intelligent weakness detection
 */

/**
 * Predefined concept keyword map
 * Maps each concept to its fundamental keywords
 */
const CONCEPT_KEYWORDS = {
  'CPU Scheduling': {
    fundamentals: [
      'first come first served',
      'fcfs',
      'round robin',
      'time quantum',
      'shortest job first',
      'sjf',
      'priority scheduling',
    ],
    advanced: [
      'preemptive',
      'non-preemptive',
      'context switch',
      'starvation',
      'aging',
    ],
    calculations: ['burst time', 'waiting time', 'turnaround time', 'response time'],
  },
  Paging: {
    fundamentals: [
      'page fault',
      'frame',
      'offset',
      'page table',
      'page size',
    ],
    advanced: [
      'virtual address',
      'physical address',
      'page replacement',
      'tlb',
      'translation lookaside buffer',
    ],
    algorithms: ['fifo', 'lru', 'lfu', 'optimal page replacement'],
  },
  Deadlock: {
    fundamentals: [
      'mutual exclusion',
      'hold and wait',
      'circular wait',
      'no preemption',
      'deadlock condition',
    ],
    advanced: ['deadlock detection', 'deadlock prevention', 'deadlock avoidance'],
    algorithms: ['bankers algorithm', 'wait-for graph', 'resource allocation graph'],
  },
  'Memory Management': {
    fundamentals: [
      'memory allocation',
      'fragmentation',
      'external fragmentation',
      'internal fragmentation',
    ],
    strategies: ['swapping', 'segmentation', 'paging', 'virtual memory'],
    optimization: ['cache', 'memory hierarchy', 'locality of reference'],
  },
  'File System': {
    fundamentals: [
      'inode',
      'directory',
      'file allocation',
      'file descriptor',
    ],
    advanced: ['free space management', 'fat', 'ext4', 'acl'],
    concepts: ['hard link', 'soft link', 'permission', 'ownership'],
  },
  'Process Management': {
    fundamentals: [
      'process state',
      'context switch',
      'pcb',
      'process control block',
    ],
    synchronization: ['process synchronization', 'semaphore', 'mutex', 'critical section'],
    concepts: ['parent process', 'child process', 'orphan process', 'zombie process'],
  },
  'I/O Management': {
    fundamentals: ['interrupt', 'dma', 'buffering', 'spooling', 'io controller'],
    techniques: ['polling', 'asynchronous io'],
    management: ['io scheduling', 'io optimization'],
  },

  // ── DBMS ──────────────────────────────────────────────────────────
  'SQL & Queries': {
    fundamentals: ['select', 'from', 'where', 'join', 'group by', 'having', 'order by'],
    advanced: ['inner join', 'left join', 'right join', 'outer join', 'subquery', 'nested query'],
    functions: ['aggregate', 'count', 'sum', 'avg', 'max', 'min'],
  },
  Normalization: {
    fundamentals: ['1nf', 'first normal form', '2nf', 'second normal form', '3nf', 'third normal form', 'bcnf'],
    advanced: ['functional dependency', 'partial dependency', 'transitive dependency', 'candidate key'],
    concepts: ['decomposition', 'lossless join', 'dependency preservation'],
  },
  'ER Model': {
    fundamentals: ['entity', 'attribute', 'relationship', 'primary key', 'foreign key', 'er diagram'],
    advanced: ['weak entity', 'cardinality', 'participation constraint', 'generalization', 'specialization'],
    concepts: ['one to one', 'one to many', 'many to many'],
  },
  Transactions: {
    fundamentals: ['acid', 'atomicity', 'consistency', 'isolation', 'durability', 'commit', 'rollback'],
    advanced: ['concurrency control', 'serializability', 'deadlock', 'two phase locking', '2pl'],
    recovery: ['checkpoint', 'redo log', 'undo log', 'write ahead logging', 'wal'],
  },
  Indexing: {
    fundamentals: ['index', 'b-tree', 'b+ tree', 'hash index', 'clustered index', 'non-clustered'],
    advanced: ['dense index', 'sparse index', 'multilevel index', 'inverted index'],
    concepts: ['primary index', 'secondary index', 'search key'],
  },

  // ── COMPUTER NETWORKS ─────────────────────────────────────────────
  'OSI Model': {
    fundamentals: ['physical layer', 'data link layer', 'network layer', 'transport layer', 'session layer', 'presentation layer', 'application layer'],
    advanced: ['encapsulation', 'protocol data unit', 'pdu', 'peer to peer communication'],
    protocols: ['ethernet', 'arp', 'ip', 'tcp', 'udp', 'http', 'dns', 'ftp', 'smtp'],
  },
  'TCP/IP': {
    fundamentals: ['tcp', 'udp', 'ip address', 'port', 'socket', 'three way handshake', 'syn', 'ack'],
    advanced: ['flow control', 'congestion control', 'sliding window', 'sequence number', 'checksum'],
    concepts: ['connection oriented', 'connectionless', 'reliable', 'unreliable'],
  },
  Routing: {
    fundamentals: ['routing table', 'router', 'default gateway', 'hop count', 'next hop'],
    algorithms: ['dijkstra', 'bellman ford', 'distance vector', 'link state', 'rip', 'ospf', 'bgp'],
    concepts: ['subnetting', 'cidr', 'nat', 'ipv4', 'ipv6'],
  },
  'Network Security': {
    fundamentals: ['firewall', 'encryption', 'decryption', 'authentication', 'authorization'],
    protocols: ['ssl', 'tls', 'https', 'vpn', 'ipsec', 'ssh'],
    attacks: ['dos', 'ddos', 'man in the middle', 'phishing', 'sql injection', 'xss'],
  },

  // ── OOP ───────────────────────────────────────────────────────────
  'Classes & Objects': {
    fundamentals: ['class', 'object', 'instance', 'constructor', 'destructor', 'method', 'attribute'],
    advanced: ['static', 'instance variable', 'this keyword', 'new keyword'],
    concepts: ['blueprint', 'instantiation', 'object state', 'object behavior'],
  },
  Inheritance: {
    fundamentals: ['inheritance', 'parent class', 'child class', 'base class', 'derived class', 'extends', 'super'],
    types: ['single inheritance', 'multiple inheritance', 'multilevel inheritance', 'hierarchical inheritance', 'hybrid'],
    concepts: ['method override', 'is-a relationship', 'code reuse'],
  },
  Polymorphism: {
    fundamentals: ['polymorphism', 'method overloading', 'method overriding', 'runtime polymorphism', 'compile time'],
    advanced: ['virtual function', 'abstract method', 'interface', 'dynamic dispatch'],
    concepts: ['duck typing', 'function signature', 'binding'],
  },
  Encapsulation: {
    fundamentals: ['encapsulation', 'access modifier', 'private', 'public', 'protected', 'getter', 'setter'],
    advanced: ['data hiding', 'abstraction', 'information hiding'],
    concepts: ['cohesion', 'coupling', 'modularity'],
  },
  'Design Patterns': {
    fundamentals: ['singleton', 'factory', 'observer', 'strategy', 'decorator', 'adapter'],
    advanced: ['creational pattern', 'structural pattern', 'behavioral pattern', 'mvc', 'solid'],
    concepts: ['design principle', 'open closed', 'dependency injection'],
  },

  // ── DATA STRUCTURES & ALGORITHMS ─────────────────────────────────
  'Arrays & Strings': {
    fundamentals: ['array', 'string', 'index', 'traverse', 'two pointer', 'sliding window'],
    advanced: ['kadane', 'prefix sum', 'suffix array', 'substring', 'anagram'],
    complexity: ['time complexity', 'space complexity', 'big o'],
  },
  'Linked Lists': {
    fundamentals: ['linked list', 'node', 'pointer', 'singly linked', 'doubly linked', 'circular linked'],
    operations: ['insert', 'delete', 'traverse', 'reverse', 'merge', 'detect cycle'],
    advanced: ['floyd cycle detection', 'tortoise hare', 'fast pointer slow pointer'],
  },
  Trees: {
    fundamentals: ['tree', 'root', 'node', 'leaf', 'height', 'depth', 'binary tree', 'bst'],
    traversal: ['inorder', 'preorder', 'postorder', 'level order', 'bfs', 'dfs'],
    advanced: ['avl tree', 'red black tree', 'heap', 'trie', 'segment tree', 'balanced'],
  },
  Graphs: {
    fundamentals: ['graph', 'vertex', 'edge', 'directed', 'undirected', 'weighted', 'adjacency matrix', 'adjacency list'],
    algorithms: ['bfs', 'dfs', 'dijkstra', 'bellman ford', 'floyd warshall', 'kruskal', 'prim'],
    concepts: ['topological sort', 'cycle detection', 'connected components', 'minimum spanning tree'],
  },
  'Sorting Algorithms': {
    fundamentals: ['bubble sort', 'selection sort', 'insertion sort', 'merge sort', 'quick sort', 'heap sort'],
    advanced: ['counting sort', 'radix sort', 'bucket sort', 'stable sort', 'in place sort'],
    complexity: ['best case', 'worst case', 'average case', 'comparison based'],
  },
  'Dynamic Programming': {
    fundamentals: ['dynamic programming', 'memoization', 'tabulation', 'overlapping subproblems', 'optimal substructure'],
    problems: ['knapsack', 'longest common subsequence', 'lcs', 'edit distance', 'coin change', 'fibonacci'],
    advanced: ['dp on trees', 'bitmask dp', 'state transition'],
  },
};

/**
 * Detect weak concepts based on extracted text
 * Analyzes keywords to identify missing fundamental concepts
 * @param {string} answerText - User's answer or extracted text
 * @param {string[]} selectedTopics - Topics the student was tested on (optional, analyzes all if empty)
 * @param {Object} customSyllabusMap - Dynamically extracted syllabus map (optional)
 * @returns {Object} Weak concepts analysis
 */
export const detectWeakConcepts = (answerText, selectedTopics = [], customSyllabusMap = null) => {
  try {
    if (!answerText || typeof answerText !== 'string') {
      throw new Error('Invalid answer text provided');
    }

    const lowerText = answerText.toLowerCase();
    const analysis = {
      detectedConcepts: [],
      missingConcepts: [],
      weakTopics: [],
      confidenceScore: 0,
      analysisDetails: {},
    };

    let totalConceptsChecked = 0;
    let conceptsFound = 0;

    // Use custom syllabus map if provided, otherwise fallback to hardcoded CONCEPT_KEYWORDS
    const keywordDataSource = customSyllabusMap || CONCEPT_KEYWORDS;
    
    // Filter to only selected topics if provided (and if we aren't using a custom syllabus which is already filtered), else analyze all
    const allEntries = Object.entries(keywordDataSource);
    const topicsToAnalyze = selectedTopics.length > 0 && !customSyllabusMap
      ? allEntries.filter(([topic]) => selectedTopics.includes(topic))
      : allEntries;

    // Analyze each concept
    for (const [topic, categories] of topicsToAnalyze) {
      const topicAnalysis = {
        topic,
        fundamentalsFound: [],
        fundamentalsMissing: [],
        advancedFound: [],
        advancedMissing: [],
        score: 0,
        coverage: 0,
      };

      // Check fundamentals
      for (const keyword of categories.fundamentals || []) {
        totalConceptsChecked++;
        if (lowerText.includes(keyword.toLowerCase())) {
          topicAnalysis.fundamentalsFound.push(keyword);
          conceptsFound++;
        } else {
          topicAnalysis.fundamentalsMissing.push(keyword);
        }
      }

      // Check advanced concepts
      for (const keyword of categories.advanced || []) {
        totalConceptsChecked++;
        if (lowerText.includes(keyword.toLowerCase())) {
          topicAnalysis.advancedFound.push(keyword);
          conceptsFound++;
        } else {
          topicAnalysis.advancedMissing.push(keyword);
        }
      }

      // Calculate topic-level metrics
      const fundamentalsCount = categories.fundamentals?.length || 0;
      const fundamentalsFoundCount = topicAnalysis.fundamentalsFound.length;

      if (fundamentalsCount > 0) {
        topicAnalysis.coverage = (fundamentalsFoundCount / fundamentalsCount) * 100;
      }

      topicAnalysis.score = Math.round(topicAnalysis.coverage);

      analysis.analysisDetails[topic] = topicAnalysis;

      // Classify based on fundamental coverage
      if (topicAnalysis.coverage < 40) {
        analysis.weakTopics.push({
          topic,
          weaknessLevel: 'Critical',
          coverage: Math.round(topicAnalysis.coverage),
          fundamentalsCovered: fundamentalsFoundCount,
          fundamentalsTotal: fundamentalsCount,
        });
        analysis.missingConcepts.push(...topicAnalysis.fundamentalsMissing);
      } else if (topicAnalysis.coverage < 70) {
        analysis.weakTopics.push({
          topic,
          weaknessLevel: 'High',
          coverage: Math.round(topicAnalysis.coverage),
          fundamentalsCovered: fundamentalsFoundCount,
          fundamentalsTotal: fundamentalsCount,
        });
        analysis.missingConcepts.push(...topicAnalysis.fundamentalsMissing);
      } else if (topicAnalysis.coverage < 100) {
        analysis.weakTopics.push({
          topic,
          weaknessLevel: 'Medium',
          coverage: Math.round(topicAnalysis.coverage),
          fundamentalsCovered: fundamentalsFoundCount,
          fundamentalsTotal: fundamentalsCount,
        });
      } else {
        analysis.detectedConcepts.push({
          topic,
          coverage: 100,
          allFundamentalsCovered: true,
        });
      }
    }

    // Calculate overall confidence score
    analysis.confidenceScore =
      totalConceptsChecked > 0
        ? Math.round((conceptsFound / totalConceptsChecked) * 100)
        : 0;

    // Remove duplicates from missing concepts
    analysis.missingConcepts = [...new Set(analysis.missingConcepts)];

    return analysis;
  } catch (error) {
    throw new Error(`Concept detection failed: ${error.message}`);
  }
};

/**
 * Compare expected vs actual concepts
 * More advanced analysis comparing answer quality
 * @param {string} expectedConcepts - Expected concepts (topic keywords)
 * @param {string} actualAnswerText - Student's actual answer
 * @returns {Object} Comparison analysis
 */
export const compareExpectedVsActual = (expectedConcepts, actualAnswerText) => {
  try {
    if (!expectedConcepts || !actualAnswerText) {
      throw new Error('Invalid expected concepts or answer text');
    }

    const expected = Array.isArray(expectedConcepts)
      ? expectedConcepts
      : expectedConcepts.split(',');
    const actual = detectWeakConcepts(actualAnswerText);

    const comparison = {
      expectedTopics: expected,
      actualAnalysis: actual,
      gaps: [],
      strengths: [],
      overallAssessment: '',
    };

    // Identify gaps
    for (const topic of expected) {
      const topicData = actual.analysisDetails[topic];
      if (topicData && topicData.coverage < 70) {
        comparison.gaps.push({
          topic,
          coverage: topicData.coverage,
          missingFundamentals: topicData.fundamentalsMissing,
        });
      }
    }

    // Identify strengths
    for (const concept of actual.detectedConcepts) {
      comparison.strengths.push({
        topic: concept.topic,
        coverage: concept.coverage,
      });
    }

    // Generate overall assessment
    if (actual.confidenceScore >= 80) {
      comparison.overallAssessment = 'Excellent understanding of core concepts';
    } else if (actual.confidenceScore >= 60) {
      comparison.overallAssessment =
        'Good understanding with some gaps in advanced topics';
    } else if (actual.confidenceScore >= 40) {
      comparison.overallAssessment =
        'Fair understanding but missing several fundamental concepts';
    } else {
      comparison.overallAssessment =
        'Strong need for concept revision and reinforcement';
    }

    return comparison;
  } catch (error) {
    throw new Error(`Comparison failed: ${error.message}`);
  }
};

/**
 * Analyze multiple answers for pattern detection
 * @param {Array} answerTexts - Array of answer texts
 * @param {Array} topics - Array of corresponding topics
 * @returns {Object} Pattern analysis
 */
export const analyzeAnswerPatterns = (answerTexts, topics) => {
  try {
    if (
      !Array.isArray(answerTexts) ||
      !Array.isArray(topics) ||
      answerTexts.length !== topics.length
    ) {
      throw new Error('Invalid answerTexts or topics array');
    }

    const patterns = {
      consistentlyWeakAreas: {},
      consistentlyStrongAreas: {},
      improvementAreas: [],
      conceptMastery: {},
    };

    const analysisResults = answerTexts.map((text, index) => ({
      text,
      topic: topics[index],
      analysis: detectWeakConcepts(text),
    }));

    // Find consistently weak and strong areas
    const topicCoverageMap = {};

    analysisResults.forEach(({ topic, analysis }) => {
      for (const [conceptTopic, details] of Object.entries(
        analysis.analysisDetails
      )) {
        if (!topicCoverageMap[conceptTopic]) {
          topicCoverageMap[conceptTopic] = [];
        }
        topicCoverageMap[conceptTopic].push(details.coverage);
      }
    });

    // Calculate averages
    for (const [topic, coverages] of Object.entries(topicCoverageMap)) {
      const avgCoverage =
        coverages.reduce((a, b) => a + b, 0) / coverages.length;

      if (avgCoverage < 50) {
        patterns.consistentlyWeakAreas[topic] = Math.round(avgCoverage);
      } else if (avgCoverage >= 80) {
        patterns.consistentlyStrongAreas[topic] = Math.round(avgCoverage);
      }
    }

    return patterns;
  } catch (error) {
    throw new Error(`Pattern analysis failed: ${error.message}`);
  }
};

/**
 * Generate concept-based recommendations
 * @param {Object} analysis - Output from detectWeakConcepts
 * @returns {Array} Prioritized recommendations
 */
export const generateConceptRecommendations = (analysis) => {
  try {
    if (!analysis || !analysis.weakTopics) {
      throw new Error('Invalid analysis provided');
    }

    const recommendations = analysis.weakTopics.map((weak) => ({
      topic: weak.topic,
      priority:
        weak.weaknessLevel === 'Critical'
          ? 'High'
          : weak.weaknessLevel === 'High'
            ? 'Medium'
            : 'Low',
      suggestedFocus: weak.fundamentalsCovered,
      totalFundamentals: weak.fundamentalsTotal,
      action: `Focus on understanding fundamental ${weak.topic} concepts`,
    }));

    return recommendations.sort(
      (a, b) =>
        (a.priority === 'High' ? 0 : a.priority === 'Medium' ? 1 : 2) -
        (b.priority === 'High' ? 0 : b.priority === 'Medium' ? 1 : 2)
    );
  } catch (error) {
    throw new Error(`Recommendation generation failed: ${error.message}`);
  }
};

export default {
  detectWeakConcepts,
  compareExpectedVsActual,
  analyzeAnswerPatterns,
  generateConceptRecommendations,
  CONCEPT_KEYWORDS,
};
