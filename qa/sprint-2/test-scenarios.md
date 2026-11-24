# Sprint 2 Test Scenarios

Sprint 2 covers text-message sending, delivery, validation, persistence, and read receipts.

| Scenario ID | Area | Scenario |
|---|---|---|
| S2-MSG-01 | Messaging | Send a valid message to an existing private conversation. |
| S2-MSG-02 | Messaging | Broadcast `message:new` only within the conversation room. |
| S2-MSG-03 | Messaging | Normalize and persist valid text content. |
| S2-MSG-04 | Messaging | Reject empty, invalid, oversized, or unauthorized message data. |
| S2-MSG-05 | Messaging | Mark received messages as read and emit read receipts. |
| S2-MSG-06 | Messaging | Preserve sent messages across reconnection and history retrieval. |

Detailed executable cases: `test-cases.xlsx`, rows with prefix `MSG-`.
