# Tencil Cloud Architecture Guide

**Status:** Implementation reference for Phase 2+  
**Last Updated:** Post-business model planning  
**Purpose:** Technical blueprint for SaaS infrastructure

---

## Overview

Tencil Cloud transforms the CLI tool into a subscription SaaS. It provides:
- Hosted file storage and versioning
- Real-time collaboration
- Team workspaces
- Compliance features (Enterprise tier)

**MVP Philosophy:** Start as "Dropbox for .tencil files," evolve to "Google Docs for design files."

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTS                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐   │
│  │  Web App    │  │  CLI        │  │  Desktop (future)   │   │
│  │  (React)    │  │  (tencil    │  │                     │   │
│  │             │  │   cloud     │  │                     │   │
│  │             │  │   sync)     │  │                     │   │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘   │
└─────────┼────────────────┼────────────────────┼──────────────┘
          │                │                    │
          └────────────────┴────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                      API GATEWAY                             │
│  • Auth (JWT tokens)                                         │
│  • Rate limiting                                             │
│  • Request routing                                           │
│  • WebSocket upgrade for real-time                           │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    APPLICATION SERVER                          │
│  Node.js / Deno / Bun                                         │
│  • REST API (file operations)                                │
│  • WebSocket handlers (real-time sync)                       │
│  • Webhook processors (Penpot/Pencil events)                   │
│  • Background jobs (file conversion)                         │
└──────────────────────────┬──────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
┌─────────▼──────┐  ┌──────▼───────┐  ┌──────▼───────┐
│   DATABASE     │  │    CACHE     │  │  OBJECT STORE │
│  (PostgreSQL)  │  │   (Redis)    │  │    (S3/       │
│                │  │              │  │   Cloudflare  │
│  • Users       │  │  • Sessions  │  │   R2)         │
│  • Projects    │  │  • Real-time │  │               │
│  • Files       │  │    presence  │  │  • .tencil    │
│  • Links       │  │  • Rate      │  │    files      │
│  • Audit log   │  │    limits    │  │  • Versions   │
└────────────────┘  └──────────────┘  └───────────────┘
```

---

## Tech Stack

| Component | Recommendation | Rationale |
|-----------|----------------|-----------|
| **Runtime** | Node.js 20 LTS | Familiar, mature, large hiring pool |
| **Framework** | Fastify | 20% faster than Express, async/await native |
| **Database** | PostgreSQL 15 | ACID for file versioning, JSONB flexibility |
| **Cache** | Redis 7 | Sessions, presence, rate limiting, job queues |
| **Object Storage** | Cloudflare R2 | Zero egress fees (critical for file downloads) |
| **Auth** | Clerk | SSO, MFA, passwordless. Don't roll your own |
| **Real-time** | Socket.io | Fallbacks, reconnect logic, room management |
| **Background Jobs** | Bull (Redis-based) | Reliable queuing with job retries |
| **Hosting** | Railway or Render | Zero DevOps, scales to 10K+ users |

**Alternative (cost-optimized at scale):**
- AWS: ECS Fargate + RDS + ElastiCache + S3 (requires DevOps expertise)
- Only migrate when compute costs exceed $500/month

---

## Data Model

### Core Tables

```sql
-- Users (synced from Clerk/Auth0)
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    tier VARCHAR(20) DEFAULT 'starter', -- starter, team, business, enterprise
    created_at TIMESTAMP DEFAULT NOW()
);

-- Projects (workspaces)
CREATE TABLE projects (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    owner_id UUID REFERENCES users(id),
    domain VARCHAR(20), -- ui, ee, med
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Project members (RBAC)
CREATE TABLE project_members (
    project_id UUID REFERENCES projects(id),
    user_id UUID REFERENCES users(id),
    role VARCHAR(20), -- viewer, editor, admin
    PRIMARY KEY (project_id, user_id)
);

-- Files (.tencil files)
CREATE TABLE files (
    id UUID PRIMARY KEY,
    project_id UUID REFERENCES projects(id),
    name VARCHAR(255) NOT NULL,
    storage_key VARCHAR(512) NOT NULL,
    version INTEGER DEFAULT 1,
    size_bytes INTEGER,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    checksum VARCHAR(64) -- SHA-256 for integrity
);

-- File versions (history)
CREATE TABLE file_versions (
    id UUID PRIMARY KEY,
    file_id UUID REFERENCES files(id),
    version INTEGER NOT NULL,
    storage_key VARCHAR(512) NOT NULL,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    change_summary TEXT
);

-- Links (cross-domain relationships)
CREATE TABLE links (
    id UUID PRIMARY KEY,
    file_id UUID REFERENCES files(id),
    link_data JSONB NOT NULL,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Audit log (Enterprise)
CREATE TABLE audit_log (
    id UUID PRIMARY KEY,
    project_id UUID REFERENCES projects(id),
    user_id UUID REFERENCES users(id),
    action VARCHAR(50),
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT NOW()
);
```

### Indexes

```sql
-- Performance-critical queries
CREATE INDEX idx_files_project ON files(project_id);
CREATE INDEX idx_files_created ON files(created_at DESC);
CREATE INDEX idx_links_file ON links(file_id);
CREATE INDEX idx_audit_project_time ON audit_log(project_id, timestamp DESC);
CREATE INDEX idx_versions_file ON file_versions(file_id, version DESC);
```

---

## Key Features

### 1. Real-Time Sync

**WebSocket room management:**

```javascript
// Simplified Socket.io handler
io.on('connection', (socket) => {
  // Join project room
  socket.on('join-project', async (projectId) => {
    const hasAccess = await checkProjectAccess(socket.userId, projectId);
    if (!hasAccess) return socket.emit('error', 'Access denied');
    
    socket.join(`project:${projectId}`);
    
    // Track presence in Redis
    await redis.setex(`presence:${projectId}:${socket.userId}`, 60, JSON.stringify({
      name: socket.userName,
      joinedAt: Date.now()
    }));
    
    // Notify others
    socket.to(`project:${projectId}`).emit('user-joined', {
      userId: socket.userId,
      name: socket.userName
    });
    
    // Send current presence list
    const presence = await getProjectPresence(projectId);
    socket.emit('presence-list', presence);
  });
  
  // Handle file changes
  socket.on('file-change', async (data) => {
    const { projectId, fileId, operations } = data;
    
    // Validate permissions
    const canEdit = await checkEditPermission(socket.userId, projectId);
    if (!canEdit) return;
    
    // Apply operations via Yjs/CRDT
    const updated = await applyOperations(fileId, operations);
    
    // Broadcast to other users
    socket.to(`project:${projectId}`).emit('file-updated', {
      fileId,
      operations,
      by: socket.userId,
      timestamp: Date.now()
    });
    
    // Persist to database (debounced)
    debouncedPersist(fileId, updated);
  });
  
  // Handle cursor position (optional polish)
  socket.on('cursor-move', (data) => {
    socket.to(`project:${projectId}`).emit('cursor-update', {
      userId: socket.userId,
      position: data.position,
      nodeId: data.nodeId
    });
  });
});
```

**Conflict resolution with Yjs:**

```javascript
import * as Y from 'yjs';

// Server-side Yjs document management
const yDocs = new Map(); // fileId -> Y.Doc

function getOrCreateYDoc(fileId) {
  if (!yDocs.has(fileId)) {
    const doc = new Y.Doc();
    // Load from database if exists
    const persisted = await loadYjsState(fileId);
    if (persisted) {
      Y.applyUpdate(doc, persisted);
    }
    yDocs.set(fileId, doc);
    
    // Auto-persist on change
    doc.on('update', (update) => {
      debouncedPersist(fileId, Y.encodeStateAsUpdate(doc));
    });
  }
  return yDocs.get(fileId);
}
```

### 2. File Storage & Versioning

**Upload flow (presigned URLs):**

```javascript
// POST /api/files/upload-request
app.post('/api/files/upload-request', async (req, res) => {
  const { projectId, filename, size } = req.body;
  
  // Check permissions and quota
  await checkProjectAccess(req.user.id, projectId);
  await checkStorageQuota(projectId, size);
  
  // Generate unique key
  const key = `projects/${projectId}/${uuidv4()}-${filename}`;
  
  // Generate presigned URL (valid 15 minutes)
  const uploadUrl = await r2.presignedPutObject('tencil-files', key, 15 * 60);
  
  // Return URL and key
  res.json({
    uploadUrl,
    key,
    expiresIn: 900
  });
});

// Webhook: Client confirms upload
app.post('/api/files/confirm', async (req, res) => {
  const { key, filename, size, checksum } = req.body;
  
  // Verify file exists in R2
  const exists = await r2.statObject('tencil-files', key);
  if (!exists) throw new Error('File not found in storage');
  
  // Validate .tencil schema (background job)
  const job = await fileValidationQueue.add({
    key,
    projectId: extractProjectFromKey(key)
  });
  
  // Create file record
  const file = await db.query(`
    INSERT INTO files (project_id, name, storage_key, size_bytes, checksum, created_by)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `, [projectId, filename, key, size, checksum, req.user.id]);
  
  res.json(file);
});
```

**Background validation:**

```javascript
// workers/fileValidation.js
fileValidationQueue.process(async (job) => {
  const { key, projectId } = job.data;
  
  // Download from R2
  const stream = await r2.getObject('tencil-files', key);
  const content = await streamToBuffer(stream);
  
  // Parse and validate
  const document = JSON.parse(content);
  const validation = validateTencilSchema(document);
  
  if (!validation.valid) {
    // Delete invalid file
    await r2.removeObject('tencil-files', key);
    await db.query('DELETE FROM files WHERE storage_key = $1', [key]);
    
    // Notify user
    await notifyUser(projectId, 'File validation failed', validation.errors);
    return;
  }
  
  // Extract metadata for indexing
  await indexFileMetadata(fileId, document);
});
```

### 3. Authentication & Authorization

**Clerk integration:**

```javascript
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';

// Apply to all routes
app.use(ClerkExpressRequireAuth());

// Middleware: Check project membership
async function requireProjectRole(role) {
  return async (req, res, next) => {
    const { projectId } = req.params;
    const userId = req.auth.userId;
    
    const membership = await db.query(`
      SELECT role FROM project_members 
      WHERE project_id = $1 AND user_id = $2
    `, [projectId, userId]);
    
    if (!membership) {
      return res.status(403).json({ error: 'Not a project member' });
    }
    
    const roleHierarchy = { viewer: 1, editor: 2, admin: 3 };
    if (roleHierarchy[membership.role] < roleHierarchy[role]) {
      return res.status(403).json({ error: `Requires ${role} role` });
    }
    
    req.projectRole = membership.role;
    next();
  };
}

// Usage
app.post('/api/projects/:projectId/files', 
  requireProjectRole('editor'),
  async (req, res) => { /* ... */ }
);
```

---

## API Endpoints

### Projects

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/projects` | ✓ | List user's projects |
| POST | `/api/projects` | ✓ | Create new project |
| GET | `/api/projects/:id` | ✓ member | Get project details |
| PATCH | `/api/projects/:id` | ✓ admin | Update project |
| DELETE | `/api/projects/:id` | ✓ admin | Delete project |
| POST | `/api/projects/:id/invite` | ✓ admin | Invite user by email |

### Files

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/projects/:id/files` | ✓ member | List files |
| POST | `/api/projects/:id/files/upload-request` | ✓ editor | Get presigned upload URL |
| POST | `/api/files/confirm` | ✓ editor | Confirm upload completion |
| GET | `/api/files/:id` | ✓ member | Get file metadata |
| GET | `/api/files/:id/download` | ✓ member | Get presigned download URL |
| GET | `/api/files/:id/versions` | ✓ member | List version history |
| POST | `/api/files/:id/restore` | ✓ editor | Restore to version |
| DELETE | `/api/files/:id` | ✓ editor | Delete file |

### Links (Studio feature)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/files/:id/links` | ✓ member | Get all links in file |
| POST | `/api/files/:id/links` | ✓ editor | Create new link |
| PATCH | `/api/links/:id` | ✓ editor | Update link |
| DELETE | `/api/links/:id` | ✓ editor | Delete link |

### Audit (Enterprise)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/projects/:id/audit` | ✓ admin | Get audit log |
| GET | `/api/projects/:id/export` | ✓ admin | Export compliance package |

---

## CLI Integration

### New Commands

```bash
# Authentication
tencil login                    # Opens browser OAuth
tencil logout
tencil whoami                   # Show logged in user

# Project management
tencil projects list
tencil projects create "My Design" --domain ui
tencil projects switch <id>

# Cloud sync
tencil cloud push design.tencil         # Upload to current project
tencil cloud pull design.tencil         # Download latest
tencil cloud sync ./designs/            # Watch and auto-sync
tencil cloud history design.tencil      # Show version history
tencil cloud restore design.tencil --version 5

# Sharing
tencil cloud share design.tencil --view-only   # Generate share link
tencil cloud share design.tencil --editable    # Allow edits
```

### CLI Cloud Sync Implementation

```typescript
// packages/cli/src/commands/cloud-sync.ts
import chokidar from 'chokidar';
import { createHash } from 'crypto';
import { readFile } from 'fs/promises';

export async function cloudSyncCommand(paths: string[], options: { watch?: boolean }) {
  const projectId = await getCurrentProject();
  const api = new TencilCloudAPI(await getAuthToken());
  
  for (const path of paths) {
    await syncFile(api, projectId, path);
  }
  
  if (options.watch) {
    logger.info('Watching for changes...');
    
    chokidar.watch(paths).on('change', async (path) => {
      logger.step(1, 1, `Syncing ${path}...`);
      await syncFile(api, projectId, path);
      logger.success(`${path} synced`);
    });
  }
}

async function syncFile(api: TencilCloudAPI, projectId: string, path: string) {
  // Check if file exists in cloud
  const localContent = await readFile(path, 'utf-8');
  const localChecksum = createHash('sha256').update(localContent).digest('hex');
  
  const cloudFile = await api.getFileByName(projectId, basename(path));
  
  if (!cloudFile) {
    // New file: upload
    const { uploadUrl, key } = await api.requestUpload(projectId, {
      filename: basename(path),
      size: localContent.length
    });
    
    await uploadToPresignedUrl(uploadUrl, localContent);
    await api.confirmUpload(key, localChecksum);
    
  } else if (cloudFile.checksum !== localChecksum) {
    // Conflict: cloud has different version
    const localVersion = JSON.parse(localContent);
    const cloudContent = await api.downloadFile(cloudFile.id);
    const cloudVersion = JSON.parse(cloudContent);
    
    // Use Yjs to merge
    const merged = await mergeDocuments(cloudVersion, localVersion);
    
    // Upload merged version
    await uploadAndConfirm(api, projectId, path, JSON.stringify(merged));
    
    logger.warning('Merged local changes with cloud version');
  }
}
```

---

## Deployment Phases

### Phase 1: Storage (Months 1-3)

**Features:**
- User auth (Clerk)
- File upload/download via presigned URLs
- Basic project sharing (link-based)
- CLI `cloud push/pull`

**Infrastructure:**
- Railway: 1 web service, 1 PostgreSQL, 1 Redis
- R2: Single bucket, no CDN

**Pricing tier:** Free (gather feedback)

### Phase 2: Collaboration (Months 4-6)

**Features:**
- WebSocket real-time sync
- Yjs CRDT integration
- Web app file browser
- Version history

**Infrastructure upgrades:**
- Scale Railway to 2-4 services
- Add CDN for R2 assets

**Pricing tier:** $10-15/user (Team launch)

### Phase 3: Enterprise (Months 7-12)

**Features:**
- Audit logs
- SSO/SAML (Clerk Enterprise)
- On-premise deployment option
- Compliance exports

**Infrastructure upgrades:**
- Read replicas for PostgreSQL
- Redis Cluster
- Custom domain support

**Pricing tier:** $35/user + Enterprise custom

---

## Cost Projections

### Monthly Infrastructure Costs

| Component | Starter (100 users) | Growth (1,000 users) | Scale (10,000 users) |
|-----------|-------------------|----------------------|----------------------|
| Railway services | $50 | $200 | $800 |
| PostgreSQL (managed) | $15 | $75 | $400 |
| Redis | $20 | $50 | $150 |
| R2 Storage | $5 (50GB) | $25 (500GB) | $150 (2TB) |
| R2 Egress | $0 | $0 | $20 |
| Clerk | $25 | $100 | $500 |
| **Total** | **$115** | **$450** | **$2,020** |

### Unit Economics

| Metric | Target |
|--------|--------|
| ARPU (Average Revenue Per User) | $20/month |
| Gross Margin | 85% |
| CAC (Customer Acquisition Cost) | $150 |
| LTV (Lifetime Value) | $1,200 (5-year) |
| LTV:CAC Ratio | 8:1 |

**Break-even:** ~10 paying users covers infrastructure for 100 free users.

---

## Security Checklist

- [ ] All endpoints behind authentication
- [ ] Row-level security in PostgreSQL (users can only see their projects)
- [ ] Presigned URLs expire in 15 minutes
- [ ] File size limits (100MB default, configurable)
- [ ] Virus scanning on upload (ClamAV or Cloudflare)
- [ ] Rate limiting: 100 req/min per user, 10 file uploads/min
- [ ] Audit logging for all destructive operations
- [ ] SOC 2 Type II preparation (for Enterprise sales)
- [ ] GDPR compliance (data export, deletion)

---

## Operational Runbooks

### Database Backup

```bash
# Daily automated backup (pg_dump to R2)
# Retention: 7 days daily, 4 weeks weekly, 12 months monthly
```

### Incident Response

| Severity | Response | Examples |
|----------|----------|----------|
| P0 (Critical) | Page immediately, 15-min SLA | Data loss, security breach, complete outage |
| P1 (High) | Respond within 1 hour | Degraded sync, partial API failure |
| P2 (Medium) | Respond within 4 hours | Slow queries, minor feature degradation |
| P3 (Low) | Next business day | UI polish, feature requests |

### Scaling Triggers

| Metric | Action |
|--------|--------|
| CPU > 70% for 5 min | Scale Railway to next tier |
| DB connections > 80% | Add connection pooling (PgBouncer) |
| Redis memory > 80% | Evict old sessions, add memory |
| Storage > 80% | Alert for cleanup or expansion |

---

## Resources

- **Clerk:** https://clerk.dev
- **Railway:** https://railway.app
- **Cloudflare R2:** https://developers.cloudflare.com/r2
- **Socket.io:** https://socket.io
- **Yjs:** https://github.com/yjs/yjs
- **Bull:** https://github.com/OptimalBits/bull

---

**Next Steps:**
1. Create Railway account, deploy "Hello World" API
2. Set up Clerk project, implement `/api/auth` endpoints
3. Create R2 bucket, test presigned upload/download
4. Build CLI `login` and `cloud push` commands

---

*Document Status: Technical specification*  
*Depends on: `@tencil/schema` v1.0, CLI core implementation*
