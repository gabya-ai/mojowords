# **Mojowords Master Product Document**

## **1\. Vision & Strategy**

**Vision:** Mojowords is an English vocabulary tool initially designed for elementary school students (starting with 8-year-olds) but scalable to all learners. It incorporates best learning practices powered by AI agents to provide personalized learning, aspiring to be the "LeetCode for vocabulary."

**Target Audience:**

* **User (Parent):** The account holder who manages profiles and settings.  
* **Gardener (Child):** The learner who interacts with the core vocabulary features.

---

## **Phase 1: MVP (The "Refined PRD")**

*Status: Active Development*

### **2\. Core User Flows (MVP)**

#### **A. User Sign-in & Onboarding**

* **Trigger:** User visits Mojowords site.  
* **Flow:**  
  1. **Auth:** Google Sign-In prompts if not authenticated.  
  2. **Survey (First Time):** Modal asks for Gardener's Name (Required), Age, and State.  
  3. **Redirect:** User lands on Product Main Page.

#### **B. Gardener Input (Main Page)**

* **Action:** Gardener inputs a word and clicks "Learn" (or presses Enter).  
* **System Response:**  
  1. **Validation:** System calls **Evaluation-agent** to validate if the string is a real word and check for safety.  
     * *If Invalid:* Display error message.  
     * *If Valid:* Proceed.  
  2. **Definition Generation:** System calls **Generation-agent** (inputs: Word, Age) to generate:  
     * Age-appropriate definition.  
     * Sample sentence.  
  3. **Picture Generation:**  
     * *Trigger:* User clicks "Paint a picture".  
     * *Action:* System calls **Picture-agent** (inputs: Word, Definition Context) to render an image.  
  4. **Rating:** **Evaluation-agent** assigns a difficulty rating/grade level.

#### **C. Flashcard Review**

* **Entry:** Click "Flashcard" tab \-\> Configure settings \-\> Click "Start".  
* **Interaction:**  
  * **Front:** Displays the **Word**.  
    * *Visual:* User must click "Show Picture" to reveal the image (lazy loaded).  
  * **Back:** Displays **Definition** and **Sample Sentence**.  
    * *Feature:* **"Generate More" Button**. Clicking this calls **Generation-agent** (mode: Elaboration) to display analogies, fun facts, or mnemonics.  
  * **Actions:** \-\> (Next), I know it (Mastery), \<- (Previous).  
* **Progress Save:** System saves state if exited halfway.  
* **Post-Session:** System calls **Learning-agent** to generate a session summary and recommendation.

#### **D. Gardener Profile & Vocabulary Log**

* **Profile:** Add/Remove Gardeners; switch active profile (updates history context).  
* **Log:** Tabular view of words from last 3 months. Columns: Word, Definition, Review Count, Notes.

### **3\. Technical Specifications (MVP)**

#### **A. Database Schema**

* **parent:** user\_id, gmail, child\_ids (array), timestamp.  
* **child:** child\_id, name, age, grade, state.  
* **gardener-input:** word\_id, word, definition, sentence, child\_id, timestamp.  
* **user-input-action:** word\_id, notes, is\_starred, is\_deleted.  
* **flashcard:** child\_id, word\_id, interaction\_type ("know\_it", "next"), next\_review\_date, forgetting\_curve\_score.

#### **B. Agentic AI Specs**

| Agent Name | Role | Input | Output |
| :---- | :---- | :---- | :---- |
| **Generation-agent** | Definitions, Sentences, "Generate More" | Word, Age, Mode (Def/Elaborate) | Definition, Sentence, Fun\_Fact |
| **Picture-agent** | Visual Aids | Word, Definition | Image URL |
| **Evaluation-agent** | Safety & Grading | Word, Generated Content | Is\_Valid, Is\_Safe, Grade\_Level |
| **Learning-agent** | Progress Summary | Session Stats | Summary\_Text, Recommendation |

#### 

#### **Test Suite A: Authentication & Stability (High Priority)**

* **TC-001: Single Sign-On Flow (Fix verification)**  
  * *Step:* Click "Sign in with Google" \-\> Complete Google Auth.  
  * *Expectation:* User is redirected immediately to the Main Page.  
  * *Bug Check:* Ensure user is **not** looped back to the "Sign in" page a second time.  
* **TC-002: Session Persistence**  
  * *Step:* Sign in \-\> Refresh page \-\> Navigate to "Vocabulary" tab.  
  * *Expectation:* User remains signed in; Vocabulary list loads without being empty.

#### **Test Suite B: Input Validation (The "aaa" Bug)**

* **TC-003: Invalid Word Input**  
  * *Step:* Input "aaa" or "sdjkf" into the main input field \-\> Click Learn.  
  * *Expectation:* Evaluation-agent returns Is\_Valid\_Word \= False. UI displays a specific error message (e.g., "This doesn't look like a valid word").  
  * *Bug Check:* Ensure the system does **not** hallucinate a definition for "aaa" and does not show a blank/empty card.  
* **TC-004: Valid Word Input**  
  * *Step:* Input "Apple" \-\> Click Learn.  
  * *Expectation:* Card renders with Definition, Sentence, and "Paint a Picture" button.

#### **Test Suite C: AI Feature Functionality**

* **TC-005: Image Generation**  
  * *Step:* Input a valid word \-\> Click "Paint a picture".  
  * *Expectation:* A relevant image renders within \<5 seconds.  
  * *Bug Check:* If image generation fails, the UI should show a graceful "Could not paint picture" message rather than a broken image icon.  
* **TC-006: Age Appropriateness**  
  * *Step:* Set Gardener Age to 8\. Input a complex word (e.g., "Existentialism").  
  * *Expectation:* Definition is simplified for an 8-year-old (checked via manual review of 10 sample words).

#### **Test Suite D: Flashcard Logic**

* **TC-007: Progress Retention**  
  * *Step:* Start Flashcard session (10 words) \-\> Complete 5 \-\> Click "Exit" \-\> Return to Flashcard tab.  
  * *Expectation:* System asks "Continue from last time?" \-\> If Yes, starts at word 6\.  
* **TC-008: Interaction Logging**  
  * *Step:* In Flashcard mode, click "I know it" on Word A.  
  * *Expectation:* flashcard table updates for Word A with interaction\_type="know\_it".

---

## **Phase 2: Future Roadmap**

*Status: Backlog / Design Phase (Features from original Master Plan)*

### **1\. Advanced Content & Engagement**

* **Story Mode (The "Story Agent"):**  
  * *Concept:* User selects 5-10 words from their garden. The AI weaves them into a short, cohesive story to provide contextual learning.  
* **Audio Support:**  
  * *Concept:* Text-to-Speech (TTS) for all words and definitions to support auditory learning.

### **2\. Gamification (The "Visual Garden")**

* **Garden Dashboard:**  
  * *Concept:* Move away from the tabular "Vocabulary Log".  
  * *Visualization:* Words appear as plants. "Mastered" words bloom into flowers; "Neglected" words wilt.  
  * *Mechanic:* Daily streaks water the garden.

### **3\. Validation & Testing**

* **Quiz Mode (/test route):**  
  * *Concept:* Formal testing beyond self-reported flashcards.  
  * *Types:*  
    * Fill-in-the-blank.  
    * Multiple Choice (Select correct definition).  
    * Spelling challenge (Audio plays \-\> User types word).  
* **External Certifications:**  
  * *Concept:* Mapping progress to standard CEFR levels (A1-C2) or grade-level benchmarks.

### **4\. Community**

* **Social Features:**  
  * *Concept:* Ability to share "Gardens" or specific word lists with other users/parents.

