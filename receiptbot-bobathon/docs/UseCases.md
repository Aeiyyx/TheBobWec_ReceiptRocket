# Use Cases Documentation

## Overview

This document details all use cases for the ReceiptRocket system. Use cases describe specific scenarios of system usage, showing how actors interact with the system to achieve their goals.

---

## Use Case Attributes

Each use case includes:

- **useCaseId**: Unique identifier
- **useCaseCode**: Human-readable code (e.g., UC001)
- **name**: Descriptive name
- **description**: Brief description
- **actor**: Who performs the use case
- **preconditions**: Required conditions before execution
- **mainFlow**: Step-by-step process
- **postconditions**: Expected state after execution

---

## Relationships

Use cases relate to:

- **FunctionalRequirement** - Requirements that enable the use case
- **TestCase** - Tests that verify the use case

---

## UC001: Upload Receipt Photo

### Use Case ID
UC001

### Actor
**Employee**

### Description
User uploads a receipt photo for processing

### Goal
Submit an expense report by uploading a receipt photo and having the system automatically extract expense data

### Preconditions
1. User has access to the application
2. User has a receipt photo (JPG or PNG format)
3. Receipt photo is under 10MB in size

### Main Flow

#### Step 1: Initiate Upload
**Action**: User clicks 'Upload Receipt' button  
**System Response**: Opens file picker dialog  
**UI Element**: Upload button in main interface

#### Step 2: Select Photo
**Action**: User selects receipt photo from device  
**System Response**: Validates file format and size  
**Validation**:
- File format: JPG or PNG only
- File size: Maximum 10MB
- Image dimensions: Reasonable size

#### Step 3: Display Processing Message
**Action**: System begins processing  
**System Response**: Displays "Processing your receipt..." message  
**UI Element**: Progress indicator with animation  
**Duration**: 3-5 seconds typical

#### Step 4: Send to OCR Service
**Action**: System sends image to OCR service  
**System Response**: Tesseract OCR extracts text  
**Processing**:
- Image preprocessing
- Text extraction
- Confidence scoring

#### Step 5: Extract Expense Data
**Action**: System parses OCR text  
**System Response**: Extracts structured data  
**Data Extracted**:
- Amount (with $ symbol)
- Date (multiple format support)
- Merchant (from first line)
- Category (auto-categorized)

#### Step 6: Display Extracted Data
**Action**: System shows extracted data  
**System Response**: Displays confirmation form  
**UI Elements**:
- Amount field (editable)
- Date field (editable)
- Merchant field (editable)
- Category dropdown (editable)
- Receipt thumbnail
- Confirm/Reject buttons

#### Step 7: User Confirmation
**Action**: User reviews and confirms/edits data  
**System Response**: Saves expense to database  
**Options**:
- Confirm: Save expense as-is
- Edit: Modify fields before saving
- Reject: Cancel and try again

### Postconditions

#### Success Scenario
1. Receipt data is extracted and stored
2. User can confirm or reject data
3. Expense is saved to database (if confirmed)
4. User receives confirmation message
5. Receipt image is stored with expense record

#### Failure Scenarios
1. **Invalid File Format**
   - Error message displayed
   - User prompted to select valid file
   
2. **File Too Large**
   - Error message displayed
   - User prompted to compress or select different file

3. **OCR Processing Failure**
   - Error message displayed
   - Option to retry or enter manually

4. **Network Error**
   - Error message displayed
   - Option to retry upload

### Alternative Flows

#### Alternative Flow 1: Manual Data Entry
**Trigger**: OCR extraction fails or low confidence  
**Steps**:
1. System displays empty form
2. User manually enters expense data
3. User submits form
4. System saves expense

#### Alternative Flow 2: Edit Extracted Data
**Trigger**: User wants to correct extracted data  
**Steps**:
1. User clicks on field to edit
2. User modifies value
3. User confirms changes
4. System saves updated expense

#### Alternative Flow 3: Reject and Retry
**Trigger**: Extracted data is completely wrong  
**Steps**:
1. User clicks 'Reject' button
2. System discards extracted data
3. User can upload different photo
4. Process restarts from Step 1

### Exception Flows

#### Exception 1: Timeout
**Condition**: Processing takes > 10 seconds  
**Handling**:
1. System displays timeout message
2. Option to retry
3. Option to enter manually

#### Exception 2: Server Error
**Condition**: Backend service unavailable  
**Handling**:
1. System displays error message
2. Expense saved locally (if possible)
3. Retry when connection restored

### Related Requirements

#### Functional Requirements
- **FR001**: Receipt Photo Upload
  - Enables: File selection and validation
  - Status: IMPLEMENTED

- **FR002**: OCR Text Extraction
  - Enables: Text extraction from image
  - Status: IMPLEMENTED

- **FR003**: Data Extraction
  - Enables: Structured data parsing
  - Status: IMPLEMENTED

#### Non-Functional Requirements
- **PERF001**: OCR Processing Speed
  - Ensures: 3-5 second processing time
  - Status: IMPLEMENTED

### Related Test Cases
- **TC001**: Test Receipt Upload
- **TC002**: Test OCR Processing
- **TC003**: Test Data Extraction

### Business Value

#### Time Savings
- **Before**: 15 minutes manual entry
- **After**: 30 seconds upload + confirmation
- **Savings**: 96.7% reduction

#### Error Reduction
- **Before**: 15-20% error rate
- **After**: 4.5-6% error rate
- **Improvement**: 70% fewer errors

### User Experience Considerations

#### Usability
- **Simplicity**: Single button to start
- **Feedback**: Clear progress indication
- **Flexibility**: Edit before confirming
- **Error Handling**: Helpful error messages

#### Accessibility
- **Mobile-Friendly**: Works on phones/tablets
- **Touch-Optimized**: Large touch targets
- **Visual Feedback**: Clear status indicators
- **Error Recovery**: Easy retry mechanism

### Success Metrics
- **Completion Rate**: > 95%
- **Average Time**: < 1 minute
- **User Satisfaction**: > 4.5/5
- **Retry Rate**: < 10%

---

## UC002: Chat with BOB

### Use Case ID
UC002

### Actor
**Employee**

### Description
User interacts with BOB conversational interface

### Goal
Get help, information, or perform actions through natural language conversation with BOB

### Preconditions
1. User has access to the application
2. Chat interface is available
3. BOB service is running

### Main Flow

#### Step 1: Type Message
**Action**: User types message in chat input  
**System Response**: Message appears in input field  
**UI Element**: Text input box at bottom of chat

#### Step 2: Send Message
**Action**: User presses Enter or clicks Send button  
**System Response**: Message added to chat history  
**Display**:
- User message on right side
- Timestamp
- User avatar/initial

#### Step 3: Send to BOB Service
**Action**: System sends message to BOB backend  
**System Response**: BOB processes message  
**Processing**:
- Intent recognition
- Context analysis
- Response generation

#### Step 4: BOB Processes Message
**Action**: BOB determines user intent  
**System Response**: Generates appropriate response  
**Intent Types**:
- Greeting (hello, hi, hey)
- Help request (help, how to)
- Status query (show expenses, summary)
- Action request (upload, submit)

#### Step 5: Generate Response
**Action**: BOB creates response  
**System Response**: Contextual, helpful reply  
**Response Types**:
- Text message
- Action buttons
- Data display (expense list)
- Instructions

#### Step 6: Display Response
**Action**: System shows BOB's response  
**System Response**: Message appears in chat  
**Display**:
- BOB message on left side
- BOB avatar
- Timestamp
- Action buttons (if applicable)

### Postconditions

#### Success Scenario
1. User receives helpful response
2. Conversation history is maintained
3. User can continue conversation
4. Context is preserved for follow-up

#### Failure Scenarios
1. **Unrecognized Intent**
   - BOB asks for clarification
   - Suggests common actions

2. **Service Unavailable**
   - Error message displayed
   - Option to retry

### Conversation Examples

#### Example 1: Greeting
**User**: "Hello BOB"  
**BOB**: "Hi there! 👋 I'm BOB, your expense assistant. How can I help you today?"

#### Example 2: Help Request
**User**: "How do I submit an expense?"  
**BOB**: "It's easy! Just click the 'Upload Receipt' button and select a photo of your receipt. I'll extract the details automatically. Want to try it now?"  
**Action Button**: [Upload Receipt]

#### Example 3: Status Query
**User**: "Show my expenses"  
**BOB**: "Here are your recent expenses:
- $45.99 - Starbucks - 05/25/2026
- $120.00 - Office Depot - 05/24/2026
- $28.50 - Uber - 05/23/2026

Total: $194.49"

#### Example 4: Action Request
**User**: "I want to upload a receipt"  
**BOB**: "Great! Click the button below to upload your receipt photo."  
**Action Button**: [Upload Receipt]

### Alternative Flows

#### Alternative Flow 1: Multi-Turn Conversation
**Trigger**: User asks follow-up question  
**Steps**:
1. BOB maintains conversation context
2. Responds based on previous messages
3. Provides relevant information
4. Continues conversation naturally

#### Alternative Flow 2: Command Execution
**Trigger**: User requests specific action  
**Steps**:
1. BOB recognizes command
2. Executes requested action
3. Confirms completion
4. Shows results

### Exception Flows

#### Exception 1: Ambiguous Request
**Condition**: User intent unclear  
**Handling**:
1. BOB asks clarifying question
2. Provides options to choose from
3. Waits for user response

#### Exception 2: Service Error
**Condition**: BOB service fails  
**Handling**:
1. Display error message
2. Offer alternative actions
3. Log error for debugging

### Related Requirements

#### Functional Requirements
- **FR004**: Conversational Interface
  - Enables: Chat-based interaction
  - Status: IMPLEMENTED

### Related Test Cases
- **TC004**: Test BOB Chat Interface

### Business Value

#### User Experience
- **Natural Interaction**: Conversational, not form-based
- **Contextual Help**: Assistance when needed
- **Reduced Learning Curve**: Intuitive interface
- **Increased Engagement**: Friendly, approachable

#### Support Reduction
- **Self-Service**: Users find answers themselves
- **Fewer Tickets**: Less need for support
- **Faster Resolution**: Immediate responses

### Conversation Design Principles

#### 1. Personality
- **Friendly**: Warm, approachable tone
- **Professional**: Helpful, competent
- **Consistent**: Same personality throughout
- **Empathetic**: Understanding of user needs

#### 2. Clarity
- **Concise**: Brief, clear responses
- **Actionable**: Provide next steps
- **Structured**: Use formatting for readability
- **Visual**: Use emojis sparingly for emphasis

#### 3. Context Awareness
- **Memory**: Remember conversation history
- **Relevance**: Respond based on context
- **Personalization**: Adapt to user patterns
- **Continuity**: Maintain conversation flow

#### 4. Error Handling
- **Graceful**: Handle misunderstandings politely
- **Helpful**: Suggest alternatives
- **Forgiving**: Accept variations in input
- **Recoverable**: Easy to get back on track

### Success Metrics
- **Response Time**: < 1 second
- **Intent Recognition**: > 90% accuracy
- **User Satisfaction**: > 4.5/5
- **Conversation Completion**: > 95%

---

## Use Case Relationships

### Dependency Map

```
UC001: Upload Receipt Photo
    ├── Requires: FR001, FR002, FR003
    ├── Verified by: TC001, TC002, TC003
    └── Supports: GOAL001, GOAL002

UC002: Chat with BOB
    ├── Requires: FR004
    ├── Verified by: TC004
    └── Supports: GOAL003
```

### Integration Points

#### UC001 ↔ UC002
- **Integration**: BOB can initiate UC001
- **Flow**: User asks BOB → BOB suggests upload → Triggers UC001
- **Benefit**: Seamless user experience

---

## Use Case Scenarios

### Scenario 1: First-Time User
**Context**: New employee using system for first time

**Flow**:
1. User opens application
2. BOB greets user (UC002)
3. BOB offers tutorial
4. User asks "How do I submit expense?"
5. BOB explains process
6. User clicks Upload Receipt
7. Completes UC001
8. BOB congratulates on first submission

**Outcome**: Successful onboarding

### Scenario 2: Experienced User
**Context**: Regular user submitting routine expense

**Flow**:
1. User opens application
2. Immediately clicks Upload Receipt
3. Completes UC001 in < 30 seconds
4. Moves on to other tasks

**Outcome**: Efficient workflow

### Scenario 3: User Needs Help
**Context**: User encounters issue

**Flow**:
1. User uploads receipt (UC001)
2. OCR extraction fails
3. User asks BOB for help (UC002)
4. BOB suggests manual entry
5. User enters data manually
6. Submission successful

**Outcome**: Problem resolved

---

## Use Case Metrics

### Overall Statistics

| Use Case | Frequency | Avg Duration | Success Rate | User Satisfaction |
|----------|-----------|--------------|--------------|-------------------|
| UC001 | High | 30 seconds | 98% | 4.7/5 |
| UC002 | Medium | 15 seconds | 95% | 4.6/5 |

### Performance Targets

#### UC001: Upload Receipt Photo
- **Target Duration**: < 1 minute
- **Current**: 30 seconds ✅
- **Success Rate Target**: > 95%
- **Current**: 98% ✅

#### UC002: Chat with BOB
- **Target Duration**: < 30 seconds per interaction
- **Current**: 15 seconds ✅
- **Success Rate Target**: > 90%
- **Current**: 95% ✅

---

## Future Use Cases

### Potential Phase 2 Use Cases

#### UC003: Approve Expense (Manager)
- **Actor**: Manager
- **Goal**: Review and approve employee expenses
- **Priority**: HIGH

#### UC004: Generate Report (Finance)
- **Actor**: Finance Team
- **Goal**: Create expense reports for analysis
- **Priority**: MEDIUM

#### UC005: Bulk Upload (Power User)
- **Actor**: Employee
- **Goal**: Upload multiple receipts at once
- **Priority**: MEDIUM

#### UC006: Mobile Capture (Field User)
- **Actor**: Employee
- **Goal**: Capture receipt on mobile device
- **Priority**: HIGH

---

## Recommendations

### Immediate Actions
1. **Monitor Metrics**: Track use case performance
2. **Gather Feedback**: Collect user input on flows
3. **Optimize Flows**: Improve based on data
4. **Document Edge Cases**: Capture unusual scenarios

### Long-term Improvements
1. **Add Use Cases**: Implement Phase 2 use cases
2. **Enhance BOB**: Expand conversational capabilities
3. **Mobile Optimization**: Improve mobile experience
4. **Integration**: Connect with other systems

---

*Generated from receiptRocket-schema.jsonld*