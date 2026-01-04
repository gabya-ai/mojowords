# Vocal Tool Master Plan

> [!IMPORTANT]
> This document acts as the **Immutable Source of Truth** for the project scope and vision.
> **DO NOT EDIT** this file without explicit permission from the user.

## Vision
A premium, engaging vocabulary building tool initially designing for school students (starting with 8-year-olds for the first three months) with a long-term vision to serve adult English learners. The tool leverages **Agentic AI** to create a personalized, safe, and "juicy" learning experience.

## Core Pillars & Roadmap

### 1. Agentic AI Foundation <!-- Phase: Active via Refactor -->
**What it does**: A scalable, modular ecosystem of AI agents that power every aspect of the learning experience.
*Current Status: MVP Re-evaluation. The current single-route implementation is insufficient for the vision. Needs refactoring into distinct, robust services.*
- **Acquisition Agents**:
    - [ ] **Definition Agent**: Generates clear, age-appropriate definitions based on the user's grade level.
    - [ ] **Sentence Agent**: Creates contextual usage examples that make the word's meaning intuitive.
    - [ ] **Picture Agent**: Generates vibrant, mnemonic-rich images (via Nano Banana) to aid visual memory.
    - [ ] **Evaluator Agent**: Scans all generated content to ensure it is safe, equitable, and educational.
    - [ ] **Leveling Agent**: Analyzes words to rate their difficulty and educational level (e.g., CEFR or Grade Level).
- **Review Agents**:
    - [ ] **Clarification Agent**: Provides on-demand, simpler explanations or new examples during flashcard review.
- **Engagement Agents**:
    - [ ] **Story Agent**: Weaves a user's word list into a personalized, cohesive story.
    - [ ] **Insight Agent**: Analyzes learning patterns to generate encouraging summaries.

### 2. User & Profile Management <!-- Phase: High Priority -->
**What it does**: Enables a personalized, persistent experience for multiple learners.
*Current Status: Frontend Context Implemented. Backend Integration Pending.*
- **Features**:
    - [x] **Authentication**: Secure logging via Google Sign-In to sync data across devices. (Verified: Double sign-in fixed, Parent/Child isolation fixed).
    - [x] **Onboarding Survey**: A one-time flow to capture the learner's name, age, grade, and location.
    - [ ] **Profile Management**: Manage multiple kid profiles and switch contexts.
    - [ ] **Data Logging & Tracking**:
        - [ ] **User Behavior Table**: Track session lengths, feature usage, and click patterns.
        - [ ] **Learning History**: Persistent record of every word seen, reviewed, and tested.

### 3. Acquisition (Input) <!-- Phase: Active -->
**What it does**: The entry point for learning.
- **Features**:
    - [x] **Manual Word Input**: A "juicy" input interface.
    - [x] **AI-Generated Content (MVP)**: Currently operating on a basic implementation. Needs migration to robust Agentic architecture.
    - [ ] **Audio Pronunciation**: Text-to-Speech playback.

### 4. Retention (Review) <!-- Phase: In Progress -->
**What it does**: Scientifically-backed review system.
- **Features**:
    - [x] **Flashcard Interface**: Gamified front/back card view.
    - [ ] **Spaced Repetition Algorithm**: Schedules reviews at optimal intervals.
    - [ ] **Clarification Request**: "Help" button summoning the Clarification Agent.

### 5. Validation (Test) <!-- Phase: Pending -->
**What it does**: Verifies mastery.
- **Features**:
    - [ ] **`/test` Route**: Dedicated assessment environment.
    - [ ] **Fill-in-the-blank**: Context-based recall.
    - [ ] **Multiple Choice**: Recognition testing.
    - [ ] **Story Learning Mode**: Identify words within a generated story.

### 6. Insight (Dashboard) <!-- Phase: Pending -->
**What it does**: Visualizes progress.
- **Features**:
    - [ ] **`/dashboard` Route**: Central hub for statistics.
    - [ ] **Progress Animation**: **[NEW]** A dynamic, visual representation of the child's learning journey (e.g., a garden growing or a rocket traveling) that evolves as they master words.
    - [ ] **Recent Activity Log**: Chronological feed.
    - [ ] **AI-Generated Learning Insights**: Narrative reports.
    - [ ] **Vocabulary Size Tracking**: Growth chart.

### 7. Integration & Expansion <!-- Phase: Future -->
**What it does**: Extends utility.
- **Features**:
    - [ ] **Google Slides Export**
    - [ ] **Community Lists**
    - [ ] **Mobile PWA Optimization**

## Verification Protocol
**Goal**: Ensure quality and correctness through structured validation layers.
1.  **Unit Tests**: All utility functions (spaced repetition logic, data parsers) must have Jest tests.
2.  **Agent Evaluation**:
    -   Create a "Golden Set" of 50 diverse words (easy, hard, ambiguous).
    -   Run Agents against this set and manually grade quality (Accuracy, Safety, Grade-Level Fit).
    -   Automate regression testing using a "Judge Agent" to score new outputs against the Golden Set.
3.  **End-to-End (E2E) Flows**:
    -   Verify critical paths: Sign Up -> Onboarding -> Word Input -> Review -> Dashboard.
4.  **UX "Juice" Check**: Manual review of animations and transitions to ensure the "wow" factor for kids.

## Architectural Rules
1.  **Aesthetics First**: Vibrant, premium designs.
2.  **Robust Agent Architecture**: Agents must be distinct services with typed interfaces, not just prompt strings.
3.  **Data Integrity**: User data (words, progress) is sacred. All interactions are logged.
