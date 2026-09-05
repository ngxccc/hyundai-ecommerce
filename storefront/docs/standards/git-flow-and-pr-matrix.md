# Git Flow & Pull Request Standards

## 1. Branch Naming Conventions

All branches created in this repository MUST follow the strict prefix naming conventions:

- `feature/<kebab-case-name>` — New feature implementation (e.g. `feature/quote-negotiation`, `feature/product-faceted-search`).
- `fix/<kebab-case-name>` — Bugfix on existing features.
- `hotfix/<kebab-case-name>` — Urgent production patch.
- `core/<kebab-case-name>` — Major architectural or database schema refactor (Tier 3).

---

## 2. Conventional Commits Standard

All commit messages MUST follow the format: `<type>(<scope>): <summary>`

- **Header Length Limit**: $\le 72\text{ characters}$.
- **Types**:
  - `feat`: A new user-facing feature.
  - `fix`: A bug fix.
  - `refactor`: Code change that neither fixes a bug nor adds a feature.
  - `test`: Adding or refactoring tests and fixtures.
  - `docs`: Documentation only changes.
  - `chore`: Build scripts, tooling, or package updates.
- **Scope**: Lowercase module/package name (e.g., `catalog`, `order`, `quote`, `warehouse`, `payment`, `storefront`, `admin`, `db`, `shared`, `ui`).

---

## 2.1. Issue Linking & Closing Protocol

- **Atomic Commit Messages**:
  - Specific Sub-Issue / Child Ticket: Use `Resolves: #<child_id>` or `Closes: #<child_id>` in the commit footer.
  - Parent Epic / Feature Issue: Use `Ref: #<parent_id>` to link without prematurely closing the epic.
- **Pull Request Descriptions**:
  - Declare `Resolves #<child_id>` and `Closes #<parent_id>` under `## Linked Issues` for automated GitHub tracking and auto-closure on merge.

## 3. Adaptive 3-Tier PR Matrix

| Tier                    | Scope & Risk                                                                    | Requirements                                                         |
| :---------------------- | :------------------------------------------------------------------------------ | :------------------------------------------------------------------- |
| **Tier 1 (Patch)**      | Typos, minor documentation, patch dependencies.                                 | Single-sentence PR summary, low ceremony.                            |
| **Tier 2 (Standard)**   | Feature, bugfix, routine refactor (Default).                                    | Conventional Commits, 5-section PR body, passing test logs.          |
| **Tier 3 (Enterprise)** | Core architecture, DB schema changes, security patches, breaking changes (`!`). | Atomic sliced commits, mandatory ADR/RFC link, human audit evidence. |

---

## 4. Human Audit & Verification Protocol (<critical>)

1. **Inspection & Staging Proposal Only**: When requested to commit, AI agents MUST check `git status` / `git diff`, propose the atomic commit slicing plan, and display the formatted Conventional Commit message for human review.
2. **Explicit Confirmation Required**: AI agents MUST NEVER execute `git commit` until the human operator responds with explicit approval (e.g., "xác nhận commit", "đồng ý commit", "execute commit").
