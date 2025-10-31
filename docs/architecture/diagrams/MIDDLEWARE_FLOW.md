# Middleware Flow Diagrams

**Visual representation of middleware architecture and data flows**

---

## 1. Authentication Flow (Sequence Diagram)

Shows the complete flow from user login to authenticated API call.

```mermaid
sequenceDiagram
    participant User
    participant LoginScreen
    participant AuthContext
    participant UserAuthService
    participant ResearchNodeMiddleware
    participant ChannelManager
    participant SessionManager
    participant Backend

    User->>LoginScreen: Enter credentials
    LoginScreen->>AuthContext: handleLogin(email, password)
    AuthContext->>UserAuthService: login(username, password)

    UserAuthService->>ResearchNodeMiddleware: ensureSession()
    ResearchNodeMiddleware->>ChannelManager: openChannel()
    ChannelManager->>Backend: POST /api/channel/open (ECDH)
    Backend-->>ChannelManager: Encrypted channel established
    ChannelManager-->>ResearchNodeMiddleware: Channel ready

    ResearchNodeMiddleware->>SessionManager: authenticateSession()
    SessionManager->>Backend: Phase 2: Identify (cert exchange)
    SessionManager->>Backend: Phase 3: Challenge (RSA signature)
    SessionManager->>Backend: Phase 4: Session token
    Backend-->>SessionManager: Token issued
    SessionManager-->>ResearchNodeMiddleware: Session ready

    ResearchNodeMiddleware-->>UserAuthService: Session established

    UserAuthService->>Backend: POST /api/userauth/login (encrypted)
    Backend-->>UserAuthService: { token, expiresAt, user }

    UserAuthService->>UserAuthService: Store token in secure storage
    UserAuthService-->>AuthContext: { token, expiresAt }
    AuthContext->>AuthContext: Set user state
    AuthContext-->>LoginScreen: Navigate to home screen
    LoginScreen-->>User: Authenticated!

    Note over UserAuthService: Auto-refresh scheduled<br/>5 minutes before expiry
```

---

## 2. 4-Phase Handshake Flow

Detailed breakdown of the cryptographic handshake protocol.

```mermaid
graph TD
    A["Client initiates connection"] --> B["Phase 1: Encrypted Channel"]

    B --> B1["Client generates ECDH P-384 keys"]
    B --> B2["Client sends public key to backend"]
    B2 --> B3["Backend generates ECDH P-384 keys"]
    B3 --> B4["Backend sends public key to client"]
    B4 --> B5["Both derive shared secret"]
    B5 --> B6["Symmetric AES-256-GCM key created"]
    B6 --> B7["✅ Encrypted Channel Ready"]

    B7 --> C["Phase 2: Node Identification"]
    C --> C1["Client sends X.509 certificate"]
    C1 --> C2["Backend validates certificate"]
    C2 --> C3["Backend sends its certificate"]
    C3 --> C4["Client validates certificate"]
    C4 --> C5["✅ Mutual Node Identification"]

    C5 --> D["Phase 3: Mutual Authentication"]
    D --> D1["Backend sends 32-byte challenge"]
    D1 --> D2["Client signs challenge with RSA-2048"]
    D2 --> D3["Client sends signature to backend"]
    D3 --> D4["Backend verifies signature"]
    D4 --> D5["Backend sends 32-byte challenge"]
    D5 --> D6["Backend verifies client response"]
    D6 --> D7["✅ Mutual Authentication Complete"]

    D7 --> E["Phase 4: Session Management"]
    E --> E1["Backend issues JWT token"]
    E1 --> E2["Token has 1-hour lifetime"]
    E2 --> E3["Capabilities assigned"]
    E3 --> E4["Token sent to client"]
    E4 --> E5["Client stores token securely"]
    E5 --> E6["✅ Session Ready - API Ready"]

    E6 --> F["Client can now make API calls"]
    F --> G["Token auto-refreshes 5min before expiry"]
    G --> H["Loop continues for 30-minute channel lifetime"]
```

---

## 3. Component Integration Architecture

Shows how middleware integrates with the application layers.

```mermaid
graph TB
    subgraph UI["Application Layer"]
        LS["LoginScreen<br/>(React/React Native)"]
        HS["HomeScreen"]
        AC["AuthContext Provider"]
    end

    subgraph Auth["Authentication Layer"]
        RAS["RealAuthService<br/>(Domain → Middleware adapter)"]
        UAS["UserAuthService<br/>(login/logout/refresh)"]
    end

    subgraph Middleware["Middleware Layer"]
        RNM["ResearchNodeMiddleware<br/>(4-phase handshake)"]
        EHC["EncryptedHttpClient<br/>(Automatic encryption)"]
    end

    subgraph Core["Core Services"]
        CM["ChannelManager<br/>(ECDH P-384)"]
        SM["SessionManager<br/>(Token mgmt)"]
        CD["CryptoDriver<br/>(WebCrypto)"]
    end

    subgraph Storage["Secure Storage"]
        ESS["ElectronSecureStorage<br/>(Desktop)"]
        RNSS["ReactNativeSecureStorage<br/>(Mobile)"]
    end

    subgraph Backend["Backend"]
        BK["InteroperableResearchNode<br/>http://localhost:5000"]
    end

    LS -->|Login credentials| AC
    AC -->|Handle auth| RAS
    RAS -->|Real login| UAS
    UAS -->|Ensure session| RNM

    RNM -->|Phase 1| CM
    RNM -->|Phase 2-4| SM
    CM -->|Crypto ops| CD
    SM -->|Crypto ops| CD

    UAS -->|Store token| ESS
    UAS -->|Store token| RNSS

    RNM -->|Encrypted API| EHC
    EHC -->|All requests| CM
    EHC -->|Verify session| SM

    EHC -->|HTTPS encrypted| BK
    BK -->|Encrypted response| EHC

    HS -->|API calls| RNM
    RNM -->|User data| AC
    AC -->|Update UI| HS
```

---

## 4. Data Flow: Login to First API Call

Shows data and message flow in detail.

```mermaid
sequenceDiagram
    participant App as Application
    participant Auth as AuthContext
    participant UAS as UserAuthService
    participant RNM as ResearchNodeMiddleware
    participant CM as ChannelManager
    participant SM as SessionManager
    participant SS as SecureStorage
    participant BE as Backend

    App->>Auth: onLogin(email, password)

    rect rgb(200, 220, 255)
        Note over UAS,BE: Initialize Session (4-phase handshake)
        Auth->>UAS: login({username, password})
        UAS->>RNM: ensureSession()

        rect rgb(100, 200, 100)
            Note over CM,BE: Phase 1: Channel (ECDH P-384)
            CM->>BE: POST /api/channel/open {publicKey}
            BE-->>CM: {channelId, publicKey}
            CM->>CM: derive AES-256 key from shared secret
        end

        rect rgb(100, 200, 100)
            Note over SM,BE: Phase 2-4: Session (Certificate + Challenge)
            SM->>BE: Identify: {certificate}
            SM->>BE: Challenge: signed(challenge)
            SM->>BE: Authenticate: token+capabilities
            BE-->>SM: {sessionToken, expiresAt, capabilities}
        end

        CM-->>RNM: Channel ready
        SM-->>RNM: Session ready
    end

    rect rgb(200, 255, 220)
        Note over UAS,BE: Login
        RNM-->>UAS: ensureSession() complete

        UAS->>CM: encrypt({username, password})
        CM-->>UAS: encryptedPayload

        UAS->>BE: POST /api/userauth/login (encrypted)
        BE->>CM: decrypt(encryptedPayload)
        CM-->>BE: {username, password}
        BE-->>UAS: {token, expiresAt, user} (encrypted)

        UAS->>CM: decrypt(response)
        CM-->>UAS: {token, expiresAt, user}
    end

    rect rgb(255, 220, 200)
        Note over UAS,SS: Persist
        UAS->>SS: setItem('userauth:state', {token, user})
        SS-->>UAS: stored
        UAS->>UAS: scheduleTokenRefresh() at expiresAt - 5min
    end

    UAS-->>Auth: {token, expiresAt}
    Auth->>App: setUser(user)
    App->>App: Navigate to HomeScreen

    Note over App,BE: Now authenticated!

    App->>RNM: invoke({path: '/api/data'})
    RNM->>SM: get session token
    SM-->>RNM: token
    RNM->>CM: encrypt(payload)
    CM-->>RNM: encryptedPayload
    RNM->>BE: GET /api/data (with encrypted payload + token)
    BE-->>RNM: {data} (encrypted)
    RNM->>CM: decrypt(response)
    CM-->>RNM: {data}
    RNM-->>App: data
```

---

## 5. Storage Architecture (Platform-Specific)

Shows how tokens are stored securely on each platform.

```mermaid
graph TD
    subgraph Interface["Secure Storage Interface"]
        SI["SecureStorage<br/>getItem/setItem/removeItem"]
    end

    subgraph Desktop["Desktop (Electron)"]
        ESS["ElectronSecureStorage"]

        subgraph Windows["Windows"]
            DPAPI["DPAPI<br/>(Windows Data Protection)"]
        end

        subgraph macOS["macOS"]
            KC["Keychain"]
        end

        subgraph Linux["Linux"]
            LS["libsecret"]
        end

        ESS -->|Windows| DPAPI
        ESS -->|macOS| KC
        ESS -->|Linux| LS
    end

    subgraph Mobile["Mobile (React Native)"]
        RNSS["ReactNativeSecureStorage<br/>(Expo SecureStore)"]

        subgraph iOS["iOS"]
            IKC["Keychain<br/>Services"]
        end

        subgraph Android["Android"]
            AESP["EncryptedShared<br/>Preferences"]
        end

        RNSS -->|iOS| IKC
        RNSS -->|Android| AESP
    end

    SI --> ESS
    SI --> RNSS

    subgraph Data["Data Stored"]
        TOKEN["Auth Token"]
        USER["User Info"]
        CH["Channel State"]
        SES["Session State"]
    end

    TOKEN -->|stored in| Desktop
    TOKEN -->|stored in| Mobile
    USER -->|stored in| Desktop
    USER -->|stored in| Mobile
    CH -->|stored in| Desktop
    CH -->|stored in| Mobile
    SES -->|stored in| Desktop
    SES -->|stored in| Mobile

    style DPAPI fill:#0078d4
    style KC fill:#999
    style LS fill:#ff6600
    style IKC fill:#000
    style AESP fill:#3ddc84
```

---

## 6. Token Lifecycle and Auto-Refresh

Timeline showing token refresh behavior.

```mermaid
graph LR
    subgraph Login["Login (T=0)"]
        L1["User logs in"]
        L2["Token: valid<br/>Expires: T+60min"]
        L1 -->|Obtain token| L2
    end

    subgraph Early["T+0 to T+55min"]
        E1["Token in use"]
        E2["✅ Refreshes scheduled<br/>for T+55min"]
        E1 --> E2
    end

    subgraph Refresh["T+55min (Auto-Refresh)"]
        R1["5min before expiry"]
        R2["Auto-refresh triggered"]
        R3["New token obtained"]
        R4["Old token discarded"]
        R5["New refresh scheduled<br/>for T+115min"]
        R1 --> R2 --> R3 --> R4 --> R5
    end

    subgraph Continue["T+55min to T+115min"]
        C1["User continues with<br/>refreshed token"]
        C2["✅ Process repeats<br/>indefinitely"]
        C1 --> C2
    end

    subgraph Expiry["T+60min (If no refresh)"]
        EX1["Without refresh:<br/>Token expires"]
        EX2["❌ User must re-login"]
        EX1 --> EX2
    end

    Login --> Early
    Early --> Refresh
    Refresh --> Continue
    Continue -.->|If not refreshed| Expiry
    Continue -.->|If refreshed| Refresh

    style Login fill:#90EE90
    style Refresh fill:#FFB6C1
    style Expiry fill:#FF6347
```

---

## 7. Error Handling Flow

How errors are handled and propagated through the system.

```mermaid
graph TD
    subgraph Request["API Request"]
        A["invoke({path, method})"]
    end

    subgraph SessionCheck["Session Check"]
        B{"Session<br/>valid?"}
        B -->|No| C["ensureSession()"]
        C -->|Success| D["Session ready"]
        C -->|Fail| E["SessionError"]
    end

    B -->|Yes| D

    subgraph Encryption["Encrypt Request"]
        F["Encrypt payload<br/>with session key"]
        F -->|Success| G["Send to backend"]
        F -->|Fail| H["CryptoError"]
    end

    D --> F

    subgraph Backend["Backend Processing"]
        I["Backend processes<br/>encrypted request"]
        I -->|Success| J["Encrypted response"]
        I -->|Error| K["HTTP error"]
        I -->|Auth fail| L["401 Unauthorized"]
    end

    G --> I

    subgraph Decryption["Decrypt Response"]
        M["Decrypt response"]
        M -->|Success| N["Return data"]
        M -->|Fail| O["DecryptionError"]
    end

    J --> M

    subgraph ErrorHandling["Error Handling"]
        E -->|Retry| A
        H -->|Throw| P["CryptoError"]
        K -->|Throw| Q["NetworkError"]
        L -->|Clear auth,<br/>show login| R["AuthError"]
        O -->|Throw| S["DecryptionError"]
        N -->|Success| T["Return to caller"]
    end

    K --> ErrorHandling
    L --> ErrorHandling
    H --> ErrorHandling
    O --> ErrorHandling
    E --> ErrorHandling

    T --> U["User code handles<br/>or catches error"]
    P --> U
    Q --> U
    R --> U
    S --> U
```

---

## 8. Channel Lifecycle

Shows channel creation, reuse, and expiration cycle.

```mermaid
stateDiagram-v2
    [*] --> Idle: App starts

    Idle --> OpeningChannel: ensureSession() called

    OpeningChannel --> ChannelReady: ECDH P-384<br/>key exchange<br/>AES-256 key derived

    ChannelReady --> InUse: Make API calls<br/>with encryption

    InUse --> InUse: Channel reused<br/>for all requests

    InUse --> Checking: 30min timeout<br/>check

    Checking --> Expired: Lifetime exceeded
    Checking --> InUse: Still valid

    Expired --> OpeningChannel: Create new channel

    InUse --> Logout: User logout
    Logout --> Closed: Channel discarded<br/>Keys destroyed<br/>Perfect Forward Secrecy
    Closed --> [*]

    note right of ChannelReady
        Channel ID: xyz123
        Created: 14:30:00
        Expires: 15:00:00
        Key: [encrypted in memory]
    end note

    note right of InUse
        All requests encrypted with channel key
        No plaintext data on network
        Each request uses new IV + GHASH tag
    end note

    note right of Expired
        After 30 minutes:
        - Old keys destroyed
        - New ECDH key exchange
        - New symmetric key
        - No data reuse
    end note
```

---

## 9. Integration Points with Apps

Shows where middleware integrates into Desktop and Mobile apps.

```mermaid
graph TB
    subgraph Desktop["Desktop App (Electron + React)"]
        DM["main.tsx<br/>(Electron main)"]
        DR["renderer<br/>(React app)"]

        DM -->|Initialize| DMInit["initializeAndHydrate()"]
        DMInit -->|Restore state| DChan["Restore channel<br/>from storage"]
        DMInit -->|Restore state| DSess["Restore session<br/>from storage"]

        DR -->|Login| DCTX["AuthContext"]
        DCTX -->|Use| DRAS["RealAuthService"]
        DRAS -->|Call| DUA["UserAuthService<br/>from middleware"]

        DR -->|API calls| DRN["ResearchNodeMiddleware<br/>from middleware"]
        DRN -->|Encrypted| DENC["EncryptedHttpClient"]
    end

    subgraph Mobile["Mobile App (React Native + Expo)"]
        MA["App.tsx"]

        MA -->|Initialize| MAInit["initializeAndHydrate()"]
        MAInit -->|Restore state| MChan["Restore channel<br/>from SecureStore"]
        MAInit -->|Restore state| MSess["Restore session<br/>from SecureStore"]

        MA -->|Login| MCTX["AuthContext"]
        MCTX -->|Use| MRAS["RealAuthService"]
        MRAS -->|Call| MUA["UserAuthService<br/>from middleware"]

        MA -->|API calls| MRN["ResearchNodeMiddleware<br/>from middleware"]
        MRN -->|Encrypted| MENC["EncryptedHttpClient"]
    end

    subgraph Middle["Middleware Package"]
        UM["UserAuthService"]
        RNM2["ResearchNodeMiddleware"]
        EHC2["EncryptedHttpClient"]
        SS["SecureStorage<br/>Interface"]
    end

    DUA --> UM
    DRAS --> DUA
    DRN --> RNM2
    DENC --> EHC2
    DMInit -->|Store/restore| SS

    MUA --> UM
    MRAS --> MUA
    MRN --> RNM2
    MENC --> EHC2
    MAInit -->|Store/restore| SS

    subgraph Back["Backend"]
        BE["InteroperableResearchNode<br/>http://localhost:5000"]
    end

    EHC2 -->|Encrypted HTTPS| BE
    MENC -->|Encrypted HTTPS| BE
```

---

## Legend

### Colors

- 🟢 **Green**: Success state
- 🔵 **Blue**: Processing
- 🟡 **Yellow**: Warning/In progress
- 🔴 **Red**: Error state

### Symbols

- `→` Input/Output flow
- `--→` Encrypted channel
- `✅` Success
- `❌` Failure
- `...` Repeating process

---

## See Also

- **CLAUDE.md** - Architecture overview
- **IMPLEMENTATION_SUMMARY.md** - Implementation details
- **MIDDLEWARE_API.md** - Complete API reference
- **MIGRATION_GUIDE_AUTH.md** - Integration guide

