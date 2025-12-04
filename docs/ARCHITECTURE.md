# Architecture Documentation
**Project:** Hybrid Knowledge Mesh: Visual Light Researcher  
**Namespace:** `mba.robin.hkm.visualresearch`

## 1. System Overview
The application is a single-page React application (SPA) serving as a specialized research interface. It leverages the Google GenAI SDK (Gemini 3 Pro, Veo, Imagen) to perform "Deep Research"—a process of gathering, verifying, and visualizing information to reduce "ontical noise."

## 2. Technology Stack

### Frontend Core
*   **Framework**: React 19 (Functional Components, Hooks)
*   **Build Tool**: Vite (implied via ES modules)
*   **Styling**: Tailwind CSS (Utility-first, responsive)
*   **Icons**: Lucide-React (Vector iconography)

### AI & Reasoning Layer
*   **SDK**: `@google/genai`
*   **Text/Reasoning Model**: `gemini-3-pro-preview` (Configured for Search Grounding)
*   **Image Generation**: `gemini-3-pro-image-preview` (High fidelity visualization)
*   **Video Generation**: `veo-3.1-fast-generate-preview` (Temporal explainer synthesis)
*   **Image Editing**: `gemini-3-pro-image-preview` (Refinement/Tuning)

## 3. Key Services & Logic

### `services/geminiService.ts`
The core logic gate for the application.
*   **`researchTopicForPrompt`**:
    *   Accepts user topic + optional file attachment (Orthogonal Source).
    *   Constructs a system prompt enforcing the "Expert Visual Researcher" persona.
    *   Enables `googleSearch` tool for grounding.
    *   **Phase-Locking Logic**: Extracts verified `FACTS` separate from the `VISUAL_PROMPT`. This ensures the visual generation is seeded with grounded truth, not hallucination.
    *   Returns structured `ResearchResult` containing facts, search citations (URLs), and the synthesized prompt.

*   **`generateInfographicImage`**:
    *   Calls `gemini-3-pro-image-preview`.
    *   Uses direct `Modality.IMAGE` output.

*   **`generateExplainerVideo`**:
    *   Invokes `models.generateVideos` using Veo.
    *   Implements polling logic (`operations.getVideosOperation`) to handle asynchronous generation (prevents UI freezing).
    *   Authenticates final video fetch via API Key appendage.

## 4. Component Structure

*   **`App.tsx` (The Orchestrator)**
    *   Manages state: `contentHistory`, `loadingStep`, `apiKey`, `templates`.
    *   **Persistence**: Uses `localStorage` to save/load `SettingsTemplate` (user configurations).
    *   **Security**: dynamically handles API Key selection via `window.aistudio` overlay if required for Veo/Pro models.

*   **`IntroScreen.tsx` (The Liturgy)**
    *   Renders the "Hyper-Tension Knowledge Mesh" animation.
    *   Visualizes the theoretical framework: Chaos -> Convergence -> Renormalization -> Truth Core.

*   **`Loading.tsx` (The Reactor)**
    *   Visualizes the "processing" of truth.
    *   Displays verified facts in real-time as they are extracted, reinforcing the "Phase Tuning" feedback loop.

*   **`Infographic.tsx` (The Canvas)**
    *   Handles display of both Image and Video content.
    *   Supports "Deep Zoom" for inspection of schematic details.

## 5. Future Integration: The Persistent Mesh
This microapp is designed to eventually act as a "Lens" or input node for the backend hKM.

*   **PostgreSQL Integration**:
    *   *Current*: Local React State / LocalStorage.
    *   *Future*: `ResearchResult` objects will be committed to Postgres tables `research_sessions` and `verified_facts`.
*   **Vector Mesh (Qdrant)**:
    *   *Future*: Generated `visualPrompt` and extracted `facts` will be embedded and stored in Qdrant to allow semantic retrieval of past research sessions across the organization.
*   **Ontology (Neo4j)**:
    *   *Future*: Entities extracted during the `researchTopicForPrompt` phase will be mapped to Neo4j nodes, building the persistent "Lattice" of truth.

## 6. Security & Permissions
*   **API Keys**: Strictly handled via `process.env.API_KEY` or the AI Studio overlay. No persistent storage of keys in LocalStorage.
*   **File Uploads**: Client-side Base64 encoding. Max 20MB limit enforced in `App.tsx`.
