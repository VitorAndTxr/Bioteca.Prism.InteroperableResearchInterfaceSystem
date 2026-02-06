# Project Brief - Volunteer Module Sprint

> Phase 1 output — Product Manager leads, all roles assist.

**Project**: IRIS (Interoperable Research Interface System)
**Sprint**: Volunteer Module - Full Stack Implementation
**Date**: 2026-02-06
**Duration**: 2 weeks (deadline: 2026-02-20)
**Context**: Academic project (university deliverable)

## Business Objectives

| # | Objective | Success Criteria | Priority |
|---|-----------|-----------------|----------|
| 1 | Deliver a fully functional Volunteer CRUD module on the desktop app | User can create, list (paginated), view, edit, and delete volunteers through the IRIS desktop UI | Must |
| 2 | Expose Volunteer REST endpoints on the InteroperableResearchNode backend | All CRUD endpoints respond correctly through the PRISM 4-phase encrypted channel (Phase 1 + Phase 4 session) | Must |
| 3 | Replace mock data with real backend integration | Desktop app communicates with the running backend via middleware; `USE_MOCK = false` works end-to-end | Must |
| 4 | Demonstrate PRISM protocol compliance | Volunteer operations flow through ECDH channel establishment, session authentication, and encrypted request/response | Must |

## Scope

### In Scope

- **Backend (InteroperableResearchNode)**:
  - Create `VolunteerController` with CRUD endpoints (GET paginated, GET by ID, POST create, PUT update, DELETE)
  - Create `AddVolunteerPayload` and `UpdateVolunteerPayload` DTOs
  - Create `VolunteerDTO` for response serialization
  - Extend `IVolunteerService` and `VolunteerService` with Add, Update, Delete operations accepting payloads
  - All endpoints secured with `[PrismEncryptedChannelConnection]` + `[PrismAuthenticatedSession]` + `[Authorize("sub")]`

- **Frontend (Desktop App)**:
  - Wire `VolunteerService` to real backend (disable mock mode)
  - Implement Edit Volunteer form (`EditVolunteerForm.tsx`) — reuse `CreateVolunteerForm` pattern
  - Implement View Volunteer screen (read-only detail view)
  - Add Delete volunteer with confirmation modal
  - Connect existing list actions (View/Edit buttons) to proper navigation routes
  - Add routes for `/volunteers/view/:id` and `/volunteers/edit/:id`

- **Domain Package**:
  - Align `@iris/domain` Volunteer model with backend entity fields (volunteerCode, bloodType, height, weight, medicalHistory, consentStatus)

- **Integration Testing**:
  - Manual end-to-end test: desktop app creates a volunteer via encrypted channel to running backend, retrieves it in paginated list

### Out of Scope

- Volunteer association with Research projects (ResearchVolunteer join table)
- Volunteer clinical sub-entities (medications, conditions, events, allergies, vital signs)
- Mobile app volunteer features
- Automated test suite
- Production deployment or certificate management
- Volunteer data export/import
- Batch operations on volunteers

## Constraints

| Type | Constraint | Impact |
|------|-----------|--------|
| Timeline | 2-week academic deadline (2026-02-20) | Must prioritize demonstrable CRUD + integration over polish |
| Technical | Backend already has Entity, Repository, Service, DI registration for Volunteer | Reduces backend effort; only Controller + Payloads + DTOs + service method extensions needed |
| Technical | Frontend mock data pattern already established with 20 volunteers | Frontend screens and service scaffold exist; extend, don't rewrite |
| Technical | 4-phase PRISM protocol required for all backend calls | All endpoints must use encrypted channel + session authentication attributes |
| Technical | TypeScript strict mode, no `any` types | Frontend code must pass strict TypeScript compilation |
| Academic | Must be demonstrable for university presentation | Focus on working flows over edge-case coverage |

## Stakeholders

| Stakeholder | Role | Concerns |
|------------|------|----------|
| University Advisor | Academic evaluator | Demonstrable system integration, PRISM protocol compliance, code quality |
| Developer (Vitor) | Project owner & developer | Feature completeness within deadline, maintainable architecture |

## Business Risks

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|-----------|--------|-----------|
| 1 | Backend integration fails due to PRISM channel/session issues | Medium | High | Test channel establishment first; keep mock mode as fallback for demo |
| 2 | Scope creep into clinical sub-entities delays core CRUD | Medium | Medium | Strictly enforce out-of-scope list; clinical features are a separate sprint |
| 3 | Database migration issues with existing schema | Low | Medium | Volunteer table already exists in schema; no migration needed for core entity |

## Technical Risk Assessment

> To be completed by Tech Lead (`/tl plan`).

| # | Risk | Likelihood | Impact | Mitigation | Effort |
|---|------|-----------|--------|-----------|--------|
| 1 | *Pending TL assessment* | | | | |

## Specialist Notes

> To be completed by Dev Specialist (`/dev plan`) and QA Specialist (`/qa plan`).

### Developer Specialist

- Backend: Repository, Service, DI already registered. Missing: Controller, Payloads, DTOs, service method implementations for Add/Update/Delete with payload handling.
- Frontend: BaseService pattern established. VolunteerService exists with mock data. Need to implement real API calls, add Edit/View/Delete flows.
- Domain alignment: Frontend `Volunteer` model has `name` field; backend entity uses `VolunteerCode` (anonymous identifier) + no `name` field. This mismatch must be resolved — either add name to backend entity or adapt frontend to anonymized model.

### QA Specialist

- *Pending QA assessment*

---

## Architecture Context

### Backend Volunteer Infrastructure (Already Exists)

| Component | Status | Action Needed |
|-----------|--------|---------------|
| `Volunteer` Entity | Exists | None (fields: VolunteerCode, BirthDate, Gender, BloodType, Height, Weight, MedicalHistory, ConsentStatus) |
| `VolunteerConfiguration` (EF) | Exists | None |
| `IVolunteerRepository` | Exists | None |
| `VolunteerRepository` | Exists | None |
| `IVolunteerService` | Exists | Extend with Add/Update/Delete accepting payloads |
| `VolunteerService` | Exists | Implement payload-based operations |
| DI Registration | Exists | None |
| DbSet in PrismDbContext | Exists | None |
| **VolunteerController** | **Missing** | **Create with CRUD endpoints** |
| **AddVolunteerPayload** | **Missing** | **Create** |
| **UpdateVolunteerPayload** | **Missing** | **Create** |
| **VolunteerDTO** | **Missing** | **Create** |

### Frontend Volunteer Infrastructure (Already Exists)

| Component | Status | Action Needed |
|-----------|--------|---------------|
| `Volunteer` domain model | Exists | Align fields with backend entity |
| `VolunteerService` | Exists (mock mode) | Wire to real backend, add getById/update/delete |
| `VolunteersList` | Exists | Connect action buttons to routes |
| `CreateVolunteerForm` | Exists | Align fields with backend payload |
| `VolunteersScreen` | Exists | None |
| Routes (`/volunteers`, `/volunteers/add`) | Exist | Add `/volunteers/view/:id`, `/volunteers/edit/:id` |
| **EditVolunteerForm** | **Missing** | **Create (reuse CreateVolunteerForm pattern)** |
| **ViewVolunteerScreen** | **Missing** | **Create (read-only detail view)** |
| **Delete confirmation** | **Missing** | **Add to list actions with Modal** |

### Integration Flow

```
Desktop App (Electron)
    ↓ VolunteerService.createVolunteer()
    ↓ middleware.invoke() → ECDH Channel (Phase 1)
    ↓ Session Authentication (Phase 4)
    ↓ Encrypted HTTP POST
Backend (ASP.NET Core)
    ↓ [PrismEncryptedChannelConnection<AddVolunteerPayload>]
    ↓ [PrismAuthenticatedSession]
    ↓ VolunteerController.New()
    ↓ VolunteerService.AddAsync()
    ↓ VolunteerRepository → PostgreSQL
    ↓ Encrypted Response
Desktop App
    ↓ Decrypt → Convert DTO → Display
```

## Multi-Agent Team Structure

This sprint should be executed with a multi-agent team for parallel work:

| Agent | Role | Responsibilities |
|-------|------|-----------------|
| PM (Lead) | Product Manager | Orchestration, progress tracking, scope control |
| Backend Dev | .NET Specialist | VolunteerController, Payloads, DTOs, service extensions |
| Frontend Dev | TypeScript/React Dev | Edit/View/Delete screens, service integration, routing |
| TL | Tech Lead | Architecture review, domain model alignment decision |

### Parallelization Strategy

**Phase 1 (Days 1-3) — Can run in parallel:**
- TL: Resolve domain model mismatch (Volunteer name vs VolunteerCode)
- Backend Dev: Create Controller + Payloads + DTOs
- Frontend Dev: Create Edit/View screens and routes (against mock data)

**Phase 2 (Days 4-7) — Sequential after Phase 1:**
- Backend Dev: Test endpoints with Swagger
- Frontend Dev: Wire service to real backend, disable mock mode

**Phase 3 (Days 8-10) — Integration:**
- Full end-to-end testing through PRISM protocol
- Bug fixes and polish

**Phase 4 (Days 11-14) — Buffer:**
- Demo preparation, documentation, contingency
