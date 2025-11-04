---
title: "System Design: Fine-Grained Control with Attribute-Based Access Control (ABAC)"
date: "2024-07-26"
description: "Explore Attribute-Based Access Control (ABAC), a powerful authorization model that provides dynamic, context-aware, and fine-grained control using policies and attributes."
tags: ["System Design", "Security", "Authorization", "ABAC", "Golang"]
---

## System Design: Fine-Grained Control with Attribute-Based Access Control (ABAC)

In our previous post, we explored [Role-Based Access Control (RBAC)](/blog/system-design/system-design-role-based-access-control-rbac), a model that simplifies permissions by assigning them to roles. While effective for many scenarios, RBAC can be too rigid for situations requiring dynamic, context-aware authorization.

For example, how would you enforce a rule like: "A doctor can view a patient's medical record only if they are in the same department and it's during their working hours"? This is where **Attribute-Based Access Control (ABAC)** shines. ABAC is a highly flexible authorization model that grants access based on policies that evaluate attributes of the user, the resource, the action, and the environment.

### What is ABAC?

ABAC, also known as Policy-Based Access Control (PBAC), makes authorization decisions by evaluating rules against the attributes of the entities involved in a request. Instead of asking "Does this user's role have permission?", ABAC asks "Do the attributes of the user, resource, and environment satisfy the policy for this action?"

The core components of ABAC are:
1.  **Subject Attributes:** Characteristics of the user requesting access (e.g., age, department, security clearance, role).
2.  **Action Attributes:** The specific action being attempted (e.g., `read`, `write`, `delete`, `approve`).
3.  **Resource Attributes:** Characteristics of the resource being accessed (e.g., document owner, creation date, sensitivity level, status).
4.  **Environmental Attributes:** Contextual information about the request (e.g., time of day, location of the user, current system threat level).

These attributes are fed into a **Policy Engine**, which evaluates them against a set of policies to produce a `Permit` or `Deny` decision.

```mermaid
graph TD
    subgraph Request Context
        S[Subject Attributes<br>- Role: Doctor<br>- Department: Cardiology]
        A[Action<br>- read]
        R[Resource Attributes<br>- Type: Medical Record<br>- Owner: Patient X<br>- Department: Cardiology]
        E[Environmental Attributes<br>- Time: 10:00 AM<br>- IP Address: 192.168.1.10]
    end

    subgraph Policy Decision Point (PDP)
        PolicyEngine{"Policy Engine"}
        Policy1["Policy 1: Doctors can read records in their own department."]
        Policy2["Policy 2: Access is only allowed during working hours (9-5)."]
        
        PolicyEngine -- Evaluates --> Policy1
        PolicyEngine -- Evaluates --> Policy2
    end

    S & A & R & E --> PolicyEngine
    
    PolicyEngine --> Decision{Permit / Deny}
```

In this model, access is not static. If the doctor tries to access the same record at 8 PM, the environmental attributes would change, Policy 2 would fail, and access would be denied.

### ABAC vs. RBAC

| Feature | Role-Based Access Control (RBAC) | Attribute-Based Access Control (ABAC) |
| :--- | :--- | :--- |
| **Logic** | Access is based on the user's role. | Access is based on policies evaluating attributes. |
| **Granularity** | Coarse-grained. | Fine-grained and context-aware. |
| **Flexibility** | Static. Changing permissions requires changing role definitions. | Dynamic. Policies can adapt to changing attributes without code changes. |
| **Example** | "Editors can edit articles." | "Editors can edit articles they own, if the article's status is 'draft'." |
| **Complexity** | Simpler to implement and manage for basic scenarios. | More complex to set up but scales better for complex rules. |

### Benefits of ABAC

-   **Fine-Grained Control:** Allows for incredibly specific and detailed authorization rules.
-   **Dynamic and Context-Aware:** Policies can adapt to real-time changes in user, resource, or environmental attributes.
-   **Scalability:** Manages complex rulesets more effectively than RBAC's "role explosion" problem. You add new policies, not new roles.
-   **Externalized Logic:** Authorization logic is defined in policies, not hardcoded in the application. This makes it easier to manage, audit, and update.

### Implementing a Simple ABAC System in Go

Let's build a basic ABAC policy engine in Go. We'll define structures for the request context and policies, and then create an engine to evaluate them.

```go
package main

import (
	"fmt"
	"time"
)

// --- Attribute Definitions ---

type Subject struct {
	Attributes map[string]interface{}
}

type Resource struct {
	Attributes map[string]interface{}
}

type Action struct {
	Name string
}

type Environment struct {
	Attributes map[string]interface{}
}

// Policy defines a rule to be evaluated.
type Policy struct {
	Description string
	// The evaluation function returns true if the policy is satisfied.
	Evaluate func(s Subject, r Resource, a Action, e Environment) bool
}

// PolicyEngine holds all the policies.
type PolicyEngine struct {
	Policies []Policy
}

// Check evaluates a request against all policies.
// For simplicity, we'll use an "allow-overrides" approach: if any policy permits, access is granted.
func (pe *PolicyEngine) Check(s Subject, r Resource, a Action, e Environment) bool {
	for _, p := range pe.Policies {
		if p.Evaluate(s, r, a, e) {
			fmt.Printf("Policy matched: '%s'\n", p.Description)
			return true // Permit
		}
	}
	return false // Deny
}

func main() {
	// --- Define Policies ---
	engine := &PolicyEngine{
		Policies: []Policy{
			{
				Description: "A user can read a document if they are the owner.",
				Evaluate: func(s Subject, r Resource, a Action, e Environment) bool {
					if a.Name != "read" {
						return false
					}
					owner, okOwner := r.Attributes["owner"].(string)
					userID, okUser := s.Attributes["id"].(string)
					return okOwner && okUser && owner == userID
				},
			},
			{
				Description: "A user in the 'auditors' group can read any document during business hours.",
				Evaluate: func(s Subject, r Resource, a Action, e Environment) bool {
					if a.Name != "read" {
						return false
					}
					group, okGroup := s.Attributes["group"].(string)
					if !okGroup || group != "auditors" {
						return false
					}
					
					now, okTime := e.Attributes["time"].(time.Time)
					if !okTime {
						return false
					}
					
					return now.Hour() >= 9 && now.Hour() < 17
				},
			},
		},
	}

	// --- Simulate Requests ---

	// Scenario 1: Alice tries to read her own document.
	fmt.Println("--- Scenario 1: Alice reads her own document ---")
	subject1 := Subject{Attributes: map[string]interface{}{"id": "user-alice"}}
	resource1 := Resource{Attributes: map[string]interface{}{"owner": "user-alice"}}
	action1 := Action{Name: "read"}
	env1 := Environment{Attributes: map[string]interface{}{"time": time.Now()}}
	
	if engine.Check(subject1, resource1, action1, env1) {
		fmt.Println("Result: PERMIT\n")
	} else {
		fmt.Println("Result: DENY\n")
	}

	// Scenario 2: Bob, an auditor, tries to read Alice's document during business hours.
	fmt.Println("--- Scenario 2: Bob (auditor) reads Alice's document (during hours) ---")
	subject2 := Subject{Attributes: map[string]interface{}{"id": "user-bob", "group": "auditors"}}
	resource2 := Resource{Attributes: map[string]interface{}{"owner": "user-alice"}}
	action2 := Action{Name: "read"}
	env2 := Environment{Attributes: map[string]interface{}{"time": time.Date(2024, 1, 1, 14, 0, 0, 0, time.UTC)}}

	if engine.Check(subject2, resource2, action2, env2) {
		fmt.Println("Result: PERMIT\n")
	} else {
		fmt.Println("Result: DENY\n")
	}
	
	// Scenario 3: Bob, an auditor, tries to read Alice's document outside business hours.
	fmt.Println("--- Scenario 3: Bob (auditor) reads Alice's document (after hours) ---")
	subject3 := Subject{Attributes: map[string]interface{}{"id": "user-bob", "group": "auditors"}}
	resource3 := Resource{Attributes: map[string]interface{}{"owner": "user-alice"}}
	action3 := Action{Name: "read"}
	env3 := Environment{Attributes: map[string]interface{}{"time": time.Date(2024, 1, 1, 20, 0, 0, 0, time.UTC)}}

	if engine.Check(subject3, resource3, action3, env3) {
		fmt.Println("Result: PERMIT\n")
	} else {
		fmt.Println("Result: DENY\n")
	}
}
```

### Challenges and Considerations

-   **Complexity:** Designing and managing a large number of policies can be complex. It requires careful planning and a clear understanding of the organization's security requirements.
-   **Performance:** The policy engine can become a bottleneck if it has to evaluate many complex policies for every single API request. Caching decisions and optimizing policy evaluation are crucial.
-   **Policy Auditing:** It can be challenging to answer the question, "Who can access this resource?" You may need to simulate requests with different attributes to fully understand the effective permissions.

For production systems, instead of building a policy engine from scratch, it's common to use a dedicated open-source project like **Open Policy Agent (OPA)**, which provides a declarative language (Rego) for writing policies and a highly optimized engine for evaluating them.

### Conclusion

Attribute-Based Access Control provides a powerful, flexible, and fine-grained approach to authorization. By decoupling authorization logic from application code and using a rich set of attributes, ABAC can handle complex, context-aware scenarios that are difficult to model with traditional RBAC. While it introduces more complexity, it is the future of authorization for dynamic, large-scale, and security-critical systems.

In our next post, we'll look at **Policy-Based Authorization** in more detail, exploring how tools like Open Policy Agent can be used to externalize and manage authorization logic as a separate microservice.
---
