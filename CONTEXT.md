# Hyundai Industrial Machinery Commerce

A B2B quotation, commercial negotiation, and distribution platform for heavy industrial and commercial machinery.

## Quotation & Commercial Negotiation

**Quotation**:
A formal, binding commercial proposal issued to a prospective buyer detailing machinery pricing, line-item discounts, and legal commercial terms, identified by a canonical code (`BG-YYYYMM-XXXX`).
_Avoid_: Order, Invoice, Bill, Deal, Cart

**Request for Quotation (RFQ)**:
An initial commercial inquiry submitted by a prospective buyer specifying required machinery items, target quantities, and optional target pricing prior to sales negotiation.
_Avoid_: Purchase Request, Checkout, Basket, Shopping Cart

**Quote Status**:
The discrete lifecycle stage of a quotation (`DRAFT`, `SUBMITTED`, `NEGOTIATING`, `APPROVED`, `REJECTED`, `EXPIRED`).
_Avoid_: Order Status, Payment Status, Fulfillment Stage

**Pricing Cockpit**:
The administrative interface where sales personnel inspect requested machinery, calculate profit margins, adjust per-unit rates, and finalize commercial commitments.
_Avoid_: Order Editor, Checkout Admin, Price Modifier

**Agreed Unit Price**:
The definitive per-unit price accepted by both the buyer and the sales representative after commercial negotiation.
_Avoid_: Final Price, Custom Price, Discounted Price, Net Price

**Customer Requested Price**:
An optional, non-binding target price suggested by the buyer upon submitting an RFQ, serving purely as a negotiation reference.
_Avoid_: Bid Price, Offer Price, Desired Price, Target Budget

**Commercial Terms**:
The five mandatory business conditions governing an approved quotation (validity period, payment schedule, warranty duration, delivery lead time, and handover location).
_Avoid_: Policies, Contract Rules, Terms of Service, Legal Clauses

**Custom Line Item**:
A specialized machinery part, ancillary attachment, or engineering adaptation that is negotiated as part of a quotation but does not exist in standard catalog inventory.
_Avoid_: Miscellaneous, Extra, Custom Product, Add-on

## Industrial Machinery Catalog

**Product**:
A heavy-duty commercial machine, engine, generator, or industrial pump distributed by the organization.
_Avoid_: Item, Goods, Merchandise, Article, SKU

**Quote-Only Product**:
A high-value machinery asset whose public pricing is withheld from public storefront displays, requiring buyers to submit an RFQ to obtain commercial pricing.
_Avoid_: Hidden Price, Contact Price, Secret Product, Unpriced Asset

**Specification**:
A structured technical rating defining machinery capability (such as KVA output rating, engine displacement, fuel consumption, or phase configuration).
_Avoid_: Attribute, Feature, Detail, Parameter

**Product Translation**:
A localized language representation (`vi`, `en`) containing the localized machine title, technical narrative, and URL slug associated with a primary product record.
_Avoid_: Multilingual Copy, Language Record, Localized Entity

## Identity, Access & Distribution Tiers

**Customer**:
A corporate entity, enterprise contractor, or prospective buyer requesting commercial machinery proposals.
_Avoid_: Client, User, Account, Shopper, Buyer

**Sales Representative**:
An internal authorized staff member responsible for reviewing incoming RFQs, adjusting pricing in the cockpit, negotiating terms, and issuing approved quotations.
_Avoid_: Agent, Employee, Seller, Staff, Admin

**Dealer Tier**:
A commercial classification assigned to verified wholesale distributors, establishing default discount schedules and approved credit limits.
_Avoid_: VIP Level, Customer Group, Membership Tier, Rank

## Inquiries & Fulfillment

**Lead**:
A preliminary commercial inquiry submitted through general storefront contact channels, representing a sales prospect prior to formal RFQ generation.
_Avoid_: Subscriber, Contact, Ticket, Message

**Warehouse**:
A physical storage and distribution depot where physical machinery inventory and spare parts are staged and tracked.
_Avoid_: Depot, Storage, Fulfillment Center, Store
