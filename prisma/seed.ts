import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const DEFAULT_DEMO_PASSWORD = "changeme";

const DISCLAIMER =
  "Sample/editable study objective — verify against official Elastic training materials.";

async function main() {
  console.log("🌱 Seeding database...");

  // Create default demo user (password: changeme)
  const hashedPassword = await hash(DEFAULT_DEMO_PASSWORD, 12);
  const user = await prisma.user.upsert({
    where: { email: "student@elastic-cert.local" },
    update: { password: hashedPassword },
    create: {
      name: "Elastic Student",
      email: "student@elastic-cert.local",
      password: hashedPassword,
      settings: {
        create: {
          dailyGoalMinutes: 90,
          pomodoroMinutes: 25,
          pomodoroBreak: 5,
          darkMode: true,
          preferredStudyMode: "balanced",
        },
      },
    },
  });

  // ─── Certification Tracks ────────────────────────────────────────────────────
  const certTracks = [
    {
      slug: "elastic-engineer",
      name: "Elastic Certified Engineer",
      shortName: "ECE",
      description:
        "Validates ability to design, build, deploy, and manage Elasticsearch clusters and Kibana for production use.",
      icon: "⚙️",
      color: "#0077CC",
      examDuration: 120,
      passingScore: 70,
      questionCount: 60,
      officialUrl: "https://www.elastic.co/training/elastic-certified-engineer-exam",
      sortOrder: 0,
    },
    {
      slug: "elastic-observability-engineer",
      name: "Elastic Certified Observability Engineer",
      shortName: "ECOE",
      description:
        "Validates expertise in ingesting, analyzing, and visualizing metrics, logs, and traces using the Elastic Stack for observability.",
      icon: "📡",
      color: "#00A88E",
      examDuration: 120,
      passingScore: 70,
      questionCount: 60,
      officialUrl: "https://www.elastic.co/training/elastic-certified-observability-engineer",
      sortOrder: 1,
    },
    {
      slug: "elastic-siem-analyst",
      name: "Elastic Certified SIEM Analyst",
      shortName: "ECSA",
      description:
        "Validates the ability to use Elastic Security for threat detection, investigation, and response workflows.",
      icon: "🛡️",
      color: "#C4262E",
      examDuration: 120,
      passingScore: 70,
      questionCount: 60,
      officialUrl: "https://www.elastic.co/training/elastic-certified-siem-analyst",
      sortOrder: 2,
    },
    {
      slug: "elastic-analyst",
      name: "Elastic Certified Analyst",
      shortName: "ECA",
      description:
        "Validates expertise in data analysis, Kibana dashboards, Lens, Canvas, and business intelligence use cases.",
      icon: "📊",
      color: "#F0AB00",
      examDuration: 90,
      passingScore: 70,
      questionCount: 50,
      officialUrl: "https://www.elastic.co/training/elastic-certified-analyst-exam",
      sortOrder: 3,
    },
    {
      slug: "elastic-genai-associate",
      name: "Elastic GenAI Associate Accreditation",
      shortName: "EGAA",
      description:
        "Validates understanding of how to build AI-powered search and generative AI applications using the Elastic platform.",
      icon: "🤖",
      color: "#7B61FF",
      examDuration: 60,
      passingScore: 70,
      questionCount: 40,
      officialUrl: "https://www.elastic.co/training/elastic-genai-associate",
      sortOrder: 4,
    },
  ];

  const createdCerts: Record<string, { id: string }> = {};
  for (const cert of certTracks) {
    const created = await prisma.certificationTrack.upsert({
      where: { slug: cert.slug },
      update: {},
      create: cert,
    });
    createdCerts[cert.slug] = created;
  }

  // ─── ECE Domains & Topics ────────────────────────────────────────────────────
  const eceDomains = [
    {
      name: "Cluster Architecture & Configuration",
      description: "Design and configure Elasticsearch clusters, node roles, and settings.",
      weightPercent: 25,
      topics: [
        {
          name: "Node Roles & Configuration",
          description: "Understanding master, data, ingest, and coordinating node roles.",
          questions: [
            {
              type: "multiple_choice",
              stem: "Which node role is responsible for maintaining cluster state and coordinating shard allocation?",
              explanation: "Master-eligible nodes are responsible for cluster-wide operations including maintaining cluster state, shard allocation, and index management. In a production setup, you should dedicate nodes to this role.",
              difficulty: "easy",
              options: [
                { text: "data", isCorrect: false },
                { text: "master", isCorrect: true },
                { text: "ingest", isCorrect: false },
                { text: "coordinating", isCorrect: false },
              ],
            },
            {
              type: "multiple_select",
              stem: "Which of the following are valid Elasticsearch node roles? (Select all that apply)",
              explanation: "Elasticsearch supports several node roles: master, data, ingest, ml (machine learning), and transform. The 'query' role does not exist; coordinating-only nodes have no roles assigned.",
              difficulty: "medium",
              options: [
                { text: "master", isCorrect: true },
                { text: "data", isCorrect: true },
                { text: "ingest", isCorrect: true },
                { text: "query", isCorrect: false },
                { text: "ml", isCorrect: true },
              ],
            },
          ],
          flashcards: [
            {
              front: "What is a coordinating-only node?",
              back: "A node with no roles assigned (empty roles list). It routes requests but does not store data, run ML jobs, or act as master. Useful for load-balancing client requests.",
            },
            {
              front: "What is the minimum recommended number of master-eligible nodes to avoid split-brain?",
              back: "3 master-eligible nodes. Elasticsearch uses a quorum-based election requiring (n/2)+1 votes, so with 3 nodes you can tolerate 1 node failure.",
            },
          ],
          labs: [
            {
              title: "Configure a Multi-Node Cluster",
              goal: "Set up a 3-node Elasticsearch cluster with dedicated master and data nodes.",
              estimatedMins: 45,
              difficulty: "medium",
              steps: JSON.stringify([
                "Install Elasticsearch on 3 VMs or Docker containers",
                "Configure elasticsearch.yml for each node with unique node.name",
                "Set node.roles appropriately (master, data)",
                "Configure cluster.name and discovery.seed_hosts",
                "Start all nodes and verify cluster health with GET /_cluster/health",
              ]),
              prerequisites: JSON.stringify(["Elasticsearch installed", "Basic YAML knowledge"]),
            },
          ],
        },
        {
          name: "Index Lifecycle Management (ILM)",
          description: "Configure ILM policies to manage index lifecycle from hot to delete.",
          questions: [
            {
              type: "multiple_choice",
              stem: "In an ILM policy, which phase transitions an index from actively written to read-only and begins the aging process?",
              explanation: "The 'warm' phase in ILM is designed for indices that are no longer actively written to. In the warm phase you can optimize the index (force merge, shrink), set it read-only, and reduce replica count.",
              difficulty: "medium",
              options: [
                { text: "hot", isCorrect: false },
                { text: "warm", isCorrect: true },
                { text: "cold", isCorrect: false },
                { text: "delete", isCorrect: false },
              ],
            },
          ],
          flashcards: [
            {
              front: "List the phases of an ILM policy in order.",
              back: "Hot → Warm → Cold → Frozen → Delete. Each phase is optional except that at least one phase must be defined.",
            },
          ],
          labs: [],
        },
      ],
    },
    {
      name: "Indexing & Mappings",
      description: "Data modeling, index templates, dynamic and explicit mappings.",
      weightPercent: 20,
      topics: [
        {
          name: "Mapping Types & Field Types",
          description: "Understand text, keyword, numeric, date, geo, and nested field types.",
          questions: [
            {
              type: "multiple_choice",
              stem: "Which field type should you use for exact-match filtering and aggregations on string values?",
              explanation: "The 'keyword' type stores strings as-is without analysis, making it suitable for exact matching, sorting, and aggregations. Use 'text' for full-text search.",
              difficulty: "easy",
              options: [
                { text: "text", isCorrect: false },
                { text: "keyword", isCorrect: true },
                { text: "string", isCorrect: false },
                { text: "match", isCorrect: false },
              ],
            },
            {
              type: "true_false",
              stem: "Dynamic mapping is disabled by default in Elasticsearch.",
              explanation: "False. Dynamic mapping is enabled by default, allowing Elasticsearch to automatically detect and add new fields. You can disable it by setting 'dynamic: false' or 'dynamic: strict' in your mapping.",
              difficulty: "easy",
              options: [
                { text: "True", isCorrect: false },
                { text: "False", isCorrect: true },
              ],
            },
          ],
          flashcards: [
            {
              front: "What is the difference between 'text' and 'keyword' field types?",
              back: "'text' fields are analyzed and tokenized for full-text search. 'keyword' fields are stored as-is and used for exact matching, aggregations, and sorting. A field can have both via multi-fields.",
            },
            {
              front: "What does setting 'dynamic: strict' do in a mapping?",
              back: "It rejects documents that contain fields not explicitly defined in the mapping, throwing an error. This prevents accidental schema drift.",
            },
          ],
          labs: [
            {
              title: "Create an Explicit Index Mapping",
              goal: "Design and apply an explicit mapping for an e-commerce product index.",
              estimatedMins: 30,
              difficulty: "easy",
              steps: JSON.stringify([
                "Plan field types for product_id, name, description, price, category, tags, created_at",
                "Create the index with explicit mapping via PUT /products",
                "Index 5 sample documents",
                "Verify mapping with GET /products/_mapping",
                "Test that adding an unmapped field fails with dynamic:strict",
              ]),
              prerequisites: JSON.stringify(["Running Elasticsearch", "Kibana DevTools access"]),
            },
          ],
        },
      ],
    },
    {
      name: "Search & Querying",
      description: "DSL queries, aggregations, relevance tuning, and search templates.",
      weightPercent: 25,
      topics: [
        {
          name: "Query DSL Fundamentals",
          description: "Boolean queries, term queries, match queries, and compound queries.",
          questions: [
            {
              type: "scenario",
              stem: "You need to find all documents where the 'status' field equals 'active' AND the 'price' is between 10 and 100. Which query structure should you use?",
              explanation: "A bool query with 'must' or 'filter' clauses combines multiple conditions. Use 'filter' for exact matches and ranges when scoring is not needed — this also enables caching.",
              difficulty: "medium",
              options: [
                { text: "match query with AND operator", isCorrect: false },
                { text: "bool query with filter clauses containing term and range", isCorrect: true },
                { text: "multi_match query with fields parameter", isCorrect: false },
                { text: "query_string with AND operator", isCorrect: false },
              ],
            },
          ],
          flashcards: [
            {
              front: "What is the difference between 'must' and 'filter' in a bool query?",
              back: "'must' clauses contribute to the relevance score. 'filter' clauses are binary (in/out) and their results are cached. Use 'filter' for exact matches/ranges you don't need to score.",
            },
            {
              front: "What does the 'should' clause in a bool query do when 'must' is also present?",
              back: "When 'must' is present, 'should' clauses are optional but boost the score if matched. When 'must' is absent, at least one 'should' clause must match (controlled by minimum_should_match).",
            },
          ],
          labs: [],
        },
        {
          name: "Aggregations",
          description: "Metric, bucket, and pipeline aggregations for analytics.",
          questions: [
            {
              type: "multiple_choice",
              stem: "Which aggregation type would you use to calculate the average price of products grouped by category?",
              explanation: "A 'terms' bucket aggregation groups documents by category, and an 'avg' metric aggregation (nested inside) calculates the average price per bucket.",
              difficulty: "medium",
              options: [
                { text: "range + sum", isCorrect: false },
                { text: "terms + avg", isCorrect: true },
                { text: "histogram + max", isCorrect: false },
                { text: "date_histogram + percentiles", isCorrect: false },
              ],
            },
          ],
          flashcards: [
            {
              front: "What is a pipeline aggregation?",
              back: "Pipeline aggregations operate on the output of other aggregations (rather than documents). Examples: moving_avg, bucket_sort, cumulative_sum. They reference sibling or parent buckets.",
            },
          ],
          labs: [],
        },
      ],
    },
    {
      name: "Cluster Management & Operations",
      description: "Monitoring, snapshots, security, and cluster maintenance.",
      weightPercent: 20,
      topics: [
        {
          name: "Snapshot & Restore",
          description: "Register repositories, create snapshots, and restore data.",
          questions: [
            {
              type: "multiple_choice",
              stem: "Before creating a snapshot, what must you configure first?",
              explanation: "You must register a snapshot repository (S3, GCS, Azure Blob, shared filesystem, etc.) before creating snapshots. The repository defines where snapshots are stored.",
              difficulty: "easy",
              options: [
                { text: "An ILM policy", isCorrect: false },
                { text: "A snapshot repository", isCorrect: true },
                { text: "A data stream", isCorrect: false },
                { text: "A hot-warm policy", isCorrect: false },
              ],
            },
          ],
          flashcards: [
            {
              front: "What API endpoint do you use to create a snapshot?",
              back: "PUT /_snapshot/{repository}/{snapshot}. Example: PUT /_snapshot/my_repo/snapshot_1?wait_for_completion=true",
            },
          ],
          labs: [
            {
              title: "Configure Snapshot Repository and Create Backup",
              goal: "Register a filesystem snapshot repository and create a full cluster snapshot.",
              estimatedMins: 30,
              difficulty: "easy",
              steps: JSON.stringify([
                "Configure path.repo in elasticsearch.yml",
                "Register repository: PUT /_snapshot/my_backup { type: fs, settings: { location: /path/to/backup } }",
                "Create snapshot: PUT /_snapshot/my_backup/snapshot_1",
                "Verify snapshot: GET /_snapshot/my_backup/snapshot_1",
                "Restore an index from snapshot",
              ]),
              prerequisites: JSON.stringify(["Running Elasticsearch cluster", "Filesystem access"]),
            },
          ],
        },
      ],
    },
    {
      name: "Data Pipelines & Ingest",
      description: "Ingest pipelines, Logstash, Beats, and data transformation.",
      weightPercent: 10,
      topics: [
        {
          name: "Ingest Pipelines",
          description: "Processors, simulate API, and pipeline testing.",
          questions: [
            {
              type: "multiple_choice",
              stem: "Which ingest processor would you use to parse an unstructured log line using a Grok pattern?",
              explanation: "The 'grok' processor uses predefined and custom patterns to parse unstructured text into structured fields. It's commonly used for parsing log lines like Apache access logs.",
              difficulty: "medium",
              options: [
                { text: "dissect", isCorrect: false },
                { text: "grok", isCorrect: true },
                { text: "gsub", isCorrect: false },
                { text: "script", isCorrect: false },
              ],
            },
          ],
          flashcards: [
            {
              front: "What is the difference between 'grok' and 'dissect' processors?",
              back: "'grok' uses regex-based patterns (flexible, handles variable-format logs). 'dissect' uses fixed delimiters (faster, simpler, but requires consistent format). Use dissect when possible for performance.",
            },
          ],
          labs: [],
        },
      ],
    },
  ];

  await seedCertDomains(createdCerts["elastic-engineer"].id, eceDomains);

  // ─── ECOE Domains & Topics ───────────────────────────────────────────────────
  const ecoeDomains = [
    {
      name: "Observability Fundamentals & Architecture",
      description: "Understanding the three pillars: metrics, logs, and traces.",
      weightPercent: 20,
      topics: [
        {
          name: "Observability Pillars",
          description: "Metrics, logs, traces, and their role in system observability.",
          questions: [
            {
              type: "multiple_choice",
              stem: "Which Elastic agent mode uses a centralized policy to configure data collection across all enrolled agents?",
              explanation: "Fleet-managed mode allows centralized policy management through Kibana Fleet UI. Policies define which integrations run on enrolled agents, enabling consistent configuration at scale.",
              difficulty: "medium",
              options: [
                { text: "Standalone mode", isCorrect: false },
                { text: "Fleet-managed mode", isCorrect: true },
                { text: "Beats mode", isCorrect: false },
                { text: "Logstash-managed mode", isCorrect: false },
              ],
            },
          ],
          flashcards: [
            {
              front: "What are the three pillars of observability?",
              back: "1. Metrics: Numeric measurements over time (CPU, memory, request rates)\n2. Logs: Timestamped event records\n3. Traces: Distributed request flow across services (spans, transactions)",
            },
          ],
          labs: [],
        },
      ],
    },
    {
      name: "Metrics & APM",
      description: "Collecting, storing, and analyzing application and infrastructure metrics.",
      weightPercent: 25,
      topics: [
        {
          name: "APM & Distributed Tracing",
          description: "APM Server, agents, traces, spans, and service maps.",
          questions: [
            {
              type: "multiple_choice",
              stem: "In Elastic APM, what is a 'span'?",
              explanation: "A span represents a single unit of work within a transaction. Spans can represent database queries, external HTTP calls, cache operations, etc. Multiple spans make up a transaction.",
              difficulty: "easy",
              options: [
                { text: "The entire request from start to finish", isCorrect: false },
                { text: "A single unit of work within a transaction", isCorrect: true },
                { text: "An error occurrence", isCorrect: false },
                { text: "A deployment event", isCorrect: false },
              ],
            },
          ],
          flashcards: [
            {
              front: "What is the difference between a transaction and a span in APM?",
              back: "A transaction is the top-level unit (e.g., an HTTP request). A span is a sub-operation within that transaction (e.g., a DB query, external call). One transaction contains many spans.",
            },
          ],
          labs: [
            {
              title: "Instrument a Node.js App with Elastic APM",
              goal: "Add APM agent to a sample Node.js application and view traces in Kibana.",
              estimatedMins: 45,
              difficulty: "medium",
              steps: JSON.stringify([
                "Install elastic-apm-node package",
                "Add APM agent initialization at top of main file",
                "Configure ELASTIC_APM_SERVER_URL and ELASTIC_APM_SERVICE_NAME",
                "Generate traffic and view traces in Kibana APM",
                "Explore service map and identify slow transactions",
              ]),
              prerequisites: JSON.stringify(["Node.js application", "Elastic Stack running", "APM Server configured"]),
            },
          ],
        },
      ],
    },
    {
      name: "Log Management",
      description: "Log ingestion, parsing, correlation, and analysis.",
      weightPercent: 25,
      topics: [
        {
          name: "Log Ingestion & Parsing",
          description: "Filebeat, Elastic Agent integrations, and log parsing pipelines.",
          questions: [
            {
              type: "multiple_choice",
              stem: "Which Filebeat module automatically configures inputs and ingest pipelines for popular log formats like Nginx and MySQL?",
              explanation: "Filebeat modules bundle pre-configured inputs, Elasticsearch ingest pipeline templates, and Kibana dashboards for popular log sources. Enable with 'filebeat modules enable nginx'.",
              difficulty: "easy",
              options: [
                { text: "Filebeat plugins", isCorrect: false },
                { text: "Filebeat modules", isCorrect: true },
                { text: "Filebeat integrations", isCorrect: false },
                { text: "Filebeat extensions", isCorrect: false },
              ],
            },
          ],
          flashcards: [
            {
              front: "What ECS field contains the original log message?",
              back: "'message' is the ECS field for the original log message. Parsed fields are placed in their appropriate ECS categories (e.g., http.request.method, source.ip).",
            },
          ],
          labs: [],
        },
      ],
    },
    {
      name: "Infrastructure Monitoring",
      description: "Host metrics, Kubernetes monitoring, and infrastructure views.",
      weightPercent: 15,
      topics: [
        {
          name: "Metricbeat & System Metrics",
          description: "Collecting and analyzing host and container metrics.",
          questions: [
            {
              type: "multiple_choice",
              stem: "Which metric indicates the percentage of time CPUs were idle waiting for I/O operations to complete?",
              explanation: "iowait is a CPU state indicating the processor is idle while waiting for disk or network I/O. High iowait often indicates storage bottlenecks, not CPU contention.",
              difficulty: "medium",
              options: [
                { text: "system.cpu.user.pct", isCorrect: false },
                { text: "system.cpu.iowait.pct", isCorrect: true },
                { text: "system.cpu.system.pct", isCorrect: false },
                { text: "system.cpu.steal.pct", isCorrect: false },
              ],
            },
          ],
          flashcards: [
            {
              front: "What does 'system.memory.actual.used.pct' represent?",
              back: "The percentage of actual memory used, excluding buffers and caches. This is more accurate than total used memory for understanding application memory pressure.",
            },
          ],
          labs: [],
        },
      ],
    },
    {
      name: "Alerting & SLOs",
      description: "Creating alerts, SLO definitions, and incident response workflows.",
      weightPercent: 15,
      topics: [
        {
          name: "Kibana Alerting",
          description: "Alert rules, connectors, and notification workflows.",
          questions: [
            {
              type: "multiple_choice",
              stem: "In Kibana Alerting, what is an 'action' in the context of a rule?",
              explanation: "An action is what happens when an alert fires — it uses a connector to send notifications (email, Slack, PagerDuty, webhook, etc.). Rules can have multiple actions with different conditions.",
              difficulty: "easy",
              options: [
                { text: "The query condition that triggers the alert", isCorrect: false },
                { text: "A notification sent via a connector when the rule fires", isCorrect: true },
                { text: "The dashboard that visualizes the alert", isCorrect: false },
                { text: "The index pattern being monitored", isCorrect: false },
              ],
            },
          ],
          flashcards: [
            {
              front: "What is a Service Level Objective (SLO) in Elastic Observability?",
              back: "An SLO defines a target reliability goal for a service (e.g., 99.9% availability). Elastic calculates compliance against this target using error rates or latency metrics, showing burn rate alerts.",
            },
          ],
          labs: [],
        },
      ],
    },
  ];

  await seedCertDomains(createdCerts["elastic-observability-engineer"].id, ecoeDomains);

  // ─── ECSA Domains & Topics ───────────────────────────────────────────────────
  const ecsaDomains = [
    {
      name: "Elastic Security Architecture",
      description: "Elastic Security Stack components, data streams, and deployment.",
      weightPercent: 15,
      topics: [
        {
          name: "Security Stack Components",
          description: "Elastic Agent, Fleet, detection engine, and SIEM architecture.",
          questions: [
            {
              type: "multiple_choice",
              stem: "Which component of the Elastic Security platform is responsible for executing detection rules?",
              explanation: "The Elastic Security detection engine runs prebuilt and custom detection rules against security data in Elasticsearch. It generates alerts when rule conditions are met.",
              difficulty: "easy",
              options: [
                { text: "Elastic Agent", isCorrect: false },
                { text: "Detection Engine", isCorrect: true },
                { text: "Fleet Server", isCorrect: false },
                { text: "Kibana SIEM", isCorrect: false },
              ],
            },
          ],
          flashcards: [
            {
              front: "What is ECS (Elastic Common Schema) and why is it important for SIEM?",
              back: "ECS is a specification for field naming conventions in Elasticsearch. It standardizes fields across data sources (source.ip, destination.port, event.type) enabling correlation and detection rules to work across different log sources without custom field mapping.",
            },
          ],
          labs: [],
        },
      ],
    },
    {
      name: "Threat Detection & Rules",
      description: "Creating and managing detection rules, MITRE ATT&CK mapping.",
      weightPercent: 30,
      topics: [
        {
          name: "Detection Rule Types",
          description: "EQL, KQL, ML, and threshold detection rules.",
          questions: [
            {
              type: "multiple_choice",
              stem: "Which rule type would you use to detect sequences of events, such as a process creation followed by a network connection?",
              explanation: "EQL (Event Query Language) sequence queries are designed to detect ordered sequences of events with time constraints. They're ideal for multi-stage attack detection like process → network patterns.",
              difficulty: "medium",
              options: [
                { text: "Threshold rule", isCorrect: false },
                { text: "EQL sequence rule", isCorrect: true },
                { text: "KQL custom query rule", isCorrect: false },
                { text: "Indicator match rule", isCorrect: false },
              ],
            },
            {
              type: "multiple_choice",
              stem: "What is the MITRE ATT&CK framework primarily used for in Elastic SIEM?",
              explanation: "MITRE ATT&CK is used to categorize and tag detection rules by adversary tactics and techniques. This allows analysts to see coverage gaps and understand the attack patterns their rules detect.",
              difficulty: "easy",
              options: [
                { text: "Configuring firewall rules", isCorrect: false },
                { text: "Categorizing attack tactics and techniques in detection rules", isCorrect: true },
                { text: "Encrypting data at rest", isCorrect: false },
                { text: "Managing user authentication", isCorrect: false },
              ],
            },
          ],
          flashcards: [
            {
              front: "What are the four types of detection rules in Elastic Security?",
              back: "1. Custom query (KQL/EQL) — match specific event patterns\n2. Machine learning — anomaly-based detection\n3. Threshold — fire when events exceed a count\n4. Indicator match — correlate with threat intel feeds",
            },
            {
              front: "What is an EQL sequence query?",
              back: "An EQL sequence detects an ordered series of events within a time window. Example: [process creation] [network connection] within 5 minutes from the same host. Used for multi-stage attack detection.",
            },
          ],
          labs: [
            {
              title: "Create a Custom Detection Rule for Lateral Movement",
              goal: "Write an EQL sequence rule to detect pass-the-hash lateral movement attempts.",
              estimatedMins: 60,
              difficulty: "hard",
              steps: JSON.stringify([
                "Navigate to Security > Rules > Create new rule",
                "Select 'Event Correlation' (EQL) rule type",
                "Write EQL sequence: authentication failure followed by success from different hosts",
                "Map to MITRE ATT&CK: Lateral Movement > Pass the Hash",
                "Set severity, risk score, and schedule",
                "Test with simulated data",
              ]),
              prerequisites: JSON.stringify(["Elastic Security configured", "Sample Windows event logs ingested", "EQL knowledge"]),
            },
          ],
        },
      ],
    },
    {
      name: "Alert Triage & Investigation",
      description: "Investigating alerts, timeline analysis, and case management.",
      weightPercent: 25,
      topics: [
        {
          name: "Timeline Investigation",
          description: "Using Security Timeline to investigate incidents.",
          questions: [
            {
              type: "multiple_choice",
              stem: "In Elastic Security, where do you conduct structured investigations by correlating events chronologically?",
              explanation: "The Security Timeline is a workspace for investigating incidents. You can add events, notes, queries, and pin important entries. Timelines can be attached to Cases for documentation.",
              difficulty: "easy",
              options: [
                { text: "Discover", isCorrect: false },
                { text: "Security Timeline", isCorrect: true },
                { text: "Lens", isCorrect: false },
                { text: "Dashboard", isCorrect: false },
              ],
            },
          ],
          flashcards: [
            {
              front: "What is the purpose of Cases in Elastic Security?",
              back: "Cases provide an incident management workflow — group related alerts, add comments/notes, attach timelines, assign analysts, track status, and integrate with external ticketing systems like Jira or ServiceNow.",
            },
          ],
          labs: [],
        },
      ],
    },
    {
      name: "Threat Intelligence",
      description: "IOC management, indicator match rules, and threat feed integration.",
      weightPercent: 15,
      topics: [
        {
          name: "Threat Indicators & IOCs",
          description: "Ingesting and using threat intelligence indicators.",
          questions: [
            {
              type: "multiple_choice",
              stem: "What rule type in Elastic Security is used to generate alerts when events match indicators from a threat intelligence index?",
              explanation: "Indicator match rules correlate incoming security events against threat intelligence indicators (IOCs) stored in an Elasticsearch index. When a match is found (e.g., IP matches a known malicious IP), an alert is generated.",
              difficulty: "medium",
              options: [
                { text: "Threshold rule", isCorrect: false },
                { text: "Indicator match rule", isCorrect: true },
                { text: "ML anomaly rule", isCorrect: false },
                { text: "EQL rule", isCorrect: false },
              ],
            },
          ],
          flashcards: [
            {
              front: "What are common types of Indicators of Compromise (IOCs)?",
              back: "IP addresses, domain names, URLs, file hashes (MD5, SHA-256), email addresses, YARA signatures, and behavioral patterns. Store in threat intel indices using STIX/TAXII format.",
            },
          ],
          labs: [],
        },
      ],
    },
    {
      name: "Endpoint Security",
      description: "Elastic Defend, endpoint policies, and response actions.",
      weightPercent: 15,
      topics: [
        {
          name: "Elastic Defend Configuration",
          description: "Installing and configuring Elastic Defend on endpoints.",
          questions: [
            {
              type: "multiple_choice",
              stem: "Which protection mode in Elastic Defend actively blocks malicious activity in addition to detecting it?",
              explanation: "'Prevent' mode actively blocks detected malicious activity. 'Detect' mode only alerts without blocking. 'Prevent' should be tested carefully before broad deployment to avoid blocking legitimate processes.",
              difficulty: "easy",
              options: [
                { text: "Detect mode", isCorrect: false },
                { text: "Prevent mode", isCorrect: true },
                { text: "Monitor mode", isCorrect: false },
                { text: "Audit mode", isCorrect: false },
              ],
            },
          ],
          flashcards: [
            {
              front: "What response actions can you take on an endpoint from Elastic Security?",
              back: "Isolate host (cut network access), kill process, suspend process, get file, execute command, run script. These are available under the 'Respond' menu on endpoint details page.",
            },
          ],
          labs: [],
        },
      ],
    },
  ];

  await seedCertDomains(createdCerts["elastic-siem-analyst"].id, ecsaDomains);

  // ─── ECA Domains & Topics ────────────────────────────────────────────────────
  const ecaDomains = [
    {
      name: "Kibana Basics & Data Discovery",
      description: "Kibana navigation, Discover, and data exploration fundamentals.",
      weightPercent: 20,
      topics: [
        {
          name: "Discover & KQL",
          description: "Using Discover app and KQL for data exploration.",
          questions: [
            {
              type: "multiple_choice",
              stem: "In Kibana Discover, what does the KQL query 'status: 200 AND method: GET' do?",
              explanation: "This KQL query returns documents where the 'status' field equals 200 AND the 'method' field equals 'GET'. KQL uses field:value syntax with AND/OR/NOT boolean operators.",
              difficulty: "easy",
              options: [
                { text: "Returns documents where status contains 200 or method contains GET", isCorrect: false },
                { text: "Returns documents where status is 200 and method is GET", isCorrect: true },
                { text: "Returns documents matching the full-text '200 GET'", isCorrect: false },
                { text: "Throws an error — AND is not valid in KQL", isCorrect: false },
              ],
            },
          ],
          flashcards: [
            {
              front: "What is a Data View in Kibana?",
              back: "A Data View (formerly Index Pattern) defines which Elasticsearch indices Kibana queries. It specifies the index pattern (e.g., 'logs-*'), the timestamp field, and field formatting overrides.",
            },
          ],
          labs: [],
        },
      ],
    },
    {
      name: "Lens & Visualizations",
      description: "Building charts, tables, and custom visualizations with Lens.",
      weightPercent: 30,
      topics: [
        {
          name: "Lens Visualization Builder",
          description: "Creating and configuring visualizations using Lens.",
          questions: [
            {
              type: "multiple_choice",
              stem: "In Kibana Lens, which visualization type is best for showing how a metric changes over time?",
              explanation: "Line charts are ideal for time-series data showing trends over time. Bar charts work for comparisons between categories. Use the date histogram X-axis with a metric on Y-axis.",
              difficulty: "easy",
              options: [
                { text: "Pie chart", isCorrect: false },
                { text: "Line chart", isCorrect: true },
                { text: "Data table", isCorrect: false },
                { text: "Metric visualization", isCorrect: false },
              ],
            },
            {
              type: "multiple_choice",
              stem: "Which Lens formula would you use to calculate the ratio of 5xx errors to total requests?",
              explanation: "Lens formulas allow mathematical expressions. count(kql='status >= 500') / count() gives the ratio. You can use KQL filters inside count() to filter specific subsets.",
              difficulty: "hard",
              options: [
                { text: "average('status') / count()", isCorrect: false },
                { text: "count(kql='status >= 500') / count()", isCorrect: true },
                { text: "sum('status') where status > 500", isCorrect: false },
                { text: "percentile('status', 95)", isCorrect: false },
              ],
            },
          ],
          flashcards: [
            {
              front: "What is the difference between Lens and TSVB in Kibana?",
              back: "Lens is the modern, recommended visualization builder with drag-and-drop interface and formulas. TSVB (Time Series Visual Builder) is the legacy option with more complex time-series capabilities. Lens is preferred for new visualizations.",
            },
          ],
          labs: [
            {
              title: "Build an Analytics Dashboard with Lens",
              goal: "Create a multi-panel dashboard analyzing web server access logs.",
              estimatedMins: 60,
              difficulty: "medium",
              steps: JSON.stringify([
                "Load sample web logs data set in Kibana",
                "Create a line chart of requests per hour",
                "Add a bar chart of top 10 URLs by request count",
                "Add a metric showing total unique visitors (cardinality)",
                "Add a pie chart of HTTP status code distribution",
                "Arrange panels into a dashboard with filters",
              ]),
              prerequisites: JSON.stringify(["Kibana with sample data loaded", "Basic Lens familiarity"]),
            },
          ],
        },
      ],
    },
    {
      name: "Dashboards & Canvas",
      description: "Dashboard creation, drilldowns, Canvas reports.",
      weightPercent: 25,
      topics: [
        {
          name: "Dashboard Features",
          description: "Panels, controls, drilldowns, and sharing.",
          questions: [
            {
              type: "multiple_choice",
              stem: "What is a Dashboard Drilldown in Kibana?",
              explanation: "Drilldowns allow users to click on a chart element (like a bar or data point) to navigate to another dashboard with a pre-applied filter based on the clicked value. They enable interactive data exploration.",
              difficulty: "medium",
              options: [
                { text: "A way to export dashboard data to CSV", isCorrect: false },
                { text: "Clicking a visualization element navigates to another dashboard with filters applied", isCorrect: true },
                { text: "A drill-through query to Elasticsearch", isCorrect: false },
                { text: "A nested sub-visualization inside a panel", isCorrect: false },
              ],
            },
          ],
          flashcards: [
            {
              front: "What are Dashboard Controls used for?",
              back: "Controls are interactive filter widgets added to dashboards (dropdown, date range, range slider). They allow users to dynamically filter all visualizations without editing KQL manually.",
            },
          ],
          labs: [],
        },
      ],
    },
    {
      name: "Maps & Geo Analysis",
      description: "Elastic Maps for geospatial data analysis.",
      weightPercent: 10,
      topics: [
        {
          name: "Kibana Maps",
          description: "Creating maps with geo_point and geo_shape data.",
          questions: [
            {
              type: "multiple_choice",
              stem: "Which Elasticsearch field type is required to plot individual point locations on a Kibana Map?",
              explanation: "The 'geo_point' field type stores longitude/latitude coordinates. It enables distance queries, geo_bounding_box queries, and point plotting on Kibana Maps.",
              difficulty: "easy",
              options: [
                { text: "geo_shape", isCorrect: false },
                { text: "geo_point", isCorrect: true },
                { text: "location", isCorrect: false },
                { text: "coordinates", isCorrect: false },
              ],
            },
          ],
          flashcards: [
            {
              front: "What is the difference between geo_point and geo_shape field types?",
              back: "'geo_point' stores a single lat/lon coordinate. 'geo_shape' stores complex geometries like polygons, lines, and multi-points. Use geo_shape for country boundaries, geofences, or routes.",
            },
          ],
          labs: [],
        },
      ],
    },
    {
      name: "Machine Learning & Anomaly Detection",
      description: "Kibana ML jobs, anomaly detection, and forecasting.",
      weightPercent: 15,
      topics: [
        {
          name: "ML Anomaly Detection Jobs",
          description: "Creating and interpreting anomaly detection jobs.",
          questions: [
            {
              type: "multiple_choice",
              stem: "In Elastic ML, what does the 'anomaly score' represent?",
              explanation: "The anomaly score (0-100) indicates how unusual an event is compared to the established baseline. Scores above 75 are typically considered critical. Higher scores mean more unusual behavior.",
              difficulty: "medium",
              options: [
                { text: "The number of anomalies detected", isCorrect: false },
                { text: "A 0-100 measure of how unusual an event is relative to the baseline", isCorrect: true },
                { text: "The percentage of data points that are anomalous", isCorrect: false },
                { text: "The confidence interval of the prediction", isCorrect: false },
              ],
            },
          ],
          flashcards: [
            {
              front: "What is the difference between single-metric and multi-metric ML jobs?",
              back: "Single-metric: analyzes one function over one field (e.g., mean(response_time)). Multi-metric: analyzes multiple functions simultaneously within the same job, sharing the same time period — more efficient than multiple single jobs.",
            },
          ],
          labs: [],
        },
      ],
    },
  ];

  await seedCertDomains(createdCerts["elastic-analyst"].id, ecaDomains);

  // ─── EGAA Domains & Topics ───────────────────────────────────────────────────
  const egaaDomains = [
    {
      name: "GenAI & Elastic Fundamentals",
      description: "Understanding AI-powered search, LLMs, and Elastic's AI capabilities.",
      weightPercent: 25,
      topics: [
        {
          name: "Vector Search & Embeddings",
          description: "Semantic search, dense vectors, and embedding models.",
          questions: [
            {
              type: "multiple_choice",
              stem: "What Elasticsearch field type is used to store dense vector embeddings for semantic search?",
              explanation: "'dense_vector' field type stores numerical vector representations (embeddings) generated by ML models. These enable k-NN (k-nearest neighbor) similarity search for semantic/meaning-based queries.",
              difficulty: "medium",
              options: [
                { text: "float_vector", isCorrect: false },
                { text: "dense_vector", isCorrect: true },
                { text: "embedding", isCorrect: false },
                { text: "neural_vector", isCorrect: false },
              ],
            },
            {
              type: "multiple_choice",
              stem: "What is Retrieval-Augmented Generation (RAG)?",
              explanation: "RAG combines vector search retrieval with LLM generation. First, retrieve relevant context from a knowledge base (using semantic search), then augment the LLM prompt with that context to generate accurate, grounded responses.",
              difficulty: "easy",
              options: [
                { text: "Training an LLM on proprietary data", isCorrect: false },
                { text: "Combining vector search retrieval with LLM generation for grounded responses", isCorrect: true },
                { text: "Fine-tuning a model with reinforcement learning", isCorrect: false },
                { text: "Caching LLM responses for repeated queries", isCorrect: false },
              ],
            },
          ],
          flashcards: [
            {
              front: "What is semantic search and how does it differ from lexical search?",
              back: "Semantic search finds results by meaning/intent using vector embeddings. Lexical search (BM25) finds results by keyword matching. Semantic search returns 'car' results for 'automobile' queries; lexical won't. Elastic supports both via hybrid search.",
            },
            {
              front: "What is ELSER in Elastic?",
              back: "ELSER (Elastic Learned Sparse EncodeR) is Elastic's sparse embedding model for semantic search. It creates sparse vector representations optimized for retrieval, requiring no GPU and working out of the box without external embedding API calls.",
            },
          ],
          labs: [
            {
              title: "Implement Semantic Search with ELSER",
              goal: "Configure ELSER inference endpoint and perform semantic search on product descriptions.",
              estimatedMins: 45,
              difficulty: "medium",
              steps: JSON.stringify([
                "Download and start ELSER model via Machine Learning > Trained Models",
                "Create inference endpoint: PUT /_inference/sparse_embedding/my-elser-endpoint",
                "Create index with sparse_vector field type",
                "Configure ingest pipeline to generate embeddings on index",
                "Index documents and run semantic search queries",
                "Compare results with BM25 keyword search",
              ]),
              prerequisites: JSON.stringify(["Elasticsearch 8.x+", "ML node or hardware support", "Sample text corpus"]),
            },
          ],
        },
      ],
    },
    {
      name: "Inference & ML Models",
      description: "Elastic inference APIs, trained models, and NLP tasks.",
      weightPercent: 25,
      topics: [
        {
          name: "Elastic Inference API",
          description: "Using inference endpoints for text embedding, reranking, and completion.",
          questions: [
            {
              type: "multiple_choice",
              stem: "Which Elastic feature allows you to use external LLM providers (like OpenAI or Anthropic) for text generation within Elasticsearch workflows?",
              explanation: "The Elasticsearch Inference API provides a unified interface to use third-party AI providers. You configure an inference endpoint with provider credentials, then reference it in queries, ingest pipelines, or connectors.",
              difficulty: "medium",
              options: [
                { text: "Kibana AI assistant plugin", isCorrect: false },
                { text: "Elasticsearch Inference API with third-party connectors", isCorrect: true },
                { text: "Logstash LLM filter", isCorrect: false },
                { text: "Elastic ML transforms", isCorrect: false },
              ],
            },
          ],
          flashcards: [
            {
              front: "What is the difference between sparse and dense vector embeddings?",
              back: "Dense vectors: fixed-size arrays where most values are non-zero (e.g., 768 floats from BERT). Sparse vectors: variable-size with mostly zero values, only non-zero terms stored (like ELSER). Dense = better semantic match; Sparse = more efficient storage, better for exact term importance.",
            },
          ],
          labs: [],
        },
      ],
    },
    {
      name: "RAG & AI Application Patterns",
      description: "Building RAG pipelines, chat interfaces, and AI search applications.",
      weightPercent: 25,
      topics: [
        {
          name: "RAG Architecture",
          description: "Implementing retrieval-augmented generation with Elastic.",
          questions: [
            {
              type: "scenario",
              stem: "You are building a customer support chatbot that must answer questions about product documentation. The LLM should not hallucinate information not in the docs. Which architecture should you use?",
              explanation: "RAG (Retrieval-Augmented Generation) is the correct pattern. Store product docs in Elasticsearch, use semantic search to retrieve relevant passages for each user question, then pass those passages as context to the LLM prompt. This grounds LLM responses in actual documentation.",
              difficulty: "medium",
              options: [
                { text: "Fine-tune an LLM directly on product documentation", isCorrect: false },
                { text: "RAG: retrieve relevant doc passages via semantic search, pass as LLM context", isCorrect: true },
                { text: "Use keyword search only and return raw document text", isCorrect: false },
                { text: "Train a custom classification model on support tickets", isCorrect: false },
              ],
            },
          ],
          flashcards: [
            {
              front: "What is hybrid search in the context of RAG?",
              back: "Hybrid search combines lexical (BM25 keyword) search with vector (semantic) search, using Reciprocal Rank Fusion (RRF) or weighted scoring to merge results. Often outperforms either approach alone for RAG retrieval.",
            },
          ],
          labs: [
            {
              title: "Build a RAG Chatbot with Elastic and OpenAI",
              goal: "Create an end-to-end RAG pipeline: ingest docs, embed, retrieve, and generate answers.",
              estimatedMins: 90,
              difficulty: "hard",
              steps: JSON.stringify([
                "Configure OpenAI inference endpoint in Elasticsearch",
                "Create index with dense_vector field for embeddings",
                "Set up ingest pipeline to auto-embed documents via inference API",
                "Index sample knowledge base documents",
                "Write retrieval query combining semantic + BM25 (hybrid search)",
                "Build prompt template that includes retrieved context",
                "Test end-to-end: question → retrieve → generate → answer",
              ]),
              prerequisites: JSON.stringify(["OpenAI API key", "Elasticsearch 8.x", "Python or Node.js"]),
            },
          ],
        },
      ],
    },
    {
      name: "Kibana AI Features",
      description: "AI Assistant, AI-powered Observability, and Security AI workflows.",
      weightPercent: 25,
      topics: [
        {
          name: "Kibana AI Assistant",
          description: "Using and understanding Kibana's AI assistant capabilities.",
          questions: [
            {
              type: "multiple_choice",
              stem: "What is the primary purpose of the Kibana Observability AI Assistant?",
              explanation: "The Observability AI Assistant helps analysts investigate incidents by conversing with their Elastic data. It can explain alerts, suggest queries, interpret charts, and generate remediation steps using an LLM connected to your Elasticsearch data.",
              difficulty: "easy",
              options: [
                { text: "Automatically fix infrastructure issues", isCorrect: false },
                { text: "AI-powered incident investigation and data conversation", isCorrect: true },
                { text: "Generate machine learning models automatically", isCorrect: false },
                { text: "Replace Elastic Defend with AI monitoring", isCorrect: false },
              ],
            },
          ],
          flashcards: [
            {
              front: "What Elasticsearch feature enables 'chat with your data' patterns?",
              back: "The Elasticsearch Inference API + Chat completion endpoint, combined with function calling, allows an LLM to construct and execute Elasticsearch queries based on natural language, then interpret results — enabling conversational data exploration.",
            },
          ],
          labs: [],
        },
      ],
    },
  ];

  await seedCertDomains(createdCerts["elastic-genai-associate"].id, egaaDomains);

  // ─── Create default cert progress for user ───────────────────────────────────
  for (const [slug, cert] of Object.entries(createdCerts)) {
    await prisma.certProgress.upsert({
      where: {
        userId_certId: {
          userId: user.id,
          certId: cert.id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        certId: cert.id,
        status: slug === "elastic-engineer" ? "in_progress" : "not_started",
        progressPercent: slug === "elastic-engineer" ? 35 : 0,
        readinessScore: slug === "elastic-engineer" ? 42 : 0,
        hoursStudied: slug === "elastic-engineer" ? 18 : 0,
      },
    });
  }

  // ─── Sample notes ────────────────────────────────────────────────────────────
  await prisma.note.createMany({
    data: [
      {
        userId: user.id,
        title: "ILM Phase Transition Gotcha",
        content:
          "ILM phases don't transition based on time alone — you need to set min_age relative to the index creation time OR the rollover time. Also, the hot phase MUST be defined even if it's just an empty phase object. Got bitten by this in practice exam.",
        noteType: "mistake",
        certId: createdCerts["elastic-engineer"].id,
        tags: JSON.stringify(["ilm", "gotcha", "cluster-management"]),
        isPinned: true,
      },
      {
        userId: user.id,
        title: "Useful Cluster Health API",
        content:
          "GET /_cluster/health?level=indices  — shows health per index\nGET /_cluster/health?wait_for_status=green&timeout=30s  — wait for green\nGET /_cluster/allocation/explain  — debug unassigned shards (VERY useful)",
        noteType: "command",
        certId: createdCerts["elastic-engineer"].id,
        tags: JSON.stringify(["api", "cluster", "troubleshooting"]),
        isPinned: true,
      },
      {
        userId: user.id,
        title: "Grok vs Dissect — Remember This",
        content:
          "GROK: regex-based, flexible, slower. Use for variable-format logs.\nDISSECT: delimiter-based, no regex, faster. Use for consistent formats like CSV or fixed Apache logs.\nWhen in doubt for the exam: if the log has consistent delimiters, prefer dissect for performance.",
        noteType: "mistake",
        certId: createdCerts["elastic-engineer"].id,
        tags: JSON.stringify(["ingest", "grok", "dissect"]),
        isPinned: false,
      },
    ],
  });

  // ─── Sample study session ────────────────────────────────────────────────────
  await prisma.studySession.create({
    data: {
      userId: user.id,
      certId: createdCerts["elastic-engineer"].id,
      sessionType: "quiz",
      durationMins: 45,
      startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      endedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
    },
  });

  console.log("✅ Seed complete!");
}

async function seedCertDomains(
  certId: string,
  domains: Array<{
    name: string;
    description: string;
    weightPercent: number;
    topics: Array<{
      name: string;
      description: string;
      questions: Array<{
        type: string;
        stem: string;
        explanation: string;
        difficulty: string;
        options: Array<{ text: string; isCorrect: boolean }>;
      }>;
      flashcards: Array<{ front: string; back: string; hint?: string }>;
      labs: Array<{
        title: string;
        goal: string;
        estimatedMins: number;
        difficulty: string;
        steps: string;
        prerequisites: string;
      }>;
    }>;
  }>
) {
  for (let di = 0; di < domains.length; di++) {
    const domain = domains[di];
    const createdDomain = await prisma.domain.create({
      data: {
        certId,
        name: domain.name,
        description: domain.description,
        weightPercent: domain.weightPercent,
        sortOrder: di,
        disclaimer: DISCLAIMER,
      },
    });

    for (let ti = 0; ti < domain.topics.length; ti++) {
      const topic = domain.topics[ti];
      const createdTopic = await prisma.topic.create({
        data: {
          domainId: createdDomain.id,
          name: topic.name,
          description: topic.description,
        },
      });

      for (const q of topic.questions) {
        const question = await prisma.question.create({
          data: {
            topicId: createdTopic.id,
            type: q.type,
            stem: q.stem,
            explanation: q.explanation,
            difficulty: q.difficulty,
          },
        });
        for (let oi = 0; oi < q.options.length; oi++) {
          await prisma.answerOption.create({
            data: {
              questionId: question.id,
              text: q.options[oi].text,
              isCorrect: q.options[oi].isCorrect,
              sortOrder: oi,
            },
          });
        }
      }

      for (const fc of topic.flashcards) {
        await prisma.flashcard.create({
          data: {
            topicId: createdTopic.id,
            front: fc.front,
            back: fc.back,
            hint: fc.hint,
          },
        });
      }

      for (const lab of topic.labs) {
        await prisma.labExercise.create({
          data: {
            topicId: createdTopic.id,
            title: lab.title,
            goal: lab.goal,
            estimatedMins: lab.estimatedMins,
            difficulty: lab.difficulty,
            steps: lab.steps,
            prerequisites: lab.prerequisites,
          },
        });
      }
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
