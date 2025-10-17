# NPI Management Feature Implementation

## 📊 Overall Progress: 0% (0/2 screens)

## 🔗 Screen Status

| Screen | Figma Node | Mobile | Desktop | API | Tests | Priority |
|--------|------------|--------|---------|-----|-------|----------|
| **NPI Requests** | 6804-13591 | ⏸️ Pending | ⏸️ Pending | ❌ | ❌ | 🔴 Critical |
| **Active Connections** | 6804-13512 | ⏸️ Pending | ⏸️ Pending | ❌ | ❌ | 🔴 Critical |

## 🏗️ NPI Architecture

NPI (Node Protocol Interface) manages the connection between research nodes in the PRISM federated network.

### Key Components
| Component | Purpose | Status | Location |
|-----------|---------|--------|----------|
| **NPIRequestTable** | Display pending connection requests | ⏸️ | `packages/ui-components/organisms/NPIRequestTable` |
| **NPIConnectionCard** | Show active connection details | ⏸️ | `packages/ui-components/molecules/NPIConnectionCard` |
| **ConnectionStatus** | Real-time connection indicator | ⏸️ | `packages/ui-components/atoms/ConnectionStatus` |
| **HandshakeModal** | 4-phase handshake visualization | ⏸️ | `packages/ui-components/organisms/HandshakeModal` |

## 📋 NPI Data Models

```typescript
interface NPIRequest {
  id: string;
  nodeId: string;
  nodeName: string;
  institution: string;
  requestDate: Date;
  status: 'pending' | 'approved' | 'rejected';
  certificateFingerprint: string;
  publicKey: string;
  requestType: 'incoming' | 'outgoing';
  metadata: {
    version: string;
    capabilities: string[];
    location: string;
  };
}

interface NPIConnection {
  id: string;
  nodeId: string;
  nodeName: string;
  status: 'connected' | 'disconnected' | 'error';
  establishedAt: Date;
  lastActivity: Date;
  sessionToken: string;
  accessLevel: 'read' | 'write' | 'admin';
  metrics: {
    latency: number;
    uptime: number;
    dataTransferred: number;
  };
}
```

## 🔐 4-Phase Handshake Protocol

```
Phase 1: Encrypted Channel
├── ECDH Key Exchange
├── AES-256-GCM Setup
└── Perfect Forward Secrecy

Phase 2: Node Identification
├── X.509 Certificate Exchange
├── SHA-256 Fingerprint Verification
└── Node Registry Check

Phase 3: Authentication
├── Challenge-Response
├── RSA-2048 Signature
└── Proof of Private Key

Phase 4: Session Management
├── Session Token Generation
├── Capability Negotiation
└── Rate Limiting Setup
```

## 📱 NPI Requests Screen

### Features
- [ ] Table of pending requests
- [ ] Approve/Reject actions
- [ ] View certificate details
- [ ] Filter by status
- [ ] Search by institution
- [ ] Bulk approve/reject
- [ ] Export request history
- [ ] Request details modal

### Actions
```typescript
interface NPIRequestActions {
  approveRequest: (requestId: string) => Promise<void>;
  rejectRequest: (requestId: string, reason: string) => Promise<void>;
  viewCertificate: (requestId: string) => void;
  initiateHandshake: (nodeId: string) => Promise<void>;
}
```

## 🌐 Active Connections Screen

### Features
- [ ] Grid/List view toggle
- [ ] Real-time status updates
- [ ] Connection metrics
- [ ] Disconnect action
- [ ] View session details
- [ ] Data transfer stats
- [ ] Latency monitoring
- [ ] Error logs

### Connection Card Info
- Node name and ID
- Institution
- Connection duration
- Data transferred
- Current status
- Last activity
- Access level
- Quick actions

## 📊 NPI Context

```typescript
interface NPIContext {
  requests: NPIRequest[];
  connections: NPIConnection[];
  loading: boolean;
  error: Error | null;

  // Request Management
  fetchRequests: () => Promise<void>;
  approveRequest: (id: string) => Promise<void>;
  rejectRequest: (id: string, reason: string) => Promise<void>;

  // Connection Management
  fetchConnections: () => Promise<void>;
  disconnect: (nodeId: string) => Promise<void>;
  reconnect: (nodeId: string) => Promise<void>;

  // Handshake
  initiateHandshake: (nodeId: string) => Promise<void>;
  getHandshakeStatus: (nodeId: string) => HandshakePhase;
}
```

## 🎯 Implementation Commands

```bash
# Extract NPI screens from Figma
claude /extract-feature npi

# Implement NPI requests screen
claude /implement-screen NPIRequests npi

# Create NPI context
claude /implement-context NPI

# Generate handshake simulation
claude /generate-handshake-mock
```

## 📈 Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Screens Complete | 0/2 | 2/2 |
| Handshake Phases | 0/4 | 4/4 |
| Test Coverage | 0% | 80% |
| Real-time Updates | ❌ | ✅ |

## 🔄 NPI Request Flow

```
1. New node sends connection request
   ↓
2. Request appears in NPI Requests
   ↓
3. Admin reviews certificate
   ↓
4. Admin approves/rejects
   ↓
5. If approved, initiate handshake
   ↓
6. Complete 4-phase protocol
   ↓
7. Connection appears in Active
   ↓
8. Monitor connection health
```

## 🧪 Test Scenarios

1. **Request Management**
   - Display pending requests
   - Approve request successfully
   - Reject with reason
   - Handle expired requests

2. **Connection Management**
   - Show active connections
   - Update status in real-time
   - Disconnect gracefully
   - Auto-reconnect on failure

3. **Handshake Protocol**
   - Complete all 4 phases
   - Handle phase failures
   - Retry mechanism
   - Timeout handling

## 🔗 Related Backend Endpoints (Future)

```typescript
// When backend is ready, these will replace mocks
POST   /api/npi/approve
POST   /api/npi/reject
GET    /api/npi/requests
GET    /api/npi/connections
POST   /api/npi/handshake/initiate
GET    /api/npi/handshake/status/:nodeId
DELETE /api/npi/connection/:nodeId
```

---

*Last Updated: 2025-01-17 10:30:00*
*Next Task: Implement NPI Requests screen*